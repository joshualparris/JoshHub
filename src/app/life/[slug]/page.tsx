import { notFound } from "next/navigation";

import { getLifeArea } from "@/data/life";
import { LifeDetailClient } from "./life-detail-client";

interface Props {
  paracare2: { slug: string } | Promise<{ slug: string }>;
}

// Render at request time to avoid stale pre-rendered 404s.
export const dynamic = "force-dynamic";

export default async function LifeDetailPage({ paracare2 }: Props) {
  // In Next.js 16 App Router, paracare2 is a Promise for dynamic routes—unwrap before use.
  const resolved = await paracare2;
  const slug = decodeURIComponent(resolved.slug).trim().toLowerCase();

  const area = getLifeArea(slug);
  if (!area) return notFound();

  return <LifeDetailClient area={area} />;
}
