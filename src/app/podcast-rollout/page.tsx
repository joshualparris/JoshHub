const apps = [
  {
    name: "UpskillApp",
    status: "fixed",
    detail:
      "Was blank because GitHub Pages served the Vite source index without compiling React. A proper Vite → Pages workflow was added and the rebuilt deployment completed successfully.",
    href: "https://joshualparris.github.io/UpskillApp/",
  },
  {
    name: "Campaign Copilot",
    status: "fixed",
    detail:
      "The older/deprecated Pages workflow was repaired and a successful deployment completed during the audit.",
  },
  {
    name: "Whirring Wilderness",
    status: "fixed",
    detail: "The Pages app was rebuilt successfully during the audit.",
  },
  {
    name: "Realms Atlas",
    status: "fixed",
    detail:
      "Pages checkout was blocked by two unused malformed gitlinks (OS-clone and fable). Both were removed from main and the next Pages deployment succeeded.",
    repo: "https://github.com/joshuaparris-max/realms-atlas",
  },
  {
    name: "DCS Companion",
    status: "working",
    detail: "Latest checked GitHub Pages workflow completed successfully.",
  },
  {
    name: "FaithHub",
    status: "working",
    detail: "Latest checked GitHub Pages workflow completed successfully.",
    href: "https://joshualparris.github.io/FaithHub/",
  },
  {
    name: "Waypoint",
    status: "working",
    detail: "Latest checked GitHub Pages workflow completed successfully.",
  },
  {
    name: "Midnight Line",
    status: "working",
    detail: "Latest checked GitHub Pages workflow completed successfully.",
  },
  {
    name: "DCS Professional Development",
    status: "working",
    detail: "Latest checked Vercel status for the podcast-dock update was successful.",
  },
  {
    name: "JoshBooksOnline",
    status: "working",
    detail: "Latest checked Vercel status for the books podcast dock was successful.",
  },
  {
    name: "AI Dungeon Master",
    status: "working",
    detail:
      "Latest checked Vercel status was successful. The dock is intentionally omitted from live /play so narration and game audio stay primary.",
  },
  {
    name: "FieldNotes",
    status: "working",
    detail: "Latest checked Vercel status for the IT troubleshooting dock was successful.",
  },
  {
    name: "LifeHub Dashboard",
    status: "working",
    detail:
      "Latest checked Vercel status was successful after the mobile navigation repair; shared podcast settings are integrated.",
  },
  {
    name: "Nebula Dice",
    status: "broken",
    detail:
      "The app build succeeded but GitHub rejected the final Pages deployment step. It remains red until hosting succeeds end-to-end.",
  },
  {
    name: "CanonRPG",
    status: "broken",
    detail:
      "The latest Vercel deployment observed during the audit was failing. It stays marked broken until a fresh production deployment is verified.",
    repo: "https://github.com/joshuaparris-max/CanonRPG",
  },
  {
    name: "JoshPlatform",
    status: "not deployed",
    detail:
      "An earlier rollout list incorrectly implied completion. Its podcast TODO was still unchecked at audit time, so it is not counted as implemented.",
  },
  {
    name: "AppFactory",
    status: "not deployed",
    detail:
      "The live app loaded, but the inspected production deployment did not contain the podcast dock. The feature is not counted as deployed yet.",
  },
];

const liveTests = [
  ["JoshHub", "https://josh-hub-joshualparris-projects.vercel.app/"],
  ["UpskillApp", "https://joshualparris.github.io/UpskillApp/"],
  ["FaithHub", "https://joshualparris.github.io/FaithHub/"],
  ["3layers", "https://3layers.vercel.app/"],
  ["Sword Coast", "https://sword-coast.vercel.app/"],
  ["Eleven Realms", "https://realms.vercel.app/"],
  ["DCS Prep", "https://dcs-prep.vercel.app/"],
];

const badgeClass = (status: string) => {
  if (status === "broken")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200";
  if (status === "not deployed")
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200";
  if (status === "fixed")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200";
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200";
};

export default function PodcastRolloutPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
          Deployment QA · 15 September 2026
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
          Podcast dock rollout
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-slate-300">
          The truthful cross-app status board. A green deployment or HTTP 200 is not enough: the
          actual app must render, its compiled assets must load, the dock must appear only where
          intended, and mobile controls must remain usable.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/70 dark:bg-emerald-950/30">
          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Working / repaired
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-950 dark:text-emerald-100">
            {apps.filter((app) => app.status === "working" || app.status === "fixed").length}
          </div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 dark:border-red-900/70 dark:bg-red-950/30">
          <div className="text-sm font-semibold text-red-800 dark:text-red-200">Still broken</div>
          <div className="mt-2 text-3xl font-bold text-red-950 dark:text-red-100">
            {apps.filter((app) => app.status === "broken").length}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/70 dark:bg-amber-950/30">
          <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Not actually deployed
          </div>
          <div className="mt-2 text-3xl font-bold text-amber-950 dark:text-amber-100">
            {apps.filter((app) => app.status === "not deployed").length}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
          The UpskillApp lesson
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-slate-300">
          The screenshot that triggered this audit showed a blank white app with only the podcast
          dock visible. GitHub Pages was serving Vite source directly, including{" "}
          <code>/src/main.tsx</code>, instead of a compiled production build. That is why every
          future test now checks meaningful rendered content rather than trusting the deployment
          badge alone.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">
              App-by-app audit
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-slate-300">
              Technical status captured from the related rollout chats and deployment checks.
            </p>
          </div>
        </div>
        <div className="grid gap-3">
          {apps.map((app) => (
            <article
              key={app.name}
              className="rounded-2xl border border-neutral-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-neutral-950 dark:text-white">{app.name}</h3>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass(app.status)}`}
                >
                  {app.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-slate-300">
                {app.detail}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {app.href ? (
                  <a
                    className="rounded-full border border-neutral-200 px-3 py-1.5 font-medium hover:bg-neutral-50 dark:border-slate-700 dark:hover:bg-slate-900"
                    href={app.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open live app ↗
                  </a>
                ) : null}
                {app.repo ? (
                  <a
                    className="rounded-full border border-neutral-200 px-3 py-1.5 font-medium hover:bg-neutral-50 dark:border-slate-700 dark:hover:bg-slate-900"
                    href={app.repo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open repo ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">
          Live test shortcuts
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-slate-300">
          Open these directly on your phone and verify the real app content as well as the podcast
          behaviour.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {liveTests.map(([name, href]) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-neutral-200 bg-white/80 p-4 font-medium text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
            >
              {name} <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
          Release checklist
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-slate-300">
          <li>
            Confirm the repo really contains the intended integration and its podcast TODO is
            truthful.
          </li>
          <li>Run the production build instead of serving Vite/React source directly.</li>
          <li>Confirm CI/deployment completes successfully.</li>
          <li>Open the real production URL and verify meaningful app content renders.</li>
          <li>Verify compiled JavaScript and CSS assets resolve.</li>
          <li>Check mobile layout so the dock never covers navigation or primary controls.</li>
          <li>
            Confirm the dock defaults OFF, Settings enables it, × disables it, and the choice
            survives reload.
          </li>
          <li>Check Spotify/deep links without assuming autoplay.</li>
          <li>Verify immersive/audio-heavy routes hide or collapse the dock as intended.</li>
          <li>Only then mark the deployment working.</li>
        </ol>
      </section>

      <p className="text-xs leading-5 text-neutral-500 dark:text-slate-400">
        Full technical record: <code>docs/podcast-rollout-audit-2026-09-15.md</code>. Public repo
        documentation intentionally excludes private account and conversation data.
      </p>
    </div>
  );
}
