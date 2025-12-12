"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Projects"
        title="Projects board"
        subtitle="Projects are managed through the Apps catalogue while the dedicated board is built."
        tone="onDark"
      />

      <Card className="bg-card text-foreground">
        <CardHeader>
          <CardTitle>Where to find projects right now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The full Projects view is coming soon. For now, use the Apps catalogue to open, filter,
            and launch projects, or review the improvement tracker for current work.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link className="text-primary underline" href="/apps">
                Open Apps catalogue
              </Link>
            </li>
            <li className="text-foreground">
              Improvement tracker lives at <code className="bg-muted px-1 py-0.5 text-xs">docs/IMPROVEMENTS.md</code> in the repo.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
