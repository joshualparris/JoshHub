import { LifeCard } from "@/components/life-card";
import { PageHeader } from "@/components/ui/page-header";
import { lifeAreas } from "@/data/life";

export const metadata = {
  title: "JoshHub | Life",
  description: "Life areas overview.",
};

export default function LifePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Life OS"
        title="Life Areas"
        subtitle="Jump into each area to see focus and quick links."
        tone="onDark"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lifeAreas.map((area) => (
          <LifeCard key={area.slug} area={area} />
        ))}
      </div>
    </div>
  );
}
