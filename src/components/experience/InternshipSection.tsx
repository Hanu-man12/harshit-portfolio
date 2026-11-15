import SectionHeading from '@/components/ui/SectionHeading';

export default function InternshipSection() {
  return (
    <section id="internship" className="px-6 py-20 md:px-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title="INTERNSHIP" />
        <div className="mt-10 max-w-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
          <p className="text-sm text-[var(--text-muted)]">Internship details will be added here.</p>
        </div>
      </div>
    </section>
  );
}
