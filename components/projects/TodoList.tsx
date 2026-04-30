import { cycleTodoStatusAction, dropTodoAction } from "@/lib/actions/todos";
import { formatRelative } from "@/lib/format/relative";
import type { PmTodo } from "@/lib/supabase/types";

interface TodoListProps {
  todos: PmTodo[];
  projectSlug: string;
}

const PRIORITY_STYLE: Record<PmTodo["priority"], string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  critical: "bg-destructive/20 text-destructive",
};

const STATUS_STYLE: Record<PmTodo["status"], string> = {
  open: "bg-secondary text-secondary-foreground",
  in_progress: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  done: "bg-muted text-muted-foreground",
  dropped: "bg-destructive/20 text-destructive",
};

function statusLabel(status: PmTodo["status"]): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    case "dropped":
      return "Dropped";
    default:
      return status;
  }
}

export function TodoList({ todos, projectSlug }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Nessun todo ancora. Aggiungine uno qui sotto.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <article key={todo.id} className="rounded-md border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className={`text-base font-semibold ${
                  todo.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {todo.title}
              </h3>
              {todo.body ? <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{todo.body}</p> : null}
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${PRIORITY_STYLE[todo.priority]}`}>
              {todo.priority}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <form action={cycleTodoStatusAction}>
                <input type="hidden" name="id" value={todo.id} />
                <input type="hidden" name="project_slug" value={projectSlug} />
                <button type="submit" className={`rounded-full px-2 py-1 text-xs ${STATUS_STYLE[todo.status]}`}>
                  {statusLabel(todo.status)}
                </button>
              </form>
              <span className="text-xs text-muted-foreground">{formatRelative(todo.created_at)}</span>
            </div>
            <form action={dropTodoAction}>
              <input type="hidden" name="id" value={todo.id} />
              <input type="hidden" name="project_slug" value={projectSlug} />
              <button type="submit" className="text-xs text-muted-foreground hover:text-destructive">
                Scarta
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
