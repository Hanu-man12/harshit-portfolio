import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ResumePage() {
  return (
    <main className="min-h-screen py-16 px-6 md:px-16 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-6 inline-flex items-center gap-1">
          &larr; Back
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-display" style={{fontFamily: 'var(--font-display)'}}>RESUME</h1>
          <Button href="/resume/Harshit_Shaw_Resume.pdf" target="_blank" rel="noopener noreferrer">Download PDF</Button>
        </div>
        <iframe
          src="/resume/Harshit_Shaw_Resume.pdf"
          className="w-full rounded-sm border border-[var(--border)]"
          style={{height: '80vh'}}
          title="Harshit Shaw Resume"
        />
      </div>
    </main>
  );
}
