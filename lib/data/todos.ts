import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PmTodo, TodoPriority, TodoStatus } from "@/lib/supabase/types";

export interface CreateTodoParams {
  project_id: string;
  title: string;
  body?: string;
  priority: TodoPriority;
  source?: "manual" | "agent" | "sync" | "extracted";
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
  const payload = {
    status,
    completed_at: status === "done" ? new Date().toISOString() : null,
  };
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

  const next: TodoStatus =
    current?.status === "open"
      ? "in_progress"
      : current?.status === "in_progress"
        ? "done"
        : "open";

  await updateTodoStatus(id, next);
  return next;
}
