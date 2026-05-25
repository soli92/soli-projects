import type { KanbanItem } from "@/lib/kanban/reader";
import { KanbanItemCard } from "./KanbanItemCard";

interface KanbanSectionProps {
  items: KanbanItem[];
}

const TYPE_ORDER = ["epic", "user-story", "task"] as const;
const TYPE_LABELS: Record<string, string> = {
  epic: "Epiche",
  "user-story": "User Story",
  task: "Task",
};

export function KanbanSection({ items }: KanbanSectionProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nessun elemento strategico nel kanban.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Crea file EP-*.md, US-*.md o TSK-*.md in <code className="rounded bg-muted px-1">management/kanban/</code> per popolare questa vista.
        </p>
      </div>
    );
  }

  const grouped = new Map<string, KanbanItem[]>();
  for (const item of items) {
    if (!grouped.has(item.type)) grouped.set(item.type, []);
    grouped.get(item.type)!.push(item);
  }

  return (
    <div className="space-y-8">
      {TYPE_ORDER.map((type) => {
        const group = grouped.get(type);
        if (!group?.length) return null;
        return (
          <div key={type}>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {TYPE_LABELS[type] ?? type}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({group.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((item) => (
                <KanbanItemCard key={item.frontmatter.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
