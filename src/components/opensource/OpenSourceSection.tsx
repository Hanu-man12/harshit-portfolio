'use client';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { pullRequests } from '@/data/openSource';
import SectionHeading from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

function StatusBadge({ status }: { status: string }) {
  if (status === 'merged') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/30">
        MERGED
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
      IN REVIEW
    </span>
  );
}

export default function OpenSourceSection() {
  const visible = pullRequests.filter(pr => pr.visible);
  return (
    <section id="open-source" className="py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading title="OPEN SOURCE" subtitle="Contributions to PostgreSQL ecosystem tools" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{once: true}}
          variants={staggerContainer}
          className="flex flex-col gap-4"
        >
          {visible.map(pr => (
            <motion.div
              key={pr.id}
              variants={fadeUp}
              className="flex items-start gap-4 border border-[var(--border)] bg-[var(--surface)] p-5 rounded-sm hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="text-xs text-[var(--text-muted)]" style={{fontFamily: 'var(--font-mono)'}}>
                    {pr.repo}#{pr.prNumber}
                  </span>
                  <StatusBadge status={pr.status} />
                </div>
                <h3 className="text-[var(--text)] font-medium mb-1">{pr.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{pr.description}</p>
              </div>
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View PR ${pr.prNumber} on GitHub`}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] mt-1 shrink-0"
              >
                <ExternalLink size={18} />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
