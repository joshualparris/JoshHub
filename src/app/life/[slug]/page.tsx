import { notFound } from "next/navigation";

import { lifeAreas, getLifeArea } from "@/data/life";
import { LifeDetailClient } from "./life-detail-client";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return lifeAreas.map((area) => ({ slug: area.slug }));
}

export default function LifeDetailPage({ params }: Props) {
  const area = getLifeArea(params.slug);
  if (!area) return notFound();

  return <LifeDetailClient area={area} />;
}
