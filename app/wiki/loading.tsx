export default function Loading() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <span className="sr-only">Caricamento wiki in corso…</span>
      <div className="mb-8 animate-pulse">
        <div className="h-9 w-32 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-56 rounded bg-muted" />
      </div>

      {/* search bar */}
      <div className="mb-6 animate-pulse">
        <div className="h-10 w-full max-w-md rounded-md border border-border bg-muted" />
      </div>

      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="mb-8">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-border bg-card p-4"
              >
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-4 w-full rounded bg-muted" />
                <div className="mt-2 h-4 w-4/5 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
