import Counter from '@/components/ui/Counter';
import { projects } from '@/data/projects';
import { achievements } from '@/data/achievements';
import { pullRequests } from '@/data/openSource';

const STATS = [
  { value: projects.filter(p => p.visible).length, label: 'Projects Built' },
  { value: achievements.filter(a => a.visible).length, label: 'Hackathon Finals' },
  { value: pullRequests.filter(pr => pr.status === 'merged').length, label: 'PRs Merged' },
];

export default function HeroStats() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 sm:gap-8 mt-8">
      {STATS.map(stat => (
        <div key={stat.label}>
          <div className="text-4xl font-display text-[var(--accent)]" style={{fontFamily: 'var(--font-display)'}}>
            <Counter target={stat.value} />+
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
