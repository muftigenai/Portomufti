import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, MapPin, GraduationCap, Users, Trophy, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

interface AboutSectionProps {
  profile: any;
  userId: string | undefined;
}

interface PublicContext {
  avatarUrl: string | null;
}

// Helper functions to fetch data
const fetchData = async (tableName: string, userId: string) => {
  const { data, error } = await supabase.from(tableName).select('*').eq('user_id', userId);
  if (error) throw error;
  return data;
};

// Helper to format dates
const formatDate = (dateStr: string | null) => dateStr ? format(new Date(dateStr), 'MMM yyyy') : 'N/A';
const formatDateRange = (start: string, end: string | null) => {
    const startDate = formatDate(start);
    const endDate = end ? formatDate(end) : 'Sekarang';
    return `${startDate} - ${endDate}`;
};

const AboutSection = ({ profile, userId }: AboutSectionProps) => {
  const { avatarUrl } = useOutletContext<PublicContext>();

  const { data: education, isLoading: isLoadingEducation } = useQuery({
    queryKey: ['publicEducation', userId],
    queryFn: () => fetchData('education', userId!),
    enabled: !!userId,
  });

  const { data: orgExperience, isLoading: isLoadingOrgExperience } = useQuery({
    queryKey: ['publicOrgExperience', userId],
    queryFn: () => fetchData('organizational_experience', userId!),
    enabled: !!userId,
  });

  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['publicAchievements', userId],
    queryFn: () => fetchData('achievements', userId!),
    enabled: !!userId,
  });

  const { data: hobbies, isLoading: isLoadingHobbies } = useQuery({
    queryKey: ['publicHobbies', userId],
    queryFn: () => fetchData('hobbies', userId!),
    enabled: !!userId,
  });

  if (!profile) {
    return (
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  const userEmail = profile.email;

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Tentang Saya</h2>
      
      <Card className="shadow-2xl p-6 md:p-10">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-center">
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

      {/* Additional Info Sections */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Education */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center mb-2"><GraduationCap className="mr-3 text-blue-600"/> Pendidikan</CardTitle></CardHeader>
          <CardContent className="space-y-4 min-h-[100px]">
            {isLoadingEducation ? <Skeleton className="h-20 w-full" /> : education && education.length > 0 ? education.map(item => (
              <div key={item.id}>
                <p className="font-bold">{item.institution}</p>
                <p className="text-sm text-gray-600">{item.degree}, {item.field_of_study}</p>
                <p className="text-xs text-gray-500">{formatDateRange(item.start_date, item.end_date)}</p>
              </div>
            )) : <p className="text-gray-500">Belum ada riwayat pendidikan.</p>}
          </CardContent>
        </Card>

        {/* Organizational Experience */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center mb-2"><Users className="mr-3 text-blue-600"/> Pengalaman Organisasi</CardTitle></CardHeader>
          <CardContent className="space-y-4 min-h-[100px]">
            {isLoadingOrgExperience ? <Skeleton className="h-20 w-full" /> : orgExperience && orgExperience.length > 0 ? orgExperience.map(item => (
              <div key={item.id}>
                <p className="font-bold">{item.organization}</p>
                <p className="text-sm text-gray-600">{item.role}</p>
                <p className="text-xs text-gray-500">{formatDateRange(item.start_date, item.end_date)}</p>
              </div>
            )) : <p className="text-gray-500">Belum ada pengalaman organisasi.</p>}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center mb-2"><Trophy className="mr-3 text-blue-600"/> Prestasi</CardTitle></CardHeader>
          <CardContent className="space-y-4 min-h-[100px]">
            {isLoadingAchievements ? <Skeleton className="h-20 w-full" /> : achievements && achievements.length > 0 ? achievements.map(item => (
              <div key={item.id}>
                <p className="font-bold">{item.title}</p>
                <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
              </div>
            )) : <p className="text-gray-500">Belum ada prestasi yang ditambahkan.</p>}
          </CardContent>
        </Card>

        {/* Hobbies */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center mb-2"><Heart className="mr-3 text-blue-600"/> Hobi</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2 min-h-[100px]">
            {isLoadingHobbies ? <Skeleton className="h-8 w-full" /> : hobbies && hobbies.length > 0 ? hobbies.map(item => (
              <Badge key={item.id} variant="secondary" className="text-base">{item.name}</Badge>
            )) : <p className="text-gray-500">Belum ada hobi yang ditambahkan.</p>}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutSection;