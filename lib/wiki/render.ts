/**
 * Server-only: renders wiki markdown to sanitized HTML with wikilink resolution.
 * Uses remark -> remark-gfm -> remark-rehype -> rehype-raw -> rehype-sanitize
 * -> rehype-stringify so the final HTML is always sanitized.
 */

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/**
 * Sanitization schema: starts from rehype-sanitize's defaultSchema (which
 * already strips javascript: URLs and on* event handlers) and additionally
 * allows <sup class title> used by citation markers.
 */
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "sup"],
  attributes: {
    ...defaultSchema.attributes,
    sup: ["className", "title"],
  },
};

/** Escapes characters that could break HTML attribute/markup structure. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Transforms [[page-name]] wikilinks into clickable markdown links
 * before the remark pipeline processes the markdown.
 */
function resolveWikiLinks(md: string): string {
  return md.replace(/\[\[([^\]]+)\]\]/g, (_match, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    return `[${escapeHtml(name)}](/wiki/${encodeURI(slug)})`;
  });
}

/**
 * Strips citation markers like [^src: raw/file.md §Section] from the rendered text
 * and converts them to small superscript references.
 */
function formatCitations(md: string): string {
  return md.replace(
    /\[\^src:\s*([^\]]+)\]/g,
    (_match, ref: string) => {
      const short = escapeHtml(ref.replace(/^raw\//, "").trim());
      return `<sup class="text-muted-foreground text-[0.65rem]" title="${escapeHtml(ref)}">[${short}]</sup>`;
    },
  );
}

export async function renderWikiMarkdown(markdown: string): Promise<string> {
  const processed = formatCitations(resolveWikiLinks(markdown));

  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(processed);

  return String(result);
}
