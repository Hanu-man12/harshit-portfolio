import { Fragment, type ReactNode } from 'react';

function inlineMarkdown(value: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  return value.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-[var(--text)]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[var(--accent)]">{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">{link[1]}</a>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export default function ReadmeContent({ content }: { content: string }) {
  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`} className="mb-4 leading-7 text-[var(--text-muted)]">{inlineMarkdown(paragraph.join(' '))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="mb-5 list-disc space-y-2 pl-6 text-[var(--text-muted)]">
        {list.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>)}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      flushParagraph();
      flushList();
      if (inCode) {
        blocks.push(<pre key={`code-${blocks.length}`} className="mb-5 overflow-x-auto rounded-sm border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text-muted)]"><code>{code.join('\n')}</code></pre>);
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const className = level <= 2
        ? 'mb-3 mt-8 text-2xl font-display text-[var(--text)]'
        : 'mb-2 mt-6 text-lg font-semibold text-[var(--text)]';
      blocks.push(<h2 key={`h-${blocks.length}`} className={className}>{inlineMarkdown(heading[2])}</h2>);
      continue;
    }

    const item = line.match(/^\s*(?:[-*+]\s+|\d+\.\s+)(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }

    if (!line.trim() || /^[-*_]{3,}$/.test(line.trim())) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  if (inCode && code.length) {
    blocks.push(<pre key={`code-${blocks.length}`} className="mb-5 overflow-x-auto rounded-sm border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text-muted)]"><code>{code.join('\n')}</code></pre>);
  }

  return <div className="break-words">{blocks}</div>;
}
