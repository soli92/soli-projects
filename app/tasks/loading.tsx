export default function Loading() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <span className="sr-only">Caricamento task in corso…</span>
      <div className="mb-6 animate-pulse">
        <div className="h-9 w-32 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-72 rounded bg-muted" />
      </div>

      {/* tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <div className="h-7 w-28 animate-pulse rounded bg-muted" />
          <div className="h-7 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* filters */}
      <div className="mb-6 flex flex-wrap gap-2 animate-pulse">
        <div className="h-9 w-40 rounded-md border border-border bg-muted" />
        <div className="h-9 w-32 rounded-md border border-border bg-muted" />
        <div className="h-9 w-32 rounded-md border border-border bg-muted" />
      </div>

      {/* task list rows */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-1/2 rounded bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
