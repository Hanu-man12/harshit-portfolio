'use client';
import { useEffect, useState } from 'react';

const LINES = [
  'SYSTEM INITIALIZING...',
  'LOADING PORTFOLIO...',
  'BACKEND SYSTEMS ONLINE',
  'OPEN SOURCE: ACTIVE',
  'LOCATION: KOLKATA, INDIA',
];

export default function HeroTerminal() {
  const [displayed, setDisplayed] = useState<string[]>([LINES[0]]);

  useEffect(() => {
    let idx = 1;
    const interval = setInterval(() => {
      if (idx >= LINES.length) { clearInterval(interval); return; }
      setDisplayed(prev => [...prev, LINES[idx]]);
      idx++;
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative border border-[var(--border)] bg-[var(--surface)] p-4 rounded-sm text-xs"
      style={{fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 260}}
    >
      {/* HUD corner brackets */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[var(--accent)]" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--accent)]" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[var(--accent)]" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--accent)]" />
      {displayed.map((line, i) => (
        <div key={i} className="mb-1">
          <span style={{color: 'var(--accent)'}}>&gt; </span>{line}
        </div>
      ))}
      <div className="inline-block w-2 h-3 bg-[var(--accent)] animate-pulse ml-1" />
    </div>
  );
}
