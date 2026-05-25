const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  stable: "bg-green-500/10 text-green-700 dark:text-green-400",
  "needs-review": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const TYPE_LABELS: Record<string, string> = {
  source: "Source",
  concept: "Concept",
  "entity-person": "Persona",
  "entity-org": "Organizzazione",
  "entity-product": "Prodotto",
  synthesis: "Sintesi",
  overview: "Overview",
};

export function WikiStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export function WikiTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}
