import type { KanbanItem, KanbanStatus } from "@/lib/kanban/reader";
import { KanbanItemCard } from "./KanbanItemCard";

export interface KanbanFilters {
  status?: string;
  priority?: string;
}

interface KanbanSectionProps {
  items: KanbanItem[];
  filters?: KanbanFilters;
}

const TYPE_ORDER = ["epic", "user-story", "task"] as const;
const TYPE_LABELS: Record<string, string> = {
  epic: "Epiche",
  "user-story": "User Story",
  task: "Task",
};

// Map Supabase-style status values to kanban status values for cross-source filtering.
// The URL param uses "in_progress" (operativi) but kanban uses "in-progress".
function normalizeKanbanStatus(value: string): KanbanStatus {
  if (value === "in_progress") return "in-progress";
  return value as KanbanStatus;
}

function applyFilters(items: KanbanItem[], filters: KanbanFilters): KanbanItem[] {
  let result = items;
  if (filters.status) {
    const kanbanStatus = normalizeKanbanStatus(filters.status);
    result = result.filter((i) => i.frontmatter.status === kanbanStatus);
  }
  if (filters.priority) {
    result = result.filter((i) => i.frontmatter.priority === filters.priority);
  }
  return result;
}

export function KanbanSection({ items, filters = {} }: KanbanSectionProps) {
  const filtered = applyFilters(items, filters);
  const hasActiveFilters = !!(filters.status || filters.priority);

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

  if (filtered.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {hasActiveFilters
          ? "Nessun elemento trovato con i filtri selezionati."
          : "Nessun elemento strategico."}
      </p>
    );
  }

  const grouped = new Map<string, KanbanItem[]>();
  for (const item of filtered) {
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
