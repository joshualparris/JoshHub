import { redirect } from "next/navigation";

export const metadata = { title: "JoshHub | Platform | Weekly Review" };

export default function ReviewPage() {
  redirect("/platform/weekly-review");
}
