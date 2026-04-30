/**
 * Parser markdown minimale che divide il contenuto in sezioni
 * basate su header H2 (##) e H3 (###).
 *
 * Output: dizionario { "Nome Sezione": "contenuto..." }
 *
 * Le sezioni sono identificate dal testo dell'header (trim).
 * Se ci sono sezioni con stesso nome, l'ultima vince (caso limite).
 */
export function parseMarkdownSections(content: string): Record<string, string> {
  if (!content.trim()) return {};

  const sections: Record<string, string> = {};
  const lines = content.split("\n");

  let currentKey = "_intro";
  let currentBuf: string[] = [];

  const flush = () => {
    const trimmed = currentBuf.join("\n").trim();
    if (trimmed) sections[currentKey] = trimmed;
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h2 || h3) {
      flush();
      currentKey = (h2?.[1] ?? h3?.[1] ?? "").trim();
      currentKey = currentKey.replace(/^[\p{Emoji}\s]+/u, "").trim();
      currentBuf = [];
    } else {
      currentBuf.push(line);
    }
  }
  flush();

  return sections;
}

/**
 * Estrae solo le sezioni di interesse per il dashboard.
 * Tollera sinonimi italiano/inglese e variazioni con/senza emoji.
 */
export function extractKnownSections(
  sections: Record<string, string>
): {
  objectives?: string;
  done?: string;
  lessons?: string;
  debt?: string;
  open?: string;
  intro?: string;
} {
  const norm = (s: string) => s.toLowerCase().trim();

  const findKey = (candidates: string[]): string | undefined => {
    for (const k of Object.keys(sections)) {
      const kn = norm(k);
      if (candidates.some((c) => kn.includes(c))) return k;
    }
    return undefined;
  };

  const result: ReturnType<typeof extractKnownSections> = {};

  const introKey = "_intro";
  if (sections[introKey]) result.intro = sections[introKey];

  const objKey = findKey(["obiettiv", "objective", "goal"]);
  if (objKey) result.objectives = sections[objKey];

  const doneKey = findKey(["fatto", "done", "completed", "stato"]);
  if (doneKey) result.done = sections[doneKey];

  const lessKey = findKey(["lezion", "lesson", "learning"]);
  if (lessKey) result.lessons = sections[lessKey];

  const debtKey = findKey(["debito", "debt", "tech debt"]);
  if (debtKey) result.debt = sections[debtKey];

  const openKey = findKey(["aperto", "open", "next", "prossim"]);
  if (openKey) result.open = sections[openKey];

  return result;
}
