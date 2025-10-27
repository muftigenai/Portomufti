import HeroSection from '@/components/public/HeroSection';
import SkillsSection from '@/components/public/SkillsSection';
import ProjectsSection from '@/components/public/ProjectsSection';
import ExperienceSection from '@/components/public/ExperienceSection';
import ContactSection from '@/components/public/ContactSection';
import AboutSection from '@/components/public/AboutSection';
import { useOutletContext } from 'react-router-dom';

interface PublicContext {
  publicUserId: string | undefined;
  publicProfile: any;
  avatarUrl: string | null;
}

const PublicIndex = () => {
  const { publicUserId, publicProfile, avatarUrl } = useOutletContext<PublicContext>();

  if (!publicUserId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Loading Profile...</h2>
        <p className="text-gray-500 mt-2">Ensure at least one profile exists in the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      <HeroSection profile={publicProfile} avatarUrl={avatarUrl} />
      <AboutSection profile={publicProfile} userId={publicUserId} />
      <SkillsSection userId={publicUserId} />
      <ProjectsSection userId={publicUserId} />
      <ExperienceSection userId={publicUserId} />
      <ContactSection />
    </div>
  );
};

export default PublicIndex;