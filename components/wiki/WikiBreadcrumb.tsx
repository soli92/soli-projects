import Link from "next/link";

interface WikiBreadcrumbProps {
  slug: string;
}

export function WikiBreadcrumb({ slug }: WikiBreadcrumbProps) {
  const parts = slug.split("/");

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link href="/wiki" className="transition-colors hover:text-foreground">
            Wiki
          </Link>
        </li>
        {parts.map((part, i) => {
          const href = "/wiki/" + parts.slice(0, i + 1).join("/");
          const isLast = i === parts.length - 1;
          return (
            <li key={href} className="flex items-center gap-1.5">
              <span aria-hidden>/</span>
              {isLast ? (
                <span className="text-foreground font-medium">{part}</span>
              ) : (
                <Link href={href} className="transition-colors hover:text-foreground">
                  {part}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
