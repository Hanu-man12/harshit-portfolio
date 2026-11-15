import SectionHeading from '@/components/ui/SectionHeading';

export default function CertificatesSection() {
  return (
    <section id="certificates" className="px-6 py-20 md:px-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title="ACHIEVEMENTS" />
        <div className="mt-10 max-w-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
          <p className="text-sm text-[var(--text-muted)]">Certificate details will be added here.</p>
        </div>
      </div>
    </section>
  );
}
