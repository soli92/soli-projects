/**
 * Server-only: reads kanban markdown files from management/kanban/.
 * Parses frontmatter to extract epics, user stories, and tasks.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const KANBAN_ROOT = path.join(process.cwd(), "management", "kanban");

export type KanbanItemType = "epic" | "user-story" | "task";
export type KanbanStatus = "draft" | "ready" | "in-progress" | "done" | "blocked" | "dropped";

export interface KanbanFrontmatter {
  id: string;
  title: string;
  status: KanbanStatus;
  priority: "low" | "medium" | "high" | "critical";
  parent?: string;
  project?: string;
  assignee?: string;
}

export interface KanbanItem {
  filename: string;
  type: KanbanItemType;
  frontmatter: KanbanFrontmatter;
  body: string;
}

function detectType(filename: string): KanbanItemType | null {
  if (filename.startsWith("EP-")) return "epic";
  if (filename.startsWith("US-")) return "user-story";
  if (filename.startsWith("TSK-")) return "task";
  return null;
}

function parseKanbanFile(filePath: string, filename: string): KanbanItem | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const type = detectType(filename);
    if (!type) return null;

    return {
      filename,
      type,
      frontmatter: {
        id: (data.id as string) ?? filename.replace(/\.md$/, ""),
        title: (data.title as string) ?? "Untitled",
        status: (data.status as KanbanStatus) ?? "draft",
        priority: (data.priority as KanbanFrontmatter["priority"]) ?? "medium",
        parent: data.parent as string | undefined,
        project: data.project as string | undefined,
        assignee: data.assignee as string | undefined,
      },
      body: content,
    };
  } catch {
    return null;
  }
}

export function listKanbanItems(): KanbanItem[] {
  if (!fs.existsSync(KANBAN_ROOT)) return [];

  const files = fs.readdirSync(KANBAN_ROOT).filter((f) => f.endsWith(".md"));
  const items: KanbanItem[] = [];

  for (const file of files) {
    const item = parseKanbanFile(path.join(KANBAN_ROOT, file), file);
    if (item) items.push(item);
  }

  const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return items.sort(
    (a, b) => (priorityWeight[b.frontmatter.priority] ?? 0) - (priorityWeight[a.frontmatter.priority] ?? 0),
  );
}

export function listEpics(): KanbanItem[] {
  return listKanbanItems().filter((i) => i.type === "epic");
}

export function listUserStories(epicId?: string): KanbanItem[] {
  const stories = listKanbanItems().filter((i) => i.type === "user-story");
  if (epicId) return stories.filter((s) => s.frontmatter.parent === epicId);
  return stories;
}

export function listTasks(storyId?: string): KanbanItem[] {
  const tasks = listKanbanItems().filter((i) => i.type === "task");
  if (storyId) return tasks.filter((t) => t.frontmatter.parent === storyId);
  return tasks;
}

export function getKanbanItem(id: string): KanbanItem | null {
  const items = listKanbanItems();
  return items.find((i) => i.frontmatter.id === id) ?? null;
}
