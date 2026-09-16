import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "JoshHub | Engineering Principles",
  description: "JoshHub's canonical engineering standard, version history and rollout evidence.",
};

const rankings = [
  ["Original 26", "74", "Real-world instincts, but duplicated and lacked precedence."],
  ["v2", "84", "Better structure and evidence, but over-broad absolutes and stack leakage."],
  ["v3", "90", "Added recovery, contracts, concurrency, CI, dependency cost and decision records."],
  ["v4", "93", "Stronger agent wording and tiering, but introduced new absolutes."],
  ["v5", "95", "MUST/SHOULD/MAY, safer logging, truthful CI language and stack-agnostic rules."],
  ["v5.1", "97", "Tier composition, blocker protocol and canonical-repository governance."],
] as const;

const tenRules = [
  "Understand the system before changing it.",
  "Never optimise for producing a diff.",
  "Make the smallest change that completely solves the problem.",
  "Every important fact has one canonical owner of truth.",
  "Validate everything crossing a trust boundary.",
  "Important state changes remain correct under retries, failures and concurrency.",
  "Fail loudly inside the system and honestly to the user.",
  "The interface never claims something the system does not know.",
  "Anything capable of destroying, exposing or materially misrepresenting important data is tested according to its risk.",
  "Done means demonstrated with named evidence.",
];

const v51Changes = [
  {
    title: "Tier composition",
    body: "MUST now has an explicit meaning at Tier 1, Tier 2 and Tier 3, with a universal safety floor and an LLM/agent overlay.",
  },
  {
    title: "Agent blocker protocol",
    body: "When an agent cannot satisfy a MUST, cannot understand the affected system, or cannot establish safe authority/recovery, it stops the affected action rather than guessing.",
  },
  {
    title: "Canonical repositories",
    body: "Every maintained project has exactly one canonical repository. Mirrors, backups, archives and forks must have explicit roles, and deployments must be traceable to a repo and commit.",
  },
  {
    title: "SHOULD means default, not optional",
    body: "Departures from SHOULD must be stated in the durable change record so agents cannot silently downgrade SHOULD to MAY.",
  },
];

export default function EngineeringPrinciplesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Engineering governance"
        title="Engineering Principles v5.1"
        subtitle="The cross-repository standard for human and AI coding work, plus the evidence trail that produced it."
      />

      <div className="flex flex-wrap gap-2">
        <Badge>v5.1</Badge>
        <Badge variant="outline">JoshHub: Tier 2</Badge>
        <Badge variant="outline">Canonical: joshualparris/JoshHub</Badge>
        <Badge variant="muted">97/100 on paper</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>The rule above the rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-700 dark:text-slate-200">
          <blockquote className="border-l-4 border-sky-400 pl-4 text-base font-medium text-neutral-900 dark:text-slate-50">
            Code should make its intent obvious to the next person who reads it — including you in
            six months, and including an AI agent with no memory of why any of this exists.
          </blockquote>
          <p>
            Good engineering is not the production of code. It is the production of a system that
            can be understood, changed, verified, recovered and trusted.
          </p>
          <p>
            The complete normative standard lives in <code>codingprinciples.md</code>. This page is
            a readable summary and history, not a second authority.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-muted"
              href="https://github.com/joshualparris/JoshHub/blob/main/codingprinciples.md"
              target="_blank"
              rel="noreferrer"
            >
              Open canonical document
            </a>
            <a
              className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-muted"
              href="https://github.com/joshualparris/JoshHub/blob/main/docs/ENGINEERING_PRINCIPLES_HISTORY.md"
              target="_blank"
              rel="noreferrer"
            >
              Open evolution & rollout record
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The ten rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
            {tenRules.map((rule, index) => (
              <li key={rule} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                  {index + 1}
                </span>
                <span className="pt-0.5">{rule}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {v51Changes.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-700 dark:text-slate-200">
              {item.body}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assurance tiers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold text-neutral-900 dark:text-slate-50">
              Tier 1 — Experimental
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-slate-300">
              Throwaway prototypes and experiments. Universal safety floor; no fabricated state,
              false verification or leaked secrets.
            </p>
          </div>
          <div className="rounded-lg border border-sky-300 bg-sky-50/60 p-4 dark:border-sky-800 dark:bg-sky-950/30">
            <h3 className="font-semibold text-neutral-900 dark:text-slate-50">
              Tier 2 — Durable personal
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-slate-300">
              Persistent personal/family software. Adds traceable data, validation, migrations,
              recovery, destructive-path tests and maintained docs. JoshHub belongs here.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold text-neutral-900 dark:text-slate-50">
              Tier 3 — High consequence
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-slate-300">
              Health, finance, workplace/client data, authentication and other people's private
              data. The full standard applies.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How the standard evolved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-neutral-500 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Version</th>
                  <th className="py-2 pr-4 font-medium">Score</th>
                  <th className="py-2 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map(([version, score, reason]) => (
                  <tr key={version} className="border-b border-border/70 last:border-0">
                    <td className="py-3 pr-4 font-medium text-neutral-900 dark:text-slate-50">
                      {version}
                    </td>
                    <td className="py-3 pr-4">{score}/100</td>
                    <td className="py-3 text-neutral-600 dark:text-slate-300">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-neutral-600 dark:text-slate-300">
            97/100 is deliberately an on-paper score. The remaining points are earned by observing
            which rules agents actually follow or route around in real repositories.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio rollout evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-700 dark:text-slate-200">
          <p>
            <strong>Historical snapshot — 12 September 2026:</strong> the GitHub connection reported
            114 repositories with push/write access across owned and collaborator accounts. The
            rollout session successfully committed a principles file to the first 34 owned
            repositories before the session ended; no attempted write in that completed subset was
            rejected.
          </p>
          <p>
            This is intentionally labelled historical. It is <strong>not</strong> a claim that
            34/114 is the current state today, nor that every early copy is byte-for-byte v5.1.
            Current portfolio coverage must be re-audited from GitHub before presenting a live
            compliance percentage.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JoshHub authority</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
          <p>
            <strong>Canonical repository:</strong> joshualparris/JoshHub
          </p>
          <p>
            <strong>Assurance tier:</strong> Tier 2 — durable personal software with persistent
            IndexedDB/Dexie data.
          </p>
          <p>
            <strong>Universal standard:</strong> codingprinciples.md v5.1.
          </p>
          <p>
            <strong>Existing 18-principle audit:</strong> still useful as JoshHub-specific
            conformance evidence, but it predates v5.1 and is not a competing universal standard.
          </p>
        </CardContent>
      </Card>

      <div className="text-sm text-neutral-600 dark:text-slate-300">
        <Link href="/projects" className="font-medium underline underline-offset-4">
          Back to projects
        </Link>
      </div>
    </div>
  );
}
