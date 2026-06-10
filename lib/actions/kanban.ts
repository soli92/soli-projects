"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import { directivePrioritySchema, kanbanIdSchema, kanbanStatusSchema } from "@/lib/validation/schemas";

const KANBAN_ROOT = path.join(process.cwd(), "management", "kanban");

/**
 * Resolves a kanban id to an absolute file path inside KANBAN_ROOT, guarding
 * against path traversal. Returns null if the resolved path escapes the root.
 */
function resolveKanbanFilePath(id: string): string | null {
  const filePath = path.resolve(KANBAN_ROOT, `${id}.md`);
  if (filePath !== KANBAN_ROOT && !filePath.startsWith(KANBAN_ROOT + path.sep)) {
    return null;
  }
  return filePath;
}

function nextId(prefix: string): string {
  if (!fs.existsSync(KANBAN_ROOT)) {
    fs.mkdirSync(KANBAN_ROOT, { recursive: true });
  }

  const existing = fs
    .readdirSync(KANBAN_ROOT)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".md"))
    .map((f) => {
      const num = parseInt(f.replace(prefix, "").replace(".md", ""), 10);
      return isNaN(num) ? 0 : num;
    });

  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export interface KanbanCreateState {
  error?: string;
}

export async function createKanbanTaskAction(
  _prev: KanbanCreateState,
  formData: FormData,
): Promise<KanbanCreateState> {
  const title = (formData.get("title") as string)?.trim();
  const rawPriority = (formData.get("priority") as string) || "medium";
  const priority = directivePrioritySchema.safeParse(rawPriority).success
    ? rawPriority
    : "medium";
  const parent = (formData.get("parent") as string)?.trim() || undefined;
  const project = (formData.get("project") as string)?.trim() || undefined;
  const body = (formData.get("body") as string)?.trim() || "";

  if (!title) return { error: "Titolo obbligatorio" };

  try {
    const id = nextId("TSK-");
    const fm = {
      id,
      title,
      status: "draft",
      priority,
      ...(parent ? { parent } : {}),
      ...(project ? { project } : {}),
    };

    const content = matter.stringify(body ? `\n${body}\n` : "\n", fm);
    fs.writeFileSync(path.join(KANBAN_ROOT, `${id}.md`), content, "utf-8");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore nella creazione" };
  }

  revalidatePath("/tasks");
  return {};
}

export async function updateKanbanStatusAction(formData: FormData): Promise<void> {
  // Valida id (formato EP/US/TSK-NNN) e stato (enum) prima di toccare il filesystem.
  const parsedId = kanbanIdSchema.safeParse(formData.get("id"));
  const parsedStatus = kanbanStatusSchema.safeParse(formData.get("status"));
  if (!parsedId.success || !parsedStatus.success) return;

  const id = parsedId.data;
  const newStatus = parsedStatus.data;

  // Guard di contenimento: lo stesso check sul path impedisce traversal anche se
  // il formato dell'id cambiasse in futuro.
  const filePath = resolveKanbanFilePath(id);
  if (!filePath || !fs.existsSync(filePath)) return;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    data.status = newStatus;
    const updated = matter.stringify(content, data);
    fs.writeFileSync(filePath, updated, "utf-8");
  } catch {
    // silently ignore write errors
  }

  revalidatePath("/tasks");
}
