import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/data/projects';

export async function generateStaticParams() {
  return projects.filter(p => p.visible).map(p => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen py-24 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/projects" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 inline-flex items-center gap-1">
          &larr; All Projects
        </Link>
        <div className="relative h-64 md:h-96 w-full rounded-sm overflow-hidden mb-10">
          <Image src={project.image} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" />
        </div>
        <h1 className="text-5xl md:text-7xl font-display mb-3" style={{fontFamily: 'var(--font-display)'}}>{project.title}</h1>
        <p className="text-[var(--accent)] mb-6">{project.tagline}</p>
        <p className="text-[var(--text-muted)] leading-relaxed mb-8">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {project.tech.map(t => (
            <span key={t} className="text-sm px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">{t}</span>
          ))}
        </div>
        <div className="flex gap-4">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline">
              View Live Site &rarr;
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
              GitHub &rarr;
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
