import { LifeCard } from "@/components/life-card";
import { lifeAreas } from "@/data/life";

export const metadata = {
  title: "JoshHub | Life",
  description: "Life areas overview.",
};

export default function LifePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Life OS</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Life Areas</h1>
        <p className="text-neutral-600">Jump into each area to see focus and quick links.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lifeAreas.map((area) => (
          <LifeCard key={area.slug} area={area} />
        ))}
      </div>
    </div>
  );
}
