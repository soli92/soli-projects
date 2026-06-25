import type { KanbanItem } from "@/lib/kanban/reader";

interface KanbanItemCardProps {
  item: KanbanItem;
}

const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  epic: { bg: "bg-purple-500/10 text-purple-700 dark:text-purple-400", label: "Epic" },
  "user-story": { bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400", label: "Story" },
  task: { bg: "bg-green-500/10 text-green-700 dark:text-green-400", label: "Task" },
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-progress": "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  done: "bg-green-500/10 text-green-700 dark:text-green-400",
  blocked: "bg-red-500/10 text-red-700 dark:text-red-400",
  dropped: "bg-destructive/20 text-destructive",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  critical: "bg-destructive/20 text-destructive",
};

export function KanbanItemCard({ item }: KanbanItemCardProps) {
  const typeStyle = TYPE_STYLES[item.type] ?? { bg: "bg-muted text-muted-foreground", label: item.type };
  const isDone = item.frontmatter.status === "done";

  return (
    <article className={`rounded-lg border border-border bg-card p-4 transition-opacity ${isDone ? "opacity-50" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${typeStyle.bg}`}>
          {typeStyle.label}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${STATUS_STYLES[item.frontmatter.status] ?? "bg-muted text-muted-foreground"}`}>
          {item.frontmatter.status}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${PRIORITY_STYLES[item.frontmatter.priority] ?? ""}`}>
          {item.frontmatter.priority}
        </span>
      </div>

      <h3 className={`text-sm font-semibold ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
        <span className="mr-1.5 font-mono text-xs text-muted-foreground">
          {item.frontmatter.id}
        </span>
        {item.frontmatter.title}
      </h3>

      <div className="mt-2 flex flex-wrap gap-3 text-[0.65rem] text-muted-foreground">
        {item.frontmatter.epic && (
          <span>Epica: {item.frontmatter.epic}</span>
        )}
        {item.frontmatter.parent && (
          <span>Parent: {item.frontmatter.parent}</span>
        )}
        {item.frontmatter.layer && (
          <span>Layer: {item.frontmatter.layer}</span>
        )}
        {item.frontmatter.estimate && (
          <span>Stima: {item.frontmatter.estimate}</span>
        )}
      </div>

      {item.body.trim() && (
        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
          {item.body.trim().split("\n")[0]}
        </p>
      )}
    </article>
  );
}
