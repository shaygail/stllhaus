import { EventsAdminClient } from "./EventsAdminClient";
import { isAdminUser } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/events");
  }

  if (!isAdminUser(user)) {
    redirect("/");
  }

  return <EventsAdminClient />;
}
