import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOutletContext } from 'react-router-dom';

interface AboutSectionProps {
  profile: any;
}

// Re-defining the context interface to access avatarUrl
interface PublicContext {
  publicUserId: string | undefined;
  publicProfile: any;
  avatarUrl: string | null;
}

const AboutSection = ({ profile }: AboutSectionProps) => {
  const { avatarUrl } = useOutletContext<PublicContext>();

  if (!profile) {
    return (
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  // Note: Email is not directly available in the public profile object unless explicitly added to the profiles table.
  // We will display the user's email if it was somehow included in the profile object, otherwise we skip it.
  const userEmail = profile.email; 

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Tentang Saya</h2>
      
      <Card className="shadow-2xl p-6 md:p-10">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="md:col-span-2 space-y-6">
            <CardTitle className="text-4xl font-extrabold text-gray-900 mb-4">
              {profile.name || 'Profil Pengguna'}
            </CardTitle>
            
            <p className="text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
              {profile.bio || 'Bio belum diisi. Anda dapat mengeditnya di panel admin.'}
            </p>

            <div className="space-y-2 pt-4">
              {profile.location && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Lokasi:</span> {profile.location}
                </div>
              )}
              {userEmail && (
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Email:</span> {userEmail}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Photo */}
          <div className="md:col-span-1 flex justify-center md:justify-end">
            <Avatar className="h-48 w-48 md:h-64 md:w-64 border-8 border-gray-100 shadow-2xl transition-transform duration-300 hover:scale-105">
              <AvatarImage src={avatarUrl ?? undefined} alt={profile.name || "User"} />
              <AvatarFallback className="bg-gray-200">
                <User className="h-24 w-24 text-gray-500" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AboutSection;