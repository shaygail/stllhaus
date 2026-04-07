import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 text-sm text-stll-muted">
          Loading…
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
