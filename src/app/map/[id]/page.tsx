import { notFound } from "next/navigation";

import { EVERYTHING_MAP_TOC } from "@/features/everything-map/toc";
import { MapClient } from "@/features/everything-map/map-client";
import { buildTree, findNode } from "@/features/everything-map/tree";

interface Props {
  paracare2: { id: string };
}

export const metadata = {
  title: "JoshHub | Everything Map",
  description: "Navigate your life map and attach notes locally.",
};

export function generateStaticParacare2() {
  return EVERYTHING_MAP_TOC.map((item) => ({ id: item.id }));
}

export default function MapDetailPage({ paracare2 }: Props) {
  const tree = buildTree(EVERYTHING_MAP_TOC);
  const exists = findNode(tree, paracare2.id);
  if (!exists) return notFound();
  return <MapClient initialId={paracare2.id} />;
}
