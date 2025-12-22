"use client";
import React from "react";
import Link from "next/link";
import type { LearnTopic } from "../../lib/db/schema";

type Props = {
    topic: LearnTopic;
};

export default function TopicCard({ topic }: Props) {
    return (
        <div className="border rounded p-3 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{topic.name}</h3>
                <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">{topic.status}</span>
            </div>
            {topic.summary ? <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">{topic.summary}</p> : null}
            <div className="mt-3 flex gap-2">
                <Link href={`/learn/topics/${topic.id}`} className="text-sm text-blue-600">Open</Link>
            </div>
        </div>
    );
}
