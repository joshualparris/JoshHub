import { redirect } from "next/navigation";

import { EVERYTHING_MAP_TOC } from "@/features/everything-map/toc";
import { MapClient } from "@/features/everything-map/map-client";
import { buildTree } from "@/features/everything-map/tree";

export const metadata = {
  title: "JoshHub | Everything Map",
  description: "Navigate your life map and attach notes locally.",
};

export default function MapPage() {
  const tree = buildTree(EVERYTHING_MAP_TOC);
  const firstId = tree[0]?.id;
  if (!firstId) {
    redirect("/");
  }
  return <MapClient initialId={firstId} />;
}
