/**
 * Server-only: reads kanban markdown files from management/kanban/.
 * Supports PATTERN.md §4 nested directory structure:
 *   EP-XXX-<slug>/EP-XXX.md
 *   EP-XXX-<slug>/US-YYY-<slug>/US-YYY.md
 *   EP-XXX-<slug>/US-YYY-<slug>/TSK-ZZZ.md
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
  epic?: string;
  layer?: string;
  consumer?: string;
  estimate?: string;
  confidence?: number;
  wiki_page?: string;
  wiki_pages?: string[];
  role?: string;
  sprint?: string;
  blocked_by?: string[];
}

export interface KanbanItem {
  filename: string;
  relativePath: string;
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

function inferParent(relativePath: string, type: KanbanItemType): string | undefined {
  const parts = relativePath.split(path.sep);
  if (type === "task" || type === "user-story") {
    for (let i = parts.length - 2; i >= 0; i--) {
      const dir = parts[i];
      if (type === "task" && dir.startsWith("US-")) {
        return dir.match(/^(US-\d+)/)?.[1];
      }
      if (type === "user-story" && dir.startsWith("EP-")) {
        return dir.match(/^(EP-\d+)/)?.[1];
      }
    }
  }
  return undefined;
}

function inferEpic(relativePath: string): string | undefined {
  const parts = relativePath.split(path.sep);
  for (const dir of parts) {
    if (dir.startsWith("EP-")) {
      return dir.match(/^(EP-\d+)/)?.[1];
    }
  }
  return undefined;
}

function parseKanbanFile(filePath: string, relativePath: string, filename: string): KanbanItem | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const type = detectType(filename);
    if (!type) return null;

    const parent = (data.parent as string) ?? inferParent(relativePath, type);
    const epic = type !== "epic" ? ((data.epic as string) ?? inferEpic(relativePath)) : undefined;

    return {
      filename,
      relativePath,
      type,
      frontmatter: {
        id: (data.id as string) ?? filename.replace(/\.md$/, ""),
        title: (data.title as string) ?? "Untitled",
        status: (data.status as KanbanStatus) ?? "draft",
        priority: (data.priority as KanbanFrontmatter["priority"]) ?? "medium",
        parent,
        epic,
        layer: data.layer as string | undefined,
        consumer: data.consumer as string | undefined,
        estimate: data.estimate as string | undefined,
        confidence: data.confidence as number | undefined,
        wiki_page: data.wiki_page as string | undefined,
        wiki_pages: data.wiki_pages as string[] | undefined,
        role: data.role as string | undefined,
        sprint: data.sprint as string | undefined,
        blocked_by: data.blocked_by as string[] | undefined,
      },
      body: content,
    };
  } catch {
    return null;
  }
}

function walkDir(dir: string, baseDir: string): KanbanItem[] {
  if (!fs.existsSync(dir)) return [];

  const items: KanbanItem[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      items.push(...walkDir(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".md") && detectType(entry.name)) {
      const relativePath = path.relative(baseDir, fullPath);
      const item = parseKanbanFile(fullPath, relativePath, entry.name);
      if (item) items.push(item);
    }
  }

  return items;
}

const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function listKanbanItems(): KanbanItem[] {
  return walkDir(KANBAN_ROOT, KANBAN_ROOT).sort(
    (a, b) => (priorityWeight[b.frontmatter.priority] ?? 0) - (priorityWeight[a.frontmatter.priority] ?? 0),
  );
}

export function listEpics(): KanbanItem[] {
  return listKanbanItems().filter((i) => i.type === "epic");
}

export function listUserStories(epicId?: string): KanbanItem[] {
  const stories = listKanbanItems().filter((i) => i.type === "user-story");
  if (epicId) return stories.filter((s) => s.frontmatter.parent === epicId || s.frontmatter.epic === epicId);
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
