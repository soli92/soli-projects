/**
 * Server-only: renders wiki markdown to HTML with wikilink resolution.
 * Uses remark + remark-gfm + remark-html pipeline.
 */

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

/**
 * Transforms [[page-name]] wikilinks into clickable <a> links
 * before the remark pipeline processes the markdown.
 */
function resolveWikiLinks(md: string): string {
  return md.replace(/\[\[([^\]]+)\]\]/g, (_match, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    return `[${name}](/wiki/${slug})`;
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
      const short = ref.replace(/^raw\//, "").trim();
      return `<sup class="text-muted-foreground text-[0.65rem]" title="${ref}">[${short}]</sup>`;
    },
  );
}

export async function renderWikiMarkdown(markdown: string): Promise<string> {
  const processed = formatCitations(resolveWikiLinks(markdown));

  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(processed);

  return String(result);
}
