import HeroSection from '@/components/hero/HeroSection';
import AboutSection from '@/components/about/AboutSection';
import InternshipSection from '@/components/experience/InternshipSection';
import SkillsSection from '@/components/skills/SkillsSection';

export default function Home() {
  return (
    <main id="main-content">
      <HeroSection />
      <AboutSection />
      <InternshipSection />
      <SkillsSection />
    </main>
  );
}
