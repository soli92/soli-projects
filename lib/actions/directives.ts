"use server";

import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import { createFileInRepo } from "@/lib/github/writer";
import { directivePrioritySchema } from "@/lib/validation/schemas";

export interface DirectiveActionState {
  error?: string;
  success?: boolean;
  url?: string;
}

export async function createDirectiveAction(
  _prev: DirectiveActionState,
  formData: FormData,
): Promise<DirectiveActionState> {
  const owner = (formData.get("owner") as string)?.trim();
  const repo = (formData.get("repo") as string)?.trim();
  const projectSlug = (formData.get("project_slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim() || "";
  const rawPriority = (formData.get("priority") as string) || "medium";
  const wikiRefs = (formData.get("wiki_refs") as string)?.trim() || "";

  if (!owner || !repo) return { error: "Owner e repo sono obbligatori" };
  if (!title) return { error: "Titolo obbligatorio" };

  // Valida la priorità contro l'enum ammesso prima di costruire il front-matter.
  const parsedPriority = directivePrioritySchema.safeParse(rawPriority);
  if (!parsedPriority.success) return { error: "Priorità non valida" };
  const priority = parsedPriority.data;

  const id = `DIR-${Date.now()}`;
  const date = new Date().toISOString().split("T")[0];

  const refs = wikiRefs
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const fm = {
    id,
    from: "soli-projects",
    date,
    priority,
    ...(refs.length > 0 ? { wiki_refs: refs } : {}),
  };

  const mdContent = matter.stringify(
    `\n# ${title}\n\n${body}\n`,
    fm,
  );

  const filePath = `directives/${id}.md`;

  try {
    const result = await createFileInRepo({
      owner,
      repo,
      path: filePath,
      content: mdContent,
      message: `chore: directive ${id} from soli-projects`,
    });

    if (projectSlug) {
      revalidatePath(`/projects/${projectSlug}`);
    }

    return { success: true, url: result.htmlUrl };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Errore nell'invio della direttiva",
    };
  }
}
