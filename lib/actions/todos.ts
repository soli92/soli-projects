"use server";

import { revalidatePath } from "next/cache";

import { cycleTodoStatus, createTodo, updateTodoStatus } from "@/lib/data/todos";
import { todoCreateSchema } from "@/lib/validation/schemas";

export interface TodoActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createTodoAction(
  _prev: TodoActionState,
  formData: FormData
): Promise<TodoActionState> {
  const projectSlug = formData.get("project_slug");
  const projectId = formData.get("project_id");

  const parsed = todoCreateSchema.safeParse({
    project_id: projectId,
    title: formData.get("title"),
    body: formData.get("body"),
    priority: formData.get("priority") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_root";
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key]!.push(issue.message);
    }
    return { fieldErrors };
  }

  try {
    await createTodo({
      project_id: parsed.data.project_id,
      title: parsed.data.title,
      body: parsed.data.body || undefined,
      priority: parsed.data.priority,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore sconosciuto" };
  }

  if (typeof projectSlug === "string") {
    revalidatePath(`/projects/${projectSlug}`);
  }

  return {};
}

export async function cycleTodoStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const projectSlug = formData.get("project_slug");
  if (typeof id !== "string") return;

  await cycleTodoStatus(id);

  if (typeof projectSlug === "string") {
    revalidatePath(`/projects/${projectSlug}`);
  }
}

export async function dropTodoAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const projectSlug = formData.get("project_slug");
  if (typeof id !== "string") return;

  await updateTodoStatus(id, "dropped");

  if (typeof projectSlug === "string") {
    revalidatePath(`/projects/${projectSlug}`);
  }
}
