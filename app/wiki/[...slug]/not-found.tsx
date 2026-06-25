import Link from "next/link";

export default function WikiNotFound() {
  return (
    <section className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-7xl font-extrabold text-muted-foreground/40">404</p>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Pagina non trovata</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          La pagina wiki che stai cercando non esiste o è stata rimossa.
        </p>
        <Link
          href="/wiki"
          className="mt-8 inline-flex items-center gap-1 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          ← Torna alla Wiki
        </Link>
      </div>
    </section>
  );
}
