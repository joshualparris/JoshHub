"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const tabs = [
  { label: "Sleep", href: "/health/sleep" },
  { label: "Movement", href: "/health/movement" },
  { label: "Nutrition", href: "/health/nutrition" },
  { label: "Metrics", href: "/health/metrics" },
];

export default function HealthPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Health"
        title="Health logs"
        subtitle="Track sleep, movement, nutrition, and metrics locally."
      />
      <Card>
        <CardHeader>
          <CardTitle>Areas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground transition hover:bg-muted"
            >
              {tab.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
