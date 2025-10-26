import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroSectionProps {
  profile: any;
  avatarUrl: string | null;
}

const HeroSection = ({ profile, avatarUrl }: HeroSectionProps) => {
  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  return (
    <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
      <div className="flex justify-center mb-6">
        <Avatar className="h-32 w-32 border-4 border-blue-500 shadow-lg transition-transform duration-300 hover:scale-105">
          <AvatarImage src={avatarUrl ?? undefined} alt={profile.name || "User"} />
          <AvatarFallback className="bg-gray-200">
            <User className="h-16 w-16 text-gray-500" />
          </AvatarFallback>
        </Avatar>
      </div>
      <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-4 animate-fade-in">
        Halo, saya <span className="text-blue-600">{profile.name || 'Pengguna Portfolio'}</span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in delay-100">
        {profile.bio || 'Seorang profesional yang bersemangat dalam bidang teknologi dan pengembangan web. Selamat datang di portfolio saya.'}
      </p>
      <a 
        href="#contact" 
        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Hubungi Saya
      </a>
    </section>
  );
};

export default HeroSection;