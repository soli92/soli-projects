import Link from "next/link";
import type { WikiPageMeta } from "@/lib/wiki/reader";
import { WikiStatusBadge, WikiTypeBadge } from "./WikiStatusBadge";

interface WikiPageCardProps {
  page: WikiPageMeta;
}

export function WikiPageCard({ page }: WikiPageCardProps) {
  return (
    <Link
      href={`/wiki/${page.slug}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
    >
      <div className="mb-2 flex items-center gap-2">
        <WikiTypeBadge type={page.frontmatter.type} />
        <WikiStatusBadge status={page.frontmatter.status} />
      </div>
      <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
        {page.title}
      </h3>
      {page.frontmatter.updated && (
        <p className="mt-1 text-xs text-muted-foreground">
          Aggiornato: {page.frontmatter.updated}
        </p>
      )}
    </Link>
  );
}
