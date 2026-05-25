import Link from "next/link";
import { cycleTodoStatusAction, dropTodoAction } from "@/lib/actions/todos";
import { formatRelative } from "@/lib/format/relative";
import type { TodoWithProject } from "@/lib/data/todos";

interface CrossProjectTaskCardProps {
  todo: TodoWithProject;
}

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  critical: "bg-destructive/20 text-destructive",
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-secondary text-secondary-foreground",
  in_progress: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  done: "bg-green-500/10 text-green-700 dark:text-green-400",
  dropped: "bg-destructive/20 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  dropped: "Dropped",
};

export function CrossProjectTaskCard({ todo }: CrossProjectTaskCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <Link
              href={`/projects/${todo.project_slug}?tab=todos`}
              className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.7rem] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {todo.project_name}
            </Link>
            <span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${PRIORITY_STYLE[todo.priority]}`}>
              {todo.priority}
            </span>
          </div>
          <h3
            className={`text-sm font-semibold ${
              todo.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {todo.title}
          </h3>
          {todo.body && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {todo.body}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <form action={cycleTodoStatusAction}>
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="project_slug" value={todo.project_slug} />
            <button
              type="submit"
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${STATUS_STYLE[todo.status]}`}
            >
              {STATUS_LABELS[todo.status] ?? todo.status}
            </button>
          </form>
          <span className="text-[0.65rem] text-muted-foreground">
            {formatRelative(todo.created_at)}
          </span>
        </div>
        {todo.status !== "done" && (
          <form action={dropTodoAction}>
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="project_slug" value={todo.project_slug} />
            <button
              type="submit"
              className="text-[0.65rem] text-muted-foreground hover:text-destructive"
            >
              Scarta
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
