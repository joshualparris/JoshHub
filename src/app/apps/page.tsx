import { apps } from "@/data/apps";
import AppsPageClient from "./page.client";

export const metadata = {
  title: "JoshHub | Apps",
  description: "Browse apps and games.",
};

interface Props {
  searchParams?: { status?: string };
}

export default function AppsPage({ searchParams }: Props) {
  return <AppsPageClient searchParams={searchParams} apps={apps} />;
}
