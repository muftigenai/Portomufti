import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { showError } from '@/utils/toast';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  project_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
  project?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ProjectDialog = ({ project, isOpen, onClose, onSave }: ProjectDialogProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const imageUrl = watch('image_url');

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description || '',
        project_url: project.project_url || '',
        image_url: project.image_url || '',
      });
    } else {
      reset({ title: '', description: '', project_url: '', image_url: '' });
    }
  }, [project, reset]);

  useEffect(() => {
    if (imageUrl) {
      const { data } = supabase.storage.from('project-images').getPublicUrl(imageUrl);
      setImagePreview(data.publicUrl);
    } else {
      setImagePreview(null);
    }
  }, [imageUrl]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage.from('project-images').upload(filePath, file);
      if (error) throw error;

      setValue('image_url', filePath, { shouldDirty: true });
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    if (!user) return;

    const projectData = {
      ...data,
      user_id: user.id,
    };

    const query = project
      ? supabase.from('projects').update(projectData).eq('id', project.id)
      : supabase.from('projects').insert(projectData);

    const { error } = await query;

    if (error) {
      showError(error.message);
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Project Name</Label>
            <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} />} />
          </div>
          <div>
            <Label htmlFor="project_url">Project URL</Label>
            <Controller name="project_url" control={control} render={({ field }) => <Input id="project_url" placeholder="https://..." {...field} />} />
          </div>
          <div>
            <Label>Project Image</Label>
            {imagePreview && <img src={imagePreview} alt="Project preview" className="mt-2 rounded-md max-h-40 w-full object-cover" />}
            <div className="mt-2">
              <Button type="button" asChild variant="outline" disabled={isUploading}>
                <label htmlFor="image-upload" className="cursor-pointer flex items-center">
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </label>
              </Button>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isUploading}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};