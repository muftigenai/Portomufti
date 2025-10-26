import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

interface AboutSectionProps {
  profile: any;
}

const AboutSection = ({ profile }: AboutSectionProps) => {
  if (!profile) {
    return (
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Tentang Saya</h2>
      <Card className="shadow-xl border-l-4 border-blue-600 transition-all duration-300 hover:shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-gray-800 flex items-center">
            <User className="h-6 w-6 mr-3 text-blue-600" /> {profile.name || 'Profil'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-gray-700">
          <p className="whitespace-pre-wrap">
            {profile.bio || 'Bio belum diisi. Anda dapat mengeditnya di panel admin.'}
          </p>
          {profile.location && (
            <p className="font-medium text-gray-600">
              Lokasi: <span className="text-blue-600">{profile.location}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutSection;