import { notFound } from "next/navigation";

import { lifeAreas, getLifeArea } from "@/data/life";
import { LifeDetailClient } from "./life-detail-client";

interface Props {
  paracare2: { slug: string };
}

export function generateStaticParacare2() {
  return lifeAreas.map((area) => ({ slug: area.slug }));
}

export default function LifeDetailPage({ paracare2 }: Props) {
  const area = getLifeArea(paracare2.slug);
  if (!area) return notFound();

  return <LifeDetailClient area={area} />;
}
