import { Outlet, useLocation } from 'react-router-dom';
import { Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useState } from 'react';

// Fetch social media links for the public profile
const fetchSocialLinks = async (userId: string) => {
  const { data, error } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', userId);
  if (error) console.error("Error fetching social links:", error);
  return data || [];
};

const NAV_ITEMS = [
  { name: 'Home', href: 'home' },
  { name: 'About', href: 'about' },
  { name: 'Skills', href: 'skills' },
  { name: 'Projects', href: 'projects' },
  { name: 'Experience', href: 'experience' },
  { name: 'Contact', href: 'contact' },
];

const PublicLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch public user ID (assuming the first profile is the public one)
  const { data: allProfiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, name, photo_url, updated_at, bio');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60,
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

  const activeSection = useScrollSpy(NAV_ITEMS.map(item => item.href), 80); // 80px offset for sticky header height

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate position considering the sticky header height (approx 64px)
      const headerHeight = 64; 
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

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
      case 'instagram': return Instagram;
      case 'twitter': return Link;
      case 'facebook': return Link;
      case 'youtube': return Link;
      case 'tiktok': return Link;
      default: return Link;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header (Sticky Navigation) */}
      <header className="sticky top-0 z-20 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center h-16">
          <h1 className="text-xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors">
            {publicProfile?.name || "Portfolio"}
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "font-medium transition-colors relative pb-1",
                  activeSection === item.href
                    ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                )}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Social Links & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex space-x-4">
              {socialLinks?.map(link => (
                <SocialLink 
                  key={link.id} 
                  platform={link.platform} 
                  url={link.url} 
                  Icon={getIcon(link.platform)} 
                />
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-x-0 top-16 z-10 bg-white shadow-xl transition-all duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <nav className="flex flex-col p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className={cn(
                "block px-3 py-2 text-base font-medium text-left rounded-md transition-colors",
                activeSection === item.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet context={{ publicUserId, publicProfile, avatarUrl, socialLinks }} />
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