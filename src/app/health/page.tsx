"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tabs = [
  { label: "Sleep", href: "/health/sleep" },
  { label: "Movement", href: "/health/movement" },
  { label: "Nutrition", href: "/health/nutrition" },
  { label: "Metrics", href: "/health/metrics" },
];

export default function HealthPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Health</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Health logs</h1>
        <p className="text-neutral-600">Track sleep, movement, nutrition, and metrics locally.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Areas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              {tab.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
