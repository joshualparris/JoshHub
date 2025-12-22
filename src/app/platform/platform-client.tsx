"use client";
import React from "react";
import PlatformCard from "@/components/platform/platform-card";
import TodayFocus from "@/components/platform/today-focus";
import { PageHeader } from "@/components/ui/page-header";
import { usePlatformMoveOps, usePlatformDecisionCards, usePlatformOpportunities, usePlatformWeeklyReviews } from "@/features/platform";
import Link from "next/link";

export default function PlatformClient() {
    const moveops = usePlatformMoveOps();
    const decisions = usePlatformDecisionCards();
    const opps = usePlatformOpportunities();
    const reviews = usePlatformWeeklyReviews();

    const topDecisions = decisions.filter((d) => d.status === 'open').slice(0, 3);

    return (
        <div className="space-y-6">
            <PageHeader kicker="Platform" title="JoshPlatform" subtitle="Move, decide, and review." tone="onDark" />

            <TodayFocus>
                <div className="flex flex-col gap-2">
                    {topDecisions.length === 0 ? <div className="text-sm text-muted-foreground">No urgent decisions.</div> : topDecisions.map((d) => <div key={d.id}>{d.question}</div>)}
                    <div className="text-sm text-muted-foreground">Upcoming moves: {moveops.filter(m => m.dueDate).slice(0, 3).map(m => m.title).join(', ') || 'None'}</div>
                </div>
            </TodayFocus>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <PlatformCard title="MoveOps" count={moveops.length} href="/platform/moveops" />
                <PlatformCard title="Decisions" count={decisions.length} href="/platform/decisions" />
                <PlatformCard title="Opportunities" count={opps.length} href="/platform/opportunities" />
                <PlatformCard title="Weekly Review" count={reviews.length} href="/platform/review" />
            </div>

            <div>
                <Link href="/platform/moveops" className="text-sm text-muted-foreground">Open Platform dashboard →</Link>
            </div>
        </div>
    );
}
