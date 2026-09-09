import type { Task } from "@/lib/db/schema";

export type TaskGroups = {
  today: Task[];
  upcoming: Task[];
  someday: Task[];
};

export function groupTasksByDue(tasks: Task[], today: string): TaskGroups {
  const sorted = [...tasks].sort((left, right) => {
    if (left.dueDate && right.dueDate) return left.dueDate.localeCompare(right.dueDate);
    if (left.dueDate) return -1;
    if (right.dueDate) return 1;
    return right.updatedAt - left.updatedAt;
  });

  return {
    today: sorted.filter((task) => task.dueDate === today),
    upcoming: sorted.filter((task) => Boolean(task.dueDate && task.dueDate > today)),
    someday: sorted.filter((task) => !task.dueDate),
  };
}
