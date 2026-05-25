import type { Metadata } from "next";
import { Suspense } from "react";
import { listWikiPages, searchWikiPages } from "@/lib/wiki/reader";
import { WikiPageCard } from "@/components/wiki/WikiPageCard";
import { WikiSearch } from "@/components/wiki/WikiSearch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wiki — Soli Projects",
  description: "Knowledge base centralizzata per tutti i repository soli92",
};

const CATEGORY_LABELS: Record<string, string> = {
  sources: "Progetti",
  concepts: "Concetti",
  entities: "Entità",
  syntheses: "Sintesi",
  runbooks: "Runbook",
  root: "Generale",
};

const CATEGORY_ORDER = ["root", "sources", "concepts", "entities", "syntheses", "runbooks"];

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WikiIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  const pages = query ? searchWikiPages(query) : listWikiPages();

  const grouped = new Map<string, typeof pages>();
  for (const page of pages) {
    const cat = page.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(page);
  }

  const sortedCategories = [...grouped.keys()].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) === -1 ? 99 : CATEGORY_ORDER.indexOf(a))
           - (CATEGORY_ORDER.indexOf(b) === -1 ? 99 : CATEGORY_ORDER.indexOf(b)),
  );

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Wiki</h1>
        <p className="mt-1 text-muted-foreground">
          {pages.length} pagine nella knowledge base
        </p>
      </div>

      <div className="mb-6">
        <Suspense>
          <WikiSearch />
        </Suspense>
      </div>

      {query && pages.length === 0 && (
        <p className="text-muted-foreground">
          Nessun risultato per &ldquo;{query}&rdquo;
        </p>
      )}

      {sortedCategories.map((cat) => {
        const catPages = grouped.get(cat) ?? [];
        return (
          <div key={cat} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {CATEGORY_LABELS[cat] ?? cat}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({catPages.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catPages.map((page) => (
                <WikiPageCard key={page.slug} page={page} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
