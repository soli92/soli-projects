import Link from "next/link";

import type { PmProject } from "@/lib/supabase/types";

interface ProjectCardProps {
  project: PmProject;
}

const KIND_STYLE: Record<PmProject["kind"], string> = {
  app: "bg-primary/10 text-primary",
  service: "bg-accent text-accent-foreground",
  library: "bg-muted text-muted-foreground",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const stackPreview = project.stack.slice(0, 3).join(" · ");
  const repoUrl = `https://github.com/${project.github_owner}/${project.github_repo}`;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${KIND_STYLE[project.kind]}`}
        >
          {project.kind}
        </span>
      </div>

      <p className="mb-4 overflow-hidden text-sm text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {project.description ?? "Nessuna descrizione disponibile."}
      </p>

      <p className="mb-4 text-xs text-muted-foreground">{stackPreview || "Stack non definito"}</p>

      <div className="flex flex-wrap gap-3 text-sm">
        {project.production_url ? (
          <a
            href={project.production_url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="text-primary hover:underline"
          >
            Deployment ↗
          </a>
        ) : null}
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-primary hover:underline"
        >
          Repo ↗
        </a>
      </div>
    </Link>
  );
}
