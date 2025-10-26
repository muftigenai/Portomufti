import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Brain } from 'lucide-react';

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
          {/* Hard Skills Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-blue-600" /> Hard Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hardSkills.length > 0 ? hardSkills.map(skill => (
                  <Badge 
                    key={skill.id} 
                    className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors text-base px-4 py-1.5 justify-center"
                    variant="outline"
                  >
                    {skill.name}
                  </Badge>
                )) : <p className="text-gray-500 col-span-3">No hard skills listed.</p>}
              </div>
            </CardContent>
          </Card>

          {/* Soft Skills Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800 flex items-center">
                <Brain className="h-6 w-6 mr-2 text-blue-600" /> Soft Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {softSkills.length > 0 ? softSkills.map(skill => (
                  <Badge 
                    key={skill.id} 
                    className="bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 transition-colors text-base px-4 py-1.5 justify-center"
                    variant="outline"
                  >
                    {skill.name}
                  </Badge>
                )) : <p className="text-gray-500 col-span-3">No soft skills listed.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};

export default SkillsSection;