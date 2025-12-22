import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodayFocus({ children }: { children?: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Today Focus</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
