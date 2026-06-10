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

/**
 * Resolves a slug to an absolute file path inside WIKI_ROOT, guarding against
 * path traversal. Returns null if the resolved path escapes the wiki directory.
 * Legitimate nested slugs (e.g. "sources/foo") are preserved.
 */
function resolveWikiFilePath(slug: string): string | null {
  const filePath = path.resolve(WIKI_ROOT, `${slug}.md`);
  if (filePath !== WIKI_ROOT && !filePath.startsWith(WIKI_ROOT + path.sep)) {
    return null;
  }
  return filePath;
}

/**
 * Parses every wiki page (including its body). Shared by listWikiPages and
 * searchWikiPages to avoid re-reading + re-parsing each file twice.
 */
function readAllWikiPages(): WikiPage[] {
  const files = walkDir(WIKI_ROOT, "");
  const pages: WikiPage[] = [];

  for (const relPath of files) {
    const slug = relPath.replace(/\.md$/, "");
    const absPath = path.join(WIKI_ROOT, relPath);
    const page = parseFile(absPath, slug);
    if (page) {
      pages.push(page);
    }
  }

  return pages.sort((a, b) => a.title.localeCompare(b.title));
}

export function listWikiPages(): WikiPageMeta[] {
  return readAllWikiPages().map(({ body: _, ...meta }) => meta);
}

export function getWikiPage(slug: string): WikiPage | null {
  const filePath = resolveWikiFilePath(slug);
  if (!filePath) return null;
  if (!fs.existsSync(filePath)) return null;
  return parseFile(filePath, slug);
}

export function searchWikiPages(query: string): WikiPageMeta[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return readAllWikiPages()
    .filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.body.toLowerCase().includes(lower),
    )
    .map(({ body: _, ...meta }) => meta);
}
