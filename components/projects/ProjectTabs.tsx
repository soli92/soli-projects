import Link from "next/link";

type TabKey = "overview" | "ideas" | "todos";

interface Props {
  projectSlug: string;
  currentTab: TabKey;
  counts: { ideas: number; todos: number };
  extraSearchParams?: Record<string, string | undefined>;
}

export function ProjectTabs({ projectSlug, currentTab, counts, extraSearchParams }: Props) {
  const tabs: Array<{ key: TabKey; label: string; count?: number }> = [
    { key: "overview", label: "Overview" },
    { key: "ideas", label: "Idee", count: counts.ideas },
    { key: "todos", label: "Todo", count: counts.todos },
  ];

  return (
    <nav className="mb-6 flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const query = new URLSearchParams();
        if (extraSearchParams) {
          for (const [key, value] of Object.entries(extraSearchParams)) {
            if (key === "tab" || !value) continue;
            query.set(key, value);
          }
        }
        if (tab.key !== "overview") query.set("tab", tab.key);

        const qs = query.toString();
        const href = qs ? `/projects/${projectSlug}?${qs}` : `/projects/${projectSlug}`;
        const isActive = currentTab === tab.key;

        return (
          <Link
            key={tab.key}
            href={href}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && tab.count > 0 ? (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
