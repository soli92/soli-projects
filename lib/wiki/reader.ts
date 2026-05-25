/**
 * Server-only: reads wiki markdown files from the filesystem,
 * parses frontmatter with gray-matter, and provides page listings.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const WIKI_ROOT = path.join(process.cwd(), "wiki");

export interface WikiFrontmatter {
  type: "source" | "concept" | "entity-person" | "entity-org" | "entity-product" | "synthesis" | "overview";
  created: string;
  updated: string;
  sources: string[];
  status: "draft" | "stable" | "needs-review";
  language?: string;
}

export interface WikiPageMeta {
  slug: string;
  category: string;
  frontmatter: WikiFrontmatter;
  title: string;
}

export interface WikiPage extends WikiPageMeta {
  body: string;
}

function stringifyDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function walkDir(dir: string, base: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".md") && entry.name !== ".gitkeep") {
      results.push(rel);
    }
  }
  return results;
}

function categoryFromSlug(slug: string): string {
  const parts = slug.split("/");
  return parts.length > 1 ? parts[0] : "root";
}

function parseFile(filePath: string, slug: string): WikiPage | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as WikiFrontmatter;

    if (!fm.type) return null;

    return {
      slug,
      category: categoryFromSlug(slug),
      frontmatter: {
        type: fm.type,
        created: stringifyDate(fm.created),
        updated: stringifyDate(fm.updated),
        sources: fm.sources ?? [],
        status: fm.status ?? "draft",
        language: fm.language,
      },
      title: extractTitle(content),
      body: content,
    };
  } catch {
    return null;
  }
}

export function listWikiPages(): WikiPageMeta[] {
  const files = walkDir(WIKI_ROOT, "");
  const pages: WikiPageMeta[] = [];

  for (const relPath of files) {
    const slug = relPath.replace(/\.md$/, "");
    const absPath = path.join(WIKI_ROOT, relPath);
    const page = parseFile(absPath, slug);
    if (page) {
      const { body: _, ...meta } = page;
      pages.push(meta);
    }
  }

  return pages.sort((a, b) => a.title.localeCompare(b.title));
}

export function getWikiPage(slug: string): WikiPage | null {
  const filePath = path.join(WIKI_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseFile(filePath, slug);
}

export function searchWikiPages(query: string): WikiPageMeta[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const all = listWikiPages();
  return all.filter((p) => {
    if (p.title.toLowerCase().includes(lower)) return true;
    const page = getWikiPage(p.slug);
    return page?.body.toLowerCase().includes(lower) ?? false;
  });
}
