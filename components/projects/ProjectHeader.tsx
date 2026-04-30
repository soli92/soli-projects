import Link from "next/link";

import type { PmProject } from "@/lib/supabase/types";

interface ProjectHeaderProps {
  project: PmProject;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const repoUrl = `https://github.com/${project.github_owner}/${project.github_repo}`;

  return (
    <section>
      <Link href="/" className="text-sm text-primary hover:underline">
        ← Dashboard
      </Link>

      <h1 className="mt-3 text-3xl font-bold text-foreground">{project.name}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-primary/10 px-2 py-1 capitalize text-primary">
          {project.kind}
        </span>
        <span className="rounded-full bg-muted px-2 py-1 capitalize text-muted-foreground">
          {project.status}
        </span>
        <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {project.slug}
        </code>
      </div>

      {project.description ? (
        <p className="mt-4 text-sm text-muted-foreground">{project.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {project.production_url ? (
          <a
            href={project.production_url}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Deployment ↗
          </a>
        ) : null}
        <a href={repoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          Repo ↗
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.length ? (
          project.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Stack non definito</span>
        )}
      </div>
    </section>
  );
}
