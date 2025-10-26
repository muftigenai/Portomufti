import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Code } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { ProjectDetailDialog } from './ProjectDetailDialog';

interface ProjectsSectionProps {
  userId: string;
}

const fetchPublicProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const ProjectsSection = ({ userId }: ProjectsSectionProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['publicProjects', userId],
    queryFn: () => fetchPublicProjects(userId),
  });

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '/placeholder.svg';
    const { data } = supabase.storage.from('project-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCardClick = (project: any) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  return (
    <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Proyek Terbaru</h2>
      
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
              onClick={() => handleCardClick(project)}
            >
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={getImageUrl(project.image_url)} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              {/* Menghapus CardFooter karena detail sekarang ada di dialog */}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No projects available yet.</p>
      )}

      <ProjectDetailDialog
        project={selectedProject}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </section>
  );
};

export default ProjectsSection;