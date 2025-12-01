import { notFound } from "next/navigation";

import { getLifeArea } from "@/data/life";
import { LifeDetailClient } from "./life-detail-client";

interface Props {
  params: { slug: string } | Promise<{ slug: string }>;
}

// Render at request time to avoid stale pre-rendered 404s.
export const dynamic = "force-dynamic";

export default async function LifeDetailPage({ params }: Props) {
  // Next.js now provides params as a Promise for dynamic routes—unwrap before use.
  const resolved = await params;
  const slug = decodeURIComponent(resolved.slug).trim().toLowerCase();

  const area = getLifeArea(slug);
  if (!area) return notFound();

  if (process.env.NODE_ENV === "development") {
    console.log("[life] slug", slug, "area found?", Boolean(area));
  }

  return <LifeDetailClient area={area} />;
}
