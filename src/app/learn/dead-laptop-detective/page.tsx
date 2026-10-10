import type { Metadata } from "next";
import DeadLaptopLab from "@/components/learn/DeadLaptopLab";

export const metadata: Metadata = {
  title: "The Dead Laptop Detective | JoshHub Learning Lab",
  description: "Eight interactive missions, a virtual electronics workbench and three evidence-gated laptop diagnosis cases."
};

export default function DeadLaptopDetectivePage() {
  return <DeadLaptopLab/>;
}
