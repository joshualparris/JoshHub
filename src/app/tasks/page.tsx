"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { metaText } from "@/components/ui/text";
import { createTask, deleteTask, toggleTaskStatus, updateTask } from "@/lib/db/actions";
import { useTasks } from "@/lib/db/hooks";
import type { Task, TaskPriority } from "@/lib/db/schema";
import { todayLocalISO } from "@/lib/date";

export default function TasksPage() {
  const tasks = useTasks();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("med");
  const [tag, setTag] = useState("");
  const [due, setDue] = useState("");

  async function onAddTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({
      title: title.trim(),
      priority: priority as TaskPriority,
      tags: tag ? [tag] : [],
      dueDate: due || null,
    });
    setTitle("");
    setDue("");
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
      <PageHeader kicker="TASKS" title="Tasks" subtitle="Quick add and manage tasks." tone="onDark" />

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
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
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
            <Input
              type="date"
              className="min-w-[160px]"
              value={due}
              onChange={(e) => setDue(e.target.value)}
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
          <p className="text-sm text-foreground/60">Nothing here.</p>
        ) : (
          tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [tags, setTags] = useState(task.tags.join(", "));
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");

  async function onSave(e: FormEvent) {
    e.preventDefault();
    await updateTask(task.id, {
      title: title.trim() || "Untitled",
      priority,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      dueDate: dueDate || null,
    });
    setEditing(false);
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
      {editing ? (
        <form className="space-y-2" onSubmit={onSave}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
            >
              <option value="low">Low</option>
              <option value="med">Med</option>
              <option value="high">High</option>
            </select>
            <Input
              type="date"
              className="min-w-[160px]"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await deleteTask(task.id);
              }}
            >
              Delete
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={(e) => toggleTaskStatus(task.id, e.target.checked ? "done" : "open")}
              />
              <span className={task.status === "done" ? "line-through text-foreground/60" : ""}>
                {task.title}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
              >
                <option value="low">Low</option>
                <option value="med">Med</option>
                <option value="high">High</option>
              </select>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
          </div>
          <div className={`flex flex-wrap gap-2 ${metaText}`}>
            {task.dueDate && <span>Due {task.dueDate}</span>}
            {task.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function isToday(date?: string | null) {
  if (!date) return false;
  const today = todayLocalISO();
  return date === today;
}

function isUpcoming(date?: string | null) {
  if (!date) return false;
  const today = todayLocalISO();
  return date > today;
}
