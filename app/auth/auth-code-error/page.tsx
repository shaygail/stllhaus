import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-stll-charcoal mb-2">
        Sign-in did not complete
      </h1>
      <p className="text-sm text-stll-muted text-center max-w-md mb-8">
        Something went wrong while connecting your Google account. Try again, or contact us if this keeps happening.
      </p>
      <Link
        href="/login"
        className="text-[11px] tracking-[0.25em] uppercase border border-stll-charcoal px-6 py-3 bg-stll-charcoal text-white"
      >
        Back to sign in
      </Link>
    </div>
  );
}
