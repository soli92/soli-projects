import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { SnapshotSection } from "@/components/projects/SnapshotSection";
import { getProjectBySlug } from "@/lib/data/projects";
import { fetchAllSnapshots } from "@/lib/data/snapshots";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const snapshots = await fetchAllSnapshots(project);

  return (
    <section className="container mx-auto max-w-4xl px-4 py-8">
      <ProjectHeader project={project} />

      <div className="mt-8 space-y-8">
        {snapshots.map((snapshot) => (
          <SnapshotSection key={snapshot.sourceType} snapshot={snapshot} />
        ))}
      </div>
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
