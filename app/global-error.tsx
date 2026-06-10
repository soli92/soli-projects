"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="it">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Qualcosa è andato storto
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Si è verificato un errore imprevisto. Puoi riprovare oppure
              ricaricare la pagina.
            </p>

            <button
              type="button"
              onClick={() => reset()}
              className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Riprova
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
