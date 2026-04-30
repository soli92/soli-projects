import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IdeaForm } from "@/components/projects/IdeaForm";
import { IdeaList } from "@/components/projects/IdeaList";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { SnapshotSection } from "@/components/projects/SnapshotSection";
import { TodoForm } from "@/components/projects/TodoForm";
import { TodoList } from "@/components/projects/TodoList";
import { listIdeasByProject } from "@/lib/data/ideas";
import { getProjectBySlug } from "@/lib/data/projects";
import { fetchAllSnapshots } from "@/lib/data/snapshots";
import { listTodosByProject } from "@/lib/data/todos";

export const dynamic = "force-dynamic";
type TabKey = "overview" | "ideas" | "todos";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; [key: string]: string | undefined }>;
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const { tab } = sp;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const tabKey: TabKey = tab === "ideas" || tab === "todos" ? tab : "overview";
  const [ideas, todos] = await Promise.all([
    listIdeasByProject(project.id),
    listTodosByProject(project.id),
  ]);
  const snapshots = tabKey === "overview" ? await fetchAllSnapshots(project) : null;

  return (
    <section className="container mx-auto max-w-4xl px-4 py-8">
      <ProjectHeader project={project} />
      <ProjectTabs
        projectSlug={project.slug}
        currentTab={tabKey}
        counts={{ ideas: ideas.length, todos: todos.length }}
        extraSearchParams={sp}
      />

      {tabKey === "overview" && snapshots ? (
        <div className="space-y-8">
          {snapshots.map((snapshot) => (
            <SnapshotSection key={snapshot.sourceType} snapshot={snapshot} />
          ))}
        </div>
      ) : null}

      {tabKey === "ideas" ? (
        <div className="space-y-6">
          <IdeaList ideas={ideas} projectSlug={project.slug} />
          <IdeaForm projectId={project.id} projectSlug={project.slug} />
        </div>
      ) : null}

      {tabKey === "todos" ? (
        <div className="space-y-6">
          <TodoList todos={todos} projectSlug={project.slug} />
          <TodoForm projectId={project.id} projectSlug={project.slug} />
        </div>
      ) : null}
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  return {
    title: project ? `${project.name} — Soli Projects` : "Progetto non trovato",
  };
}
