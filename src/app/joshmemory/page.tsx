import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "JoshHub | JoshMemory",
  description: "Live status and architecture for JoshMemory cross-machine project continuity.",
};

const layers = [
  {
    title: "Code truth",
    owner: "GitHub + live checkout",
    body: "The current repository, branch, HEAD and machine/API observations outrank any remembered handoff when they disagree.",
  },
  {
    title: "Shared continuity",
    owner: "JoshMemory",
    body: "Structured handoffs, durable project facts and accountability references are shared across machines as redacted continuity context.",
  },
  {
    title: "Cloud persistence",
    owner: "Private GitHub store",
    body: "Append-only UUID records live in a private backing repository, so no AVANCE, home or worker PC needs to stay powered on.",
  },
  {
    title: "Fleet execution",
    owner: "ForgeGrid / DadLAN",
    body: "The fleet can execute and return evidence, but it is not the authority for code history and it is no longer the uptime dependency for memory.",
  },
  {
    title: "Recovery",
    owner: "Action1",
    body: "Action1 remains an out-of-band bootstrap and recovery path for Windows machines, not the normal project-memory transport.",
  },
  {
    title: "Verification",
    owner: "AgentCheck / evidence systems",
    body: "JoshMemory stores provenance-rich references to independent evidence; storing a claim does not manufacture verification.",
  },
] as const;

const shared = [
  "Session handoffs / pause-resume bookmarks",
  "Durable project facts with provenance and supersession",
  "Accountability references to external evidence",
  "Canonical-repository identity across different checkout paths",
] as const;

const local = [
  "Raw Codex JSONL and complete ChatGPT exports",
  "The old per-machine SQLite/history corpus unless deliberately migrated",
  "Live machine observations and current working-tree state",
  "Verification artefacts owned by their original evidence systems",
] as const;

export default function JoshMemoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="AI development continuity"
        title="JoshMemory"
        subtitle="Pause on one computer. Resume on another. No always-on AVANCE PC required."
      />

      <div className="flex flex-wrap gap-2">
        <Badge>Cloud-backed</Badge>
        <Badge variant="outline">No always-on workstation</Badge>
        <Badge variant="outline">Private shared store</Badge>
        <Badge variant="muted">Live Git is authoritative</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-neutral-700 dark:text-slate-200">
          <p>
            JoshMemory now uses an existing private GitHub repository as its default always-available shared store when a development machine already has usable GitHub authentication. The public JoshMemory repository contains the software; private memory payloads stay out of the public source tree.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6 sm:text-sm">
            <div>Claude / Codex / Antigravity</div>
            <div>↓ existing GitHub authentication</div>
            <div>Private append-only JoshMemory store</div>
            <div>↓ handoffs + facts + accountability references</div>
            <div>Any authenticated development computer</div>
          </div>
          <p>
            An explicitly configured JoshMemory HTTP server is still supported, but it is optional. AVANCE-WS7 can be switched off without taking the GitHub-backed continuity store offline.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {layers.map((layer) => (
          <Card key={layer.title}>
            <CardHeader>
              <CardTitle>{layer.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              <p className="font-medium text-neutral-900 dark:text-slate-50">{layer.owner}</p>
              <p>{layer.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shared from anywhere</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              {shared.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Still local / separately authoritative</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              {local.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-700 dark:text-slate-200">
          <p>
            A fresh agent identifies the canonical repository, loads the latest relevant JoshMemory handoff, checks live branch/HEAD/dirty state, surfaces discrepancies, continues from the first still-valid next action, then saves a new checkpoint when useful.
          </p>
          <p className="font-medium text-neutral-900 dark:text-slate-50">
            Memory tells the next agent where to look. Live evidence tells it what is true now.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test and inspect</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <a
            className="rounded-md border border-border bg-card px-3 py-2 font-medium transition hover:bg-muted"
            href="/api/joshmemory-status"
          >
            Open live status API
          </a>
          <a
            className="rounded-md border border-border bg-card px-3 py-2 font-medium transition hover:bg-muted"
            href="https://github.com/joshualparris/JoshMemory"
            target="_blank"
            rel="noreferrer"
          >
            Open JoshMemory source
          </a>
          <a
            className="rounded-md border border-border bg-card px-3 py-2 font-medium transition hover:bg-muted"
            href="https://github.com/joshualparris/JoshMemory/blob/main/docs/CLOUD_CONTINUITY_HISTORY.md"
            target="_blank"
            rel="noreferrer"
          >
            Open architecture history
          </a>
          <a
            className="rounded-md border border-border bg-card px-3 py-2 font-medium transition hover:bg-muted"
            href="https://github.com/joshualparris/JoshDashboard4"
            target="_blank"
            rel="noreferrer"
          >
            Open private backing store
          </a>
        </CardContent>
      </Card>

      <p className="text-xs text-neutral-500 dark:text-slate-400">
        This public page exposes architecture/status only. It deliberately does not expose private handoff or memory payloads.
      </p>
    </div>
  );
}
