import type { TodoWithProject } from "@/lib/data/todos";
import { CrossProjectTaskCard } from "./CrossProjectTaskCard";

interface CrossProjectTaskBoardProps {
  todos: TodoWithProject[];
}

const COLUMNS = [
  { key: "open", label: "Open", color: "border-t-blue-500" },
  { key: "in_progress", label: "In progress", color: "border-t-orange-500" },
  { key: "done", label: "Done", color: "border-t-green-500" },
] as const;

export function CrossProjectTaskBoard({ todos }: CrossProjectTaskBoardProps) {
  const grouped = {
    open: todos.filter((t) => t.status === "open"),
    in_progress: todos.filter((t) => t.status === "in_progress"),
    done: todos.filter((t) => t.status === "done"),
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => (
        <div key={col.key} className={`rounded-lg border border-border border-t-2 ${col.color} bg-card/50 p-3`}>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {col.label}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({grouped[col.key].length})
            </span>
          </h3>
          <div className="space-y-2">
            {grouped[col.key].map((todo) => (
              <CrossProjectTaskCard key={todo.id} todo={todo} />
            ))}
            {grouped[col.key].length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Nessun task
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
