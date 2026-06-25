import type { ProjectSnapshot } from "@/lib/data/snapshots";

interface SnapshotSectionProps {
  snapshot: ProjectSnapshot;
}

const SOURCE_TITLE: Record<ProjectSnapshot["sourceType"], string> = {
  ai_log: "AI Log",
  agents_md: "AGENTS",
  weekly_log: "Weekly Log",
  readme: "README",
};

interface SectionView {
  title: string;
  content?: string;
}

function getSectionViews(snapshot: ProjectSnapshot): SectionView[] {
  if (!snapshot.available || !snapshot.knownSections) return [];

  const views: SectionView[] = [
    { title: "🎯 Obiettivi", content: snapshot.knownSections.objectives },
    { title: "✅ Cosa fatto", content: snapshot.knownSections.done },
    { title: "🧠 Lezioni", content: snapshot.knownSections.lessons },
    { title: "🐛 Debito", content: snapshot.knownSections.debt },
    { title: "🚀 Aperto", content: snapshot.knownSections.open },
  ];

  if (snapshot.sourceType !== "weekly_log") return views;

  const weeklyEntries = Object.entries(snapshot.sections ?? {})
    .filter(([key]) => key.toLowerCase().startsWith("settimana"))
    .slice(-2)
    .map(([key, value]) => ({ title: key, content: value }));

  return [...views, ...weeklyEntries];
}

export function SnapshotSection({ snapshot }: SnapshotSectionProps) {
  const sectionViews = getSectionViews(snapshot);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">{SOURCE_TITLE[snapshot.sourceType]}</h2>

      {!snapshot.available ? (
        <p className="mt-3 text-sm text-muted-foreground">Non presente in questo repo.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {sectionViews.map((section) => (
            <details key={section.title} className="group rounded-md bg-muted/40">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 [&::-webkit-details-marker]:hidden">
                <span>{section.title}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-4 pb-4 pt-1">
                {section.content ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {section.content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sezione non disponibile.</p>
                )}
              </div>
            </details>
          ))}
          {sectionViews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna sezione nota rilevata in questo documento.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
