import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Briefcase, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ExperienceSectionProps {
  userId: string;
}

const fetchPublicExperience = async (userId: string) => {
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data;
};

const ExperienceSection = ({ userId }: ExperienceSectionProps) => {
  const { data: experiences, isLoading } = useQuery({
    queryKey: ['publicExperience', userId],
    queryFn: () => fetchPublicExperience(userId),
  });

  const formatDateRange = (start: string, end: string | null) => {
    const startDate = format(new Date(start), 'MMM yyyy');
    const endDate = end ? format(new Date(end), 'MMM yyyy') : 'Present';
    return `${startDate} - ${endDate}`;
  };

  return (
    <section id="experience" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Pengalaman Kerja</h2>
      
      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : experiences && experiences.length > 0 ? (
        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-gray-200 before:hidden md:before:block">
          {experiences.map((exp, index) => (
            <div 
              key={exp.id} 
              className={`flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} w-full`}
            >
              <Card className={
                `w-full md:w-[45%] shadow-lg transition-all duration-300 hover:shadow-xl 
                ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}
                `
              }>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-600">{exp.role}</CardTitle>
                  <p className="text-lg font-medium text-gray-800">{exp.company}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{exp.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No experience records available yet.</p>
      )}
    </section>
  );
};

export default ExperienceSection;