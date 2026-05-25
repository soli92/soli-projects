"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { PmProject } from "@/lib/supabase/types";

interface TaskFiltersProps {
  projects: Pick<PmProject, "id" | "slug" | "name">[];
}

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
] as const;

const PRIORITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export function TaskFilters({ projects }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentProject = searchParams.get("project") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentPriority = searchParams.get("priority") ?? "";
  const currentView = searchParams.get("view") ?? "list";

  const update = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        router.push(`/tasks?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentProject}
        onChange={(e) => update("project", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">Tutti i progetti</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={currentStatus}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">Tutti gli stati</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={currentPriority}
        onChange={(e) => update("priority", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">Tutte le priorita</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-1 rounded-lg border border-border p-0.5">
        <button
          onClick={() => update("view", "list")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            currentView === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Lista
        </button>
        <button
          onClick={() => update("view", "board")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            currentView === "board"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Board
        </button>
      </div>

      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      )}
    </div>
  );
}
