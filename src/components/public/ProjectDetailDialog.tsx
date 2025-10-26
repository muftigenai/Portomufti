import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDetailDialogProps {
  project: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return '/placeholder.svg';
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
};

export const ProjectDetailDialog = ({ project, isOpen, onClose }: ProjectDetailDialogProps) => {
  if (!project) return null;

  const imageUrl = getImageUrl(project.image_url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
          {/* Left Column: Image */}
          <div className="hidden md:block h-full overflow-hidden">
            <img 
              src={imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Column: Details */}
          <div className="p-6 space-y-6 overflow-y-auto">
            <DialogHeader className="p-0">
              <DialogTitle className="text-3xl font-bold">{project.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Deskripsi</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
            </div>

            {project.project_url && (
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Kunjungi Proyek
                </a>
              </Button>
            )}
            
            {/* Image for mobile view */}
            <div className="md:hidden">
              <img 
                src={imageUrl} 
                alt={project.title} 
                className="w-full h-auto object-cover rounded-lg mt-4"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};