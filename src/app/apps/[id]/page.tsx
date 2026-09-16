import { notFound, redirect } from "next/navigation";

import { getAppById } from "@/data/apps";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

// Force runtime so we can always send the user to the live URL and avoid stale
// pre-rendered 404s.
export const dynamic = "force-dynamic";

export default async function AppDetailPage({ params }: Props) {
  const resolved = await params;
  const app = getAppById(resolved.id);
  if (!app) {
    notFound();
  }

  redirect(app.primaryUrl);
}
