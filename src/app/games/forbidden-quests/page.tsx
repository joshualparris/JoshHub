import { redirect } from "next/navigation";

export default function ForbiddenQuestsPage() {
    redirect("/games/forbidden-quests/index.html");
}
