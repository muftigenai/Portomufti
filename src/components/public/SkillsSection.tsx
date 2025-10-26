import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

interface SkillsSectionProps {
  userId: string;
}

const fetchPublicSkills = async (userId: string) => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true });
  if (error) throw error;
  return data;
};

const SkillsSection = ({ userId }: SkillsSectionProps) => {
  const { data: skills, isLoading } = useQuery({
    queryKey: ['publicSkills', userId],
    queryFn: () => fetchPublicSkills(userId),
  });

  const hardSkills = skills?.filter(s => s.category === 'Hard Skill') || [];
  const softSkills = skills?.filter(s => s.category === 'Soft Skill') || [];

  return (
    <section id="skills" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Keahlian Saya</h2>
      
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 flex items-center">
                <Zap className="h-6 w-6 mr-2" /> Hard Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {hardSkills.length > 0 ? hardSkills.map(skill => (
                  <Badge key={skill.id} className="bg-gray-800 text-white hover:bg-gray-700 transition-colors text-base px-4 py-1.5">
                    {skill.name}
                  </Badge>
                )) : <p className="text-gray-500">No hard skills listed.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 flex items-center">
                <Zap className="h-6 w-6 mr-2" /> Soft Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {softSkills.length > 0 ? softSkills.map(skill => (
                  <Badge key={skill.id} variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors text-base px-4 py-1.5">
                    {skill.name}
                  </Badge>
                )) : <p className="text-gray-500">No soft skills listed.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};

export default SkillsSection;