import { AppsDirectory } from "@/components/apps-directory";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        kicker="Catalogue"
        title="Apps & Games"
        subtitle="Search, filter, and open every app or game from one place."
        tone="onDark"
      />
      <AppsDirectory itecare2={apps} initialStatus={initialStatus} />
    </div>
  );
}
