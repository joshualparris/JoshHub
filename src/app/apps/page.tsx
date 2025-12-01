import { AppsDirectory } from "@/components/apps-directory";
import { apps, type AppStatus } from "@/data/apps";

export const metadata = {
  title: "JoshHub | Apps",
  description: "Browse apps and games.",
};

interface Props {
  searchParacare2?: { status?: string };
}

export default function AppsPage({ searchParacare2 }: Props) {
  const statusParam = searchParacare2?.status;
  const allowedStatus: AppStatus[] = ["ok", "broken", "wip", "archived"];
  const initialStatus = allowedStatus.includes(statusParam as AppStatus)
    ? (statusParam as AppStatus)
    : "all";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Catalogue</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Apps & Games</h1>
        <p className="text-neutral-600">
          Search, filter, and open every app or game from one place.
        </p>
      </div>
      <AppsDirectory itecare2={apps} initialStatus={initialStatus} />
    </div>
  );
}
