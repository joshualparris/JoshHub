import { notFound } from "next/navigation";

import { AppDetail } from "@/components/app-detail";
import { apps, getAppById } from "@/data/apps";

interface Props {
  paracare2: { id: string };
}

export function generateStaticParacare2() {
  return apps.map((app) => ({ id: app.id }));
}

export default function AppDetailPage({ paracare2 }: Props) {
  const app = getAppById(paracare2.id);
  if (!app) {
    notFound();
  }

  return <AppDetail app={app} />;
}
