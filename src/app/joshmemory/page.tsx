import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "JoshHub | JoshMemory",
  description: "Live status and architecture for JoshMemory cross-machine project continuity.",
};

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
        <CardContent className="space-y-3 text-sm">
          <p>
            JoshMemory uses an existing private GitHub repository as its default shared store when
            a development machine already has usable GitHub authentication.
          </p>
          <p>
            The public JoshMemory repository contains the software. Shared handoffs, durable facts
            and accountability references are kept in the private backing store.
          </p>
          <p>
            AVANCE-WS7 can be switched off without taking the GitHub-backed continuity store
            offline.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Code truth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">GitHub + live checkout</p>
            <p>
              Current branch, HEAD and machine/API evidence override a stored handoff whenever they
              disagree.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared continuity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">JoshMemory</p>
            <p>
              Structured handoffs, project facts and accountability references provide durable
              cross-machine context.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloud persistence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">Private GitHub store</p>
            <p>
              Append-only UUID records keep pause/resume state available without an always-on home,
              office or worker PC.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet execution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">ForgeGrid / DadLAN</p>
            <p>
              The fleet executes work and returns evidence. Action1 remains an out-of-band recovery
              path rather than the memory database.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is shared</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>Session handoffs and pause/resume bookmarks</li>
            <li>Durable project facts with provenance and supersession</li>
            <li>Accountability references to external verification evidence</li>
            <li>Canonical-repository continuity across different checkout paths</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What remains local or separately authoritative</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>Raw Codex JSONL and complete ChatGPT exports</li>
            <li>The old local SQLite/history corpus unless deliberately migrated</li>
            <li>Live machine observations and current working-tree state</li>
            <li>Verification artefacts owned by their original evidence systems</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            A fresh agent identifies the canonical repository, loads the latest handoff, checks live
            Git state, surfaces discrepancies, continues from the first still-valid next action and
            saves a new checkpoint when useful.
          </p>
          <p className="font-medium">
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
            className="rounded-md border border-border px-3 py-2 font-medium"
            href="/api/joshmemory-status"
          >
            Open live status API
          </a>
          <a
            className="rounded-md border border-border px-3 py-2 font-medium"
            href="https://github.com/joshualparris/JoshMemory"
            target="_blank"
            rel="noreferrer"
          >
            Open JoshMemory source
          </a>
          <a
            className="rounded-md border border-border px-3 py-2 font-medium"
            href="https://github.com/joshualparris/JoshMemory/blob/main/docs/CLOUD_CONTINUITY_HISTORY.md"
            target="_blank"
            rel="noreferrer"
          >
            Open architecture history
          </a>
          <a
            className="rounded-md border border-border px-3 py-2 font-medium"
            href="https://github.com/joshualparris/JoshDashboard4"
            target="_blank"
            rel="noreferrer"
          >
            Open private backing store
          </a>
        </CardContent>
      </Card>

      <p className="text-xs text-neutral-500">
        This page exposes architecture/status only. It does not expose private memory payloads.
      </p>
    </div>
  );
}
