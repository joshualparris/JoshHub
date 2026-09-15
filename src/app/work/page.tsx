import Link from "next/link";

export const metadata = {
  title: "JoshHub | Work",
  description: "Work tools, workplace resources and professional references.",
};

const workLinks = [
  {
    href: "/avance-whs",
    title: "Avance WHS",
    description: "Workplace safety, emergency, first aid and induction resources.",
  },
  {
    href: "/tasks",
    title: "Tasks",
    description: "Current actions and things that need follow-up.",
  },
  {
    href: "/calendar",
    title: "Calendar",
    description: "Schedule and upcoming commitments.",
  },
  {
    href: "/engineering-principles",
    title: "Engineering principles",
    description: "The standards used across software and automation projects.",
  },
  {
    href: "/podcast-rollout",
    title: "Podcast QA",
    description: "Podcast dock rollout and quality checks across apps.",
  },
];

export default function WorkPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Work
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Work hub
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Workplace tools and professional resources live here. The main JoshHub navigation stays
          broad; specific tools sit inside their relevant section.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="font-semibold text-slate-950 dark:text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
