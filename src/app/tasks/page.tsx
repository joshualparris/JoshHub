"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createTask, toggleTaskStatus, updateTask } from "@/lib/db/actions";
import { useTasks } from "@/lib/db/hooks";
import type { Task, TaskPriority } from "@/lib/db/schema";

export default function TasksPage() {
  const tasks = useTasks();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("med");
  const [tag, setTag] = useState("");

  async function onAddTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({
      title: title.trim(),
      priority: priority as TaskPriority,
      tags: tag ? [tag] : [],
    });
    setTitle("");
  }

  const grouped = useMemo(() => {
    const list = (tasks ?? []).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
    return {
      today: list.filter((t) => isToday(t.dueDate)),
      upcoming: list.filter((t) => isUpcoming(t.dueDate)),
      someday: list.filter((t) => !t.dueDate),
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Tasks</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Tasks</h1>
        <p className="text-neutral-600">Quick add and manage tasks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3" onSubmit={onAddTask}>
            <Input
              className="flex-1 min-w-[200px]"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              <option value="low">Low</option>
              <option value="med">Med</option>
              <option value="high">High</option>
            </select>
            <Input
              className="min-w-[160px]"
              placeholder="Tag (optional)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <TaskGroup title="Today" tasks={grouped.today} />
        <TaskGroup title="Upcoming" tasks={grouped.upcoming} />
        <TaskGroup title="Someday" tasks={grouped.someday} />
      </div>
    </div>
  );
}

function TaskGroup({ title, tasks }: { title: string; tasks: Task[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-neutral-600">Nothing here.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2"
            >
              <div>
                <label className="flex items-center gap-2 text-sm text-neutral-800">
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={(e) =>
                      toggleTaskStatus(task.id, e.target.checked ? "done" : "open")
                    }
                  />
                  <span className={task.status === "done" ? "line-through text-neutral-500" : ""}>
                    {task.title}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                  {task.dueDate && <span>Due {task.dueDate}</span>}
                  {task.tags.map((t) => (
                    <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                <option value="low">Low</option>
                <option value="med">Med</option>
                <option value="high">High</option>
              </select>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function isToday(date?: string | null) {
  if (!date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return date === today;
}

function isUpcoming(date?: string | null) {
  if (!date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return date > today;
}
