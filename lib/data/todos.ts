import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PmProject, PmTodo, TodoPriority, TodoStatus } from "@/lib/supabase/types";

export interface CreateTodoParams {
  project_id: string;
  title: string;
  body?: string;
  priority: TodoPriority;
  source?: "manual" | "agent" | "sync" | "extracted";
}

export interface TodoWithProject extends PmTodo {
  project_slug: string;
  project_name: string;
}

export interface ListAllTodosFilters {
  projectIds?: string[];
  statuses?: TodoStatus[];
  priorities?: TodoPriority[];
}

function priorityWeight(priority: TodoPriority): number {
  switch (priority) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

export async function createTodo(params: CreateTodoParams): Promise<PmTodo> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pm_todos")
    .insert({
      project_id: params.project_id,
      title: params.title,
      body: params.body || null,
      priority: params.priority,
      source: params.source ?? "manual",
      status: "open",
    })
    .select()
    .single();

  if (error) throw new Error(`createTodo failed: ${error.message}`);
  return data;
}

export async function listTodosByProject(projectId: string): Promise<PmTodo[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pm_todos")
    .select("*")
    .eq("project_id", projectId)
    .neq("status", "dropped")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listTodosByProject failed: ${error.message}`);

  return (data ?? []).sort((a, b) => {
    const delta = priorityWeight(b.priority) - priorityWeight(a.priority);
    if (delta !== 0) return delta;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function updateTodoStatus(id: string, status: TodoStatus): Promise<void> {
  const supabase = getSupabaseAdmin();
  // completed_at viene impostato solo nella transizione verso "done".
  // Per gli altri stati lo si omette dal payload, così non si azzera un
  // timestamp di completamento già presente (es. done -> dropped).
  const payload =
    status === "done"
      ? { status, completed_at: new Date().toISOString() }
      : { status };
  const { error } = await supabase.from("pm_todos").update(payload).eq("id", id);
  if (error) throw new Error(`updateTodoStatus failed: ${error.message}`);
}

export async function cycleTodoStatus(id: string): Promise<TodoStatus> {
  const supabase = getSupabaseAdmin();
  const { data: current, error } = await supabase
    .from("pm_todos")
    .select("status")
    .eq("id", id)
    .single();

  if (error) throw new Error(`cycleTodoStatus failed: ${error.message}`);

  // Il ciclo riguarda solo open -> in_progress -> done -> open.
  // Uno stato "dropped" non viene resuscitato: resta dropped.
  const status = current?.status as TodoStatus | undefined;
  if (status === "dropped") {
    return "dropped";
  }

  const next: TodoStatus =
    status === "open"
      ? "in_progress"
      : status === "in_progress"
        ? "done"
        : "open";

  await updateTodoStatus(id, next);
  return next;
}

export async function listAllTodos(filters?: ListAllTodosFilters): Promise<TodoWithProject[]> {
  const supabase = getSupabaseAdmin();

  const { data: projects, error: projErr } = await supabase
    .from("pm_projects")
    .select("id, slug, name")
    .eq("status", "active");

  if (projErr) throw new Error(`listAllTodos projects failed: ${projErr.message}`);

  const projectMap = new Map<string, Pick<PmProject, "slug" | "name">>();
  for (const p of projects ?? []) {
    projectMap.set(p.id, { slug: p.slug, name: p.name });
  }

  let query = supabase
    .from("pm_todos")
    .select("*")
    .neq("status", "dropped")
    .order("created_at", { ascending: false });

  if (filters?.projectIds?.length) {
    query = query.in("project_id", filters.projectIds);
  }
  if (filters?.statuses?.length) {
    query = query.in("status", filters.statuses);
  }
  if (filters?.priorities?.length) {
    query = query.in("priority", filters.priorities);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listAllTodos failed: ${error.message}`);

  const todos: TodoWithProject[] = (data ?? [])
    .filter((t) => projectMap.has(t.project_id))
    .map((t) => {
      const proj = projectMap.get(t.project_id)!;
      return { ...t, project_slug: proj.slug, project_name: proj.name };
    });

  return todos.sort((a, b) => {
    const delta = priorityWeight(b.priority) - priorityWeight(a.priority);
    if (delta !== 0) return delta;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
