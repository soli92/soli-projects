import { discardIdeaAction } from "@/lib/actions/ideas";
import { formatRelative } from "@/lib/format/relative";
import type { PmIdea } from "@/lib/supabase/types";

interface IdeaListProps {
  ideas: PmIdea[];
  projectSlug: string;
}

const IDEA_STATUS_STYLE: Record<PmIdea["status"], string> = {
  draft: "bg-secondary text-secondary-foreground",
  refined: "bg-primary/10 text-primary",
  converted: "bg-muted text-muted-foreground",
  discarded: "bg-destructive/20 text-destructive",
};

export function IdeaList({ ideas, projectSlug }: IdeaListProps) {
  if (ideas.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Nessuna idea ancora. Aggiungine una qui sotto.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <article key={idea.id} className="rounded-md border border-border bg-card p-4">
          <h3 className="text-base font-semibold text-foreground">{idea.title}</h3>
          {idea.body ? <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{idea.body}</p> : null}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-1 ${IDEA_STATUS_STYLE[idea.status]}`}>
                {idea.status}
              </span>
              <span className="text-muted-foreground">{formatRelative(idea.created_at)}</span>
            </div>
            <form action={discardIdeaAction}>
              <input type="hidden" name="id" value={idea.id} />
              <input type="hidden" name="project_slug" value={projectSlug} />
              <button type="submit" className="text-xs text-muted-foreground hover:text-destructive">
                Scarta
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
