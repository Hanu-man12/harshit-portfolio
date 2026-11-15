import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { pullRequests } from '@/data/openSource';

function StatusBadge({ status }: { status: string }) {
  if (status === 'merged') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/30">MERGED</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">IN REVIEW</span>;
}

export default function OpenSourcePage() {
  const visible = pullRequests.filter(pr => pr.visible);
  return (
    <main id="main-content" className="min-h-screen py-24 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 inline-flex items-center gap-1">
          &larr; Back
        </Link>
        <h1 className="text-[clamp(2.75rem,11vw,6rem)] md:text-8xl font-display mb-12 md:mb-16 leading-none" style={{fontFamily: 'var(--font-display)'}}>OPEN SOURCE</h1>
        <div className="flex flex-col gap-4">
          {visible.map(pr => (
            <div key={pr.id} className="flex items-start gap-4 border border-[var(--border)] bg-[var(--surface)] p-5 rounded-sm">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="text-xs text-[var(--text-muted)]" style={{fontFamily: 'monospace'}}>{pr.repo}#{pr.prNumber}</span>
                  <StatusBadge status={pr.status} />
                </div>
                <h3 className="text-[var(--text)] font-medium mb-1">{pr.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{pr.description}</p>
              </div>
              <a href={pr.url} target="_blank" rel="noopener noreferrer" aria-label={`View PR ${pr.prNumber}`} className="text-[var(--text-muted)] hover:text-[var(--accent)] mt-1 shrink-0">
                <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
