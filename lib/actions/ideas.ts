"use server";

import { revalidatePath } from "next/cache";

import { createIdea, discardIdea } from "@/lib/data/ideas";
import { ideaCreateSchema } from "@/lib/validation/schemas";

export interface IdeaActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createIdeaAction(
  _prev: IdeaActionState,
  formData: FormData
): Promise<IdeaActionState> {
  const projectSlug = formData.get("project_slug");
  const projectId = formData.get("project_id");

  const parsed = ideaCreateSchema.safeParse({
    project_id: projectId,
    title: formData.get("title"),
    body: formData.get("body"),
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
    await createIdea({
      project_id: parsed.data.project_id,
      title: parsed.data.title,
      body: parsed.data.body || undefined,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore sconosciuto" };
  }

  if (typeof projectSlug === "string") {
    revalidatePath(`/projects/${projectSlug}`);
  }

  return {};
}

export async function discardIdeaAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const projectSlug = formData.get("project_slug");
  if (typeof id !== "string") return;

  await discardIdea(id);

  if (typeof projectSlug === "string") {
    revalidatePath(`/projects/${projectSlug}`);
  }
}
