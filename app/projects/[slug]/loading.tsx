export default function Loading() {
  return (
    <section className="container mx-auto max-w-4xl px-4 py-8" aria-busy="true">
      <span className="sr-only">Caricamento progetto in corso…</span>
      {/* project header */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-1/2 rounded-md bg-muted" />
        <div className="mt-3 h-4 w-full rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-muted" />
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
      </div>

      {/* tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded bg-muted" />
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* content sections */}
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-card p-6"
          >
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-11/12 rounded bg-muted" />
              <div className="h-4 w-4/5 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
