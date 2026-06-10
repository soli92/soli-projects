"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Qualcosa è andato storto
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Si è verificato un errore imprevisto. Puoi riprovare oppure tornare alla
          dashboard.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          Riprova
        </button>
        <Link
          href="/"
          className="mt-3 block text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Torna alla dashboard
        </Link>
      </div>
    </main>
  );
}
