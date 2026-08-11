import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin-access";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  if (!isAdminUser(user)) {
    redirect("/");
  }

  const email = user.email ?? "your account";

  return (
    <div className="min-h-[70vh] px-6 sm:px-12 lg:px-20 py-24 max-w-2xl mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Team admin</p>
      <h1 className="text-3xl font-black uppercase tracking-tight text-stll-charcoal mb-2">
        Admin tools
      </h1>
      <p className="text-sm text-stll-muted mb-10">{email}</p>

      <section className="border border-stll-charcoal/15 p-6 mb-8 bg-stll-charcoal text-white">
        <p className="text-sm text-white/65 leading-relaxed mb-5">
          Manage markets, ordering hours, registration stats, and other admin tools from here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/account/events"
            className="inline-flex items-center text-[11px] tracking-[0.2em] uppercase border border-white/25 px-4 py-2 hover:bg-white hover:text-stll-charcoal transition-colors"
          >
            Manage events
          </Link>
          <Link
            href="/admin/ordering"
            className="inline-flex items-center text-[11px] tracking-[0.2em] uppercase border border-white/15 text-white/70 px-4 py-2 hover:border-white/40 hover:text-white transition-colors"
          >
            Ordering hours
          </Link>
          <Link
            href="/admin/stats"
            className="inline-flex items-center text-[11px] tracking-[0.2em] uppercase border border-white/15 text-white/70 px-4 py-2 hover:border-white/40 hover:text-white transition-colors"
          >
            Registration stats
          </Link>
          <Link
            href="/admin/loyalty"
            className="inline-flex items-center text-[11px] tracking-[0.2em] uppercase border border-white/15 text-white/70 px-4 py-2 hover:border-white/40 hover:text-white transition-colors"
          >
            Loyalty members
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-4">
        <SignOutButton />
        <Link
          href="/"
          className="inline-flex items-center text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal border border-transparent hover:border-stll-charcoal/20 px-4 py-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
