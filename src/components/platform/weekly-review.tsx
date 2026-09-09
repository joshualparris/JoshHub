"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { PlatformWeeklyReview } from "@/features/platform";
import { platformActions, usePlatformWeeklyReviews } from "@/features/platform";

export default function WeeklyReviewList() {
    const items = usePlatformWeeklyReviews();
    const [weekStart, setWeekStart] = useState("");

    async function handleAdd() {
        if (!weekStart) return;
        await platformActions.addWeeklyReview({
            weekStart,
        });
        setWeekStart("");
    }

    const latest = items[0];

    return (
        <div className="space-y-6">
            <PageHeader kicker="Platform" title="Weekly Review" subtitle="Short reflection and planning." tone="onDark" />

            <Card>
                <CardHeader>
                    <CardTitle>New Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 items-center">
                        <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
                        <Button onClick={handleAdd}>Create</Button>
                    </div>
                </CardContent>
            </Card>

            {latest ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Latest review ({latest.weekStart})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>{latest.wins || "No wins yet."}</div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-sm text-muted-foreground">No reviews yet.</div>
            )}
        </div>
    );
}
