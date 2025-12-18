import { apps } from "@/data/apps";
import AppsPageClient from "./page.client";

export const metadata = {
  title: "JoshHub | Apps",
  description: "Browse apps and games.",
};

interface Props {
  searchParacare2?: { status?: string };
}

export default function AppsPage({ searchParacare2 }: Props) {
  return <AppsPageClient searchParacare2={searchParacare2} apps={apps} />;
}
