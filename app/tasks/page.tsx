import type { Metadata } from "next";
import { Suspense } from "react";
import { listAllTodos } from "@/lib/data/todos";
import { listProjects } from "@/lib/data/projects";
import { listKanbanItems } from "@/lib/kanban/reader";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { CrossProjectTaskBoard } from "@/components/tasks/CrossProjectTaskBoard";
import { CrossProjectTaskCard } from "@/components/tasks/CrossProjectTaskCard";
import { KanbanSection } from "@/components/tasks/KanbanSection";
import type { TodoPriority, TodoStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Task — Soli Projects",
  description: "Vista cross-progetto di tutti i task operativi e strategici",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TasksPage({ searchParams }: Props) {
  const params = await searchParams;

  const projectFilter = typeof params.project === "string" ? params.project : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";
  const priorityFilter = typeof params.priority === "string" ? params.priority : "";
  const view = typeof params.view === "string" ? params.view : "list";
  const tab = typeof params.tab === "string" ? params.tab : "operativi";

  const [todos, projects, kanbanItems] = await Promise.all([
    listAllTodos({
      projectIds: projectFilter ? [projectFilter] : undefined,
      statuses: statusFilter ? [statusFilter as TodoStatus] : undefined,
      priorities: priorityFilter ? [priorityFilter as TodoPriority] : undefined,
    }),
    listProjects(),
    listKanbanItems(),
  ]);

  const projectOptions = projects.map((p) => ({ id: p.id, slug: p.slug, name: p.name }));

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Task</h1>
        <p className="mt-1 text-muted-foreground">
          Tutti i task dell&apos;ecosistema in un&apos;unica vista
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 border-b border-border">
          <TabLink label="Operativi" value="operativi" current={tab} params={params} count={todos.length} />
          <TabLink label="Strategici" value="strategici" current={tab} params={params} count={kanbanItems.length} />
        </div>
      </div>

      {tab === "operativi" && (
        <>
          <div className="mb-6">
            <Suspense>
              <TaskFilters projects={projectOptions} />
            </Suspense>
          </div>

          {todos.length === 0 ? (
            <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Nessun task trovato con i filtri selezionati.
            </p>
          ) : view === "board" ? (
            <CrossProjectTaskBoard todos={todos} />
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <CrossProjectTaskCard key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "strategici" && (
        <KanbanSection items={kanbanItems} />
      )}
    </section>
  );
}

function TabLink({
  label,
  value,
  current,
  params,
  count,
}: {
  label: string;
  value: string;
  current: string;
  params: Record<string, string | string[] | undefined>;
  count: number;
}) {
  const sp = new URLSearchParams();
  sp.set("tab", value);
  if (typeof params.view === "string") sp.set("view", params.view);

  const isActive = current === value;

  return (
    <a
      href={`/tasks?${sp.toString()}`}
      className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.65rem] ${
          isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </a>
  );
}
