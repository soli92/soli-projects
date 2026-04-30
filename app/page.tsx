import { ProjectCard } from "@/components/projects/ProjectCard";
import { listProjects } from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await listProjects();

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">I miei progetti</h1>
        <p className="mt-1 text-muted-foreground">
          {projects.length} progetti attivi nell&apos;ecosistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
