import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1
        className="text-8xl md:text-[10rem] font-display text-[var(--accent)] mb-6"
        style={{fontFamily: 'var(--font-display)'}}
      >
        404
      </h1>
      <p className="text-2xl md:text-4xl font-display text-[var(--text)] mb-8" style={{fontFamily: 'var(--font-display)'}}>
        LOST IN SPACE
      </p>
      <p className="text-[var(--text-muted)] mb-10 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has drifted off into the cosmos.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[var(--accent)] text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
      >
        Return Home
      </Link>
    </main>
  );
}
