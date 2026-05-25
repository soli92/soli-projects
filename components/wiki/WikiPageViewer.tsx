import type { WikiPage } from "@/lib/wiki/reader";
import { renderWikiMarkdown } from "@/lib/wiki/render";
import { WikiBreadcrumb } from "./WikiBreadcrumb";
import { WikiStatusBadge, WikiTypeBadge } from "./WikiStatusBadge";

interface WikiPageViewerProps {
  page: WikiPage;
}

export async function WikiPageViewer({ page }: WikiPageViewerProps) {
  const html = await renderWikiMarkdown(page.body);

  return (
    <article>
      <WikiBreadcrumb slug={page.slug} />

      <header className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <WikiTypeBadge type={page.frontmatter.type} />
          <WikiStatusBadge status={page.frontmatter.status} />
          {page.frontmatter.language && (
            <span className="text-xs text-muted-foreground">
              {page.frontmatter.language.toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-foreground">{page.title}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {page.frontmatter.created && (
            <span>Creato: {page.frontmatter.created}</span>
          )}
          {page.frontmatter.updated && (
            <span>Aggiornato: {page.frontmatter.updated}</span>
          )}
        </div>
        {page.frontmatter.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {page.frontmatter.sources.map((src) => (
              <span
                key={src}
                className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground"
              >
                {src}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="wiki-content prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-table:text-sm prose-th:text-left prose-th:font-semibold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
