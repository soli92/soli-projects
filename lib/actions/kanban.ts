"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import type { KanbanStatus } from "@/lib/kanban/reader";

const KANBAN_ROOT = path.join(process.cwd(), "management", "kanban");

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
  const priority = (formData.get("priority") as string) || "medium";
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
  const id = formData.get("id") as string;
  const newStatus = formData.get("status") as KanbanStatus;
  if (!id || !newStatus) return;

  const filePath = path.join(KANBAN_ROOT, `${id}.md`);
  if (!fs.existsSync(filePath)) return;

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
