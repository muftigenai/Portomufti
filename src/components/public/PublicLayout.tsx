import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fetch social media links for the public profile
const fetchSocialLinks = async (userId: string) => {
  const { data, error } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', userId);
  if (error) console.error("Error fetching social links:", error);
  return data || [];
};

const PublicLayout = () => {
  // We need to determine the public user ID. For simplicity, we assume the first user created is the portfolio owner.
  // In a real app, this ID would be configured in settings or fetched from a dedicated public profile table.
  // For now, we'll try to fetch the profile of the first user we can find (which is usually the admin user).
  
  // Since we don't know the admin user ID, we'll fetch all profiles and use the first one found.
  const { data: allProfiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, name, photo_url, updated_at');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const publicUserId = allProfiles?.[0]?.id;
  const publicProfile = allProfiles?.[0];

  const { getAvatarUrl } = useProfile();
  const avatarUrl = getAvatarUrl(publicProfile?.photo_url);

  const { data: socialLinks } = useQuery({
    queryKey: ['publicSocialLinks', publicUserId],
    queryFn: () => fetchSocialLinks(publicUserId!),
    enabled: !!publicUserId,
  });

  const SocialLink = ({ platform, url, Icon }: { platform: string, url: string, Icon: React.ElementType }) => (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-gray-400 hover:text-blue-500 transition-colors"
      aria-label={platform}
    >
      <Icon className="h-6 w-6" />
    </a>
  );

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Mail; // Using Mail as a placeholder for Twitter/X
      case 'instagram': return Mail; // Using Mail as a placeholder
      case 'facebook': return Mail; // Using Mail as a placeholder
      case 'youtube': return Mail; // Using Mail as a placeholder
      case 'tiktok': return Mail; // Using Mail as a placeholder
      default: return Mail;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {publicProfile?.name || "Portfolio"}
          </h1>
          <nav className="hidden md:flex space-x-6">
            {['Home', 'Skills', 'Projects', 'Experience', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex space-x-4">
            {socialLinks?.map(link => (
              <SocialLink 
                key={link.id} 
                platform={link.platform} 
                url={link.url} 
                Icon={getIcon(link.platform)} 
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet context={{ publicUserId, publicProfile, avatarUrl }} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {publicProfile?.name || "Portfolio Owner"}. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            {socialLinks?.map(link => (
              <SocialLink 
                key={link.id} 
                platform={link.platform} 
                url={link.url} 
                Icon={getIcon(link.platform)} 
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;