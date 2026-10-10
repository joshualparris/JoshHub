import type { Metadata } from "next";
import RepairCafeSimulator from "@/components/learn/RepairCafeSimulator";

export const metadata: Metadata = {
 title: "Run Your Own Repair Café | JoshHub Learning Lab",
 description: "Plan a simulated Repair Café Saturday: choose a venue, organise volunteers, pass safety checks and manage seven event-day situations."
};
export default function RepairCafeLearningPage() { return <RepairCafeSimulator />; }
