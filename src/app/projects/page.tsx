import Link from 'next/link';
import TiltCard from '@/components/ui/TiltCard';
import ProjectCard from '@/components/projects/ProjectCard';
import { projects } from '@/data/projects';

export default function ProjectsPage() {
  const visible = projects.filter(p => p.visible);
  return (
    <main id="main-content" className="min-h-screen py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 inline-flex items-center gap-1">
          &larr; Back
        </Link>
        <h1 className="text-[clamp(2.75rem,11vw,6rem)] md:text-8xl font-display mb-12 md:mb-16 leading-none" style={{fontFamily: 'var(--font-display)'}}>ALL PROJECTS</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visible.map(project => (
            <TiltCard key={project.slug}>
              <ProjectCard project={project} />
            </TiltCard>
          ))}
        </div>
      </div>
    </main>
  );
}
