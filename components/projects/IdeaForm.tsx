"use client";

import { useActionState } from "react";

import { createIdeaAction, type IdeaActionState } from "@/lib/actions/ideas";

interface Props {
  projectId: string;
  projectSlug: string;
}

export function IdeaForm({ projectId, projectSlug }: Props) {
  const [state, formAction, pending] = useActionState<IdeaActionState, FormData>(createIdeaAction, {});

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="project_slug" value={projectSlug} />

      <div>
        <input
          name="title"
          placeholder="Titolo idea..."
          required
          maxLength={200}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {state.fieldErrors?.title ? (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div>
        <textarea
          name="body"
          placeholder="Dettagli (opzionale)..."
          rows={3}
          maxLength={5000}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {state.fieldErrors?.body ? (
          <p className="mt-1 text-sm text-destructive">{state.fieldErrors.body[0]}</p>
        ) : null}
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Aggiungi idea"}
      </button>
    </form>
  );
}
