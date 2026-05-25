import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWikiPage } from "@/lib/wiki/reader";
import { WikiPageViewer } from "@/components/wiki/WikiPageViewer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getWikiPage(slug.join("/"));
  if (!page) return { title: "Pagina non trovata — Wiki" };
  return {
    title: `${page.title} — Wiki — Soli Projects`,
    description: `Pagina wiki: ${page.title}`,
  };
}

export default async function WikiSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getWikiPage(slug.join("/"));
  if (!page) notFound();

  return (
    <section className="container mx-auto max-w-4xl px-4 py-8">
      <WikiPageViewer page={page} />
    </section>
  );
}
