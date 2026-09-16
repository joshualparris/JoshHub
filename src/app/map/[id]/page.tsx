import { notFound } from "next/navigation";

import { EVERYTHING_MAP_TOC } from "@/features/everything-map/toc";
import { MapClient } from "@/features/everything-map/map-client";
import { buildTree, findNode } from "@/features/everything-map/tree";

interface Props {
  params: { id: string };
}

export const metadata = {
  title: "JoshHub | Everything Map",
  description: "Navigate your life map and attach notes locally.",
};

export function generateStaticParams() {
  return EVERYTHING_MAP_TOC.map((item) => ({ id: item.id }));
}

export default function MapDetailPage({ params }: Props) {
  const tree = buildTree(EVERYTHING_MAP_TOC);
  const exists = findNode(tree, params.id);
  if (!exists) return notFound();
  return <MapClient initialId={params.id} />;
}
