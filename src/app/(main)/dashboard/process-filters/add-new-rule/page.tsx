import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard/process-filters#add-new-rule");
}
