export default function Loading() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <span className="sr-only">Caricamento in corso…</span>
      <div className="mb-8 animate-pulse">
        <div className="h-9 w-64 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-48 rounded bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-card p-4"
          >
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="mt-3 h-4 w-full rounded bg-muted" />
            <div className="mt-2 h-4 w-5/6 rounded bg-muted" />
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
