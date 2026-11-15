import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import HeroSection from '@/components/hero/HeroSection';
import AboutSection from '@/components/about/AboutSection';
import ExperienceSection from '@/components/experience/ExperienceSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import AchievementsSection from '@/components/achievements/AchievementsSection';
import SkillsSection from '@/components/skills/SkillsSection';
import ContactSection from '@/components/contact/ContactSection';
import PreLoader from '@/components/preloader/PreLoader';
import Cursor from '@/components/ui/Cursor';
import OpenSourceSection from '@/components/opensource/OpenSourceSection';

export default function Home() {
  return (
    <>
      <PreLoader />
      <Cursor />
      <Nav />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <AchievementsSection />
        <SkillsSection />
        <OpenSourceSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
