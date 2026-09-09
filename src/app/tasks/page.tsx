"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { metaText } from "@/components/ui/text";
import { groupTasksByDue } from "@/features/tasks/grouping";
import { createTask, deleteTask, toggleTaskStatus, updateTask } from "@/lib/db/actions";
import { useTasks } from "@/lib/db/hooks";
import type { Task, TaskPriority } from "@/lib/db/schema";
import { todayLocalISO } from "@/lib/date";
import { normalizeTag, parseTagList } from "@/lib/logic/tagging";

export default function TasksPage() {
  const tasks = useTasks();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [tag, setTag] = useState("");
  const [due, setDue] = useState("");

  async function onAddTask(event: FormEvent) {
    event.preventDefault();
    const taskTitle = title.trim();
    if (!taskTitle) return;

    await createTask({
      title: taskTitle,
      priority,
      tags: tag.trim() ? [normalizeTag(tag)] : [],
      dueDate: due || null,
    });
    setTitle("");
    setTag("");
    setDue("");
  }

  const grouped = useMemo(
    () => groupTasksByDue(tasks ?? [], todayLocalISO()),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Tasks"
        title="Tasks"
        subtitle="Quick add and manage tasks."
        tone="onDark"
      />

      <Card>
        <CardHeader>
          <CardTitle>New task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3" onSubmit={onAddTask}>
            <Input
              className="min-w-[200px] flex-1"
              placeholder="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="low">Low</option>
              <option value="med">Med</option>
              <option value="high">High</option>
            </select>
            <Input
              className="min-w-[160px]"
              placeholder="Tag (optional)"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            />
            <Input
              type="date"
              className="min-w-[160px]"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
            <Button type="submit" disabled={!title.trim()}>
              Add
            </Button>
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
          <p className="text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
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

  async function onSave(event: FormEvent) {
    event.preventDefault();
    await updateTask(task.id, {
      title: title.trim() || "Untitled",
      priority,
      tags: parseTagList(tags),
      dueDate: dueDate || null,
    });
    setEditing(false);
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-card-foreground">
      {editing ? (
        <form className="space-y-2" onSubmit={onSave}>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="low">Low</option>
              <option value="med">Med</option>
              <option value="high">High</option>
            </select>
            <Input
              type="date"
              className="min-w-[160px]"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete task “${task.title}”?`)) void deleteTask(task.id);
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
                onChange={(event) =>
                  void toggleTaskStatus(task.id, event.target.checked ? "done" : "open")
                }
              />
              <span className={task.status === "done" ? "text-muted-foreground line-through" : ""}>
                {task.title}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={task.priority}
                onChange={(event) =>
                  void updateTask(task.id, { priority: event.target.value as TaskPriority })
                }
                className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            {task.tags.map((item) => (
              <span key={item} className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
