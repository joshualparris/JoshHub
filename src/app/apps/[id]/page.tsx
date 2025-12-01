import { notFound, redirect } from "next/navigation";

import { getAppById } from "@/data/apps";

interface Props {
  paracare2: { id: string };
}

// Force runtime so we can always send the user to the live URL and avoid stale
// pre-rendered 404s.
export const dynamic = "force-dynamic";

export default function AppDetailPage({ paracare2 }: Props) {
  const app = getAppById(paracare2.id);
  if (!app) {
    notFound();
  }

  redirect(app.primaryUrl);
}
