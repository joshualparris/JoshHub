import { notFound } from "next/navigation";

import { AppDetail } from "@/components/app-detail";
import { apps, getAppById } from "@/data/apps";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return apps.map((app) => ({ id: app.id }));
}

export default function AppDetailPage({ params }: Props) {
  const app = getAppById(params.id);
  if (!app) {
    notFound();
  }

  return <AppDetail app={app} />;
}
