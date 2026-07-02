import fs from "fs";
import path from "path";

function contentTypeFromExt(ext: string) {
  const map: Record<string, string> = {
    html: "text/html; charset=utf-8",
    js: "application/javascript; charset=utf-8",
  mjs: "application/javascript; charset=utf-8",
  cjs: "application/javascript; charset=utf-8",
  ts: "application/javascript; charset=utf-8",
  tsx: "application/javascript; charset=utf-8",
    css: "text/css; charset=utf-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    json: "application/json",
    wasm: "application/wasm",
    map: "application/json",
    ico: "image/x-icon",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    txt: "text/plain; charset=utf-8",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

function resolveProjectRoot(appName: string) {
  const cwd = process.cwd();
  const workspaceRoot = path.resolve(cwd, "..");
  const resolved = path.resolve(workspaceRoot, appName);
  if (!resolved.startsWith(workspaceRoot)) throw new Error("Invalid app path");
  return resolved;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ app: string; slug?: string[] }> },
) {
  const { app: rawApp, slug: rawSlug } = await params;
  const app = decodeURIComponent(rawApp);
  const slug = rawSlug ?? [];
  const projectRoot = resolveProjectRoot(app);

  // locate the app root (the folder that contains index.html)
  const possibleIndexCandidates = [
    "index.html",
    path.join("dist", "index.html"),
    path.join("dist", "public", "index.html"),
    path.join("build", "index.html"),
    path.join("public", "index.html"),
    path.join("client", "index.html"),
  ];

  let appRootDir: string | null = null;
  let indexPath: string | null = null;

  // check root and common locations
  for (const c of possibleIndexCandidates) {
    const p = path.join(projectRoot, c);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      indexPath = p;
      appRootDir = path.dirname(p);
      break;
    }
  }

  // check one level deep (e.g., Dinner-Decider/Dinner-Decider/client/index.html)
  if (!indexPath) {
    try {
      const subs = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const s of subs) {
        if (!s.isDirectory()) continue;
        for (const c of possibleIndexCandidates) {
          const p = path.join(projectRoot, s.name, c);
          if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            indexPath = p;
            appRootDir = path.dirname(p);
            break;
          }
        }
        if (indexPath) break;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!appRootDir || !indexPath) return new Response("Not Found", { status: 404 });

  // If no slug, serve the located index file
  if (slug.length === 0) {
    let html = fs.readFileSync(indexPath, "utf8");

    // Rewrite absolute-root asset URLs (src="/..." href="/..." srcset="/...")
    // so they point under /external/<app>/... and are served by this route.
    const prefix = `/external/${encodeURIComponent(app)}/`;
    html = html.replace(/(\b(?:src|href|srcset)\s*=\s*["'])\//gi, `$1${prefix}`);

    return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Serve assets relative to the discovered appRootDir
  const relPath = path.join(...slug);
  const filePath = path.join(appRootDir, relPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).replace(".", "") || "";
    const ct = contentTypeFromExt(ext);
    return new Response(buffer, { status: 200, headers: { "Content-Type": ct } });
  }

  return new Response("Not Found", { status: 404 });
}
