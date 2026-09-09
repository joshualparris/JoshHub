import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlatformCard({
    title,
    count,
    href,
}: {
    title: string;
    count: number;
    href: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-sm text-neutral-500">{count}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end">
                    <Button asChild>
                        <a href={href}>Go</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
