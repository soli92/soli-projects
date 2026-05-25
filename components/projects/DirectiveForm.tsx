"use client";

import { useActionState } from "react";
import { createDirectiveAction, type DirectiveActionState } from "@/lib/actions/directives";

interface DirectiveFormProps {
  owner: string;
  repo: string;
  projectSlug: string;
}

const initialState: DirectiveActionState = {};

export function DirectiveForm({ owner, repo, projectSlug }: DirectiveFormProps) {
  const [state, action, isPending] = useActionState(createDirectiveAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="owner" value={owner} />
      <input type="hidden" name="repo" value={repo} />
      <input type="hidden" name="project_slug" value={projectSlug} />

      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          Direttiva inviata.{" "}
          {state.url && (
            <a
              href={state.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Vedi su GitHub
            </a>
          )}
        </div>
      )}

      <div>
        <label htmlFor="dir-title" className="mb-1 block text-sm font-medium text-foreground">
          Titolo
        </label>
        <input
          id="dir-title"
          name="title"
          type="text"
          required
          maxLength={200}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="es. Aggiornare dipendenza SoliDS a ^1.15"
        />
      </div>

      <div>
        <label htmlFor="dir-body" className="mb-1 block text-sm font-medium text-foreground">
          Descrizione
        </label>
        <textarea
          id="dir-body"
          name="body"
          rows={4}
          maxLength={5000}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Dettagli della direttiva..."
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="dir-priority" className="mb-1 block text-sm font-medium text-foreground">
            Priorita
          </label>
          <select
            id="dir-priority"
            name="priority"
            defaultValue="medium"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="dir-refs" className="mb-1 block text-sm font-medium text-foreground">
            Riferimenti wiki (separati da virgola)
          </label>
          <input
            id="dir-refs"
            name="wiki_refs"
            type="text"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="es. wiki/concepts/rag-pipeline"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Invio..." : "Invia direttiva"}
      </button>
    </form>
  );
}
