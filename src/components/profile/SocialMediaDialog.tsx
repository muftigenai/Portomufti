import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { showError } from '@/utils/toast';
import { CrudDialog } from './CrudDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const socialMediaSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Must be a valid URL'),
});

type FormValues = z.infer<typeof socialMediaSchema>;

const platforms = ['GitHub', 'LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Website', 'YouTube', 'TikTok'];

interface SocialMediaDialogProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SocialMediaDialog = ({ item, isOpen, onClose, onSave }: SocialMediaDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(socialMediaSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(item || { platform: '', url: '' });
    }
  }, [item, isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    const recordData = { ...data, user_id: user.id };
    const query = item
      ? supabase.from('social_media_links').update(recordData).eq('id', item.id)
      : supabase.from('social_media_links').insert(recordData);
    const { error } = await query;
    if (error) showError(error.message);
    else { onSave(); onClose(); }
  };

  return (
    <CrudDialog isOpen={isOpen} onClose={onClose} title={item ? 'Edit Social Media' : 'Add Social Media'} formId="social-media-form">
      <form id="social-media-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Platform</Label>
          <Controller
            name="platform"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="url">URL</Label>
          <Controller name="url" control={control} render={({ field }) => <Input id="url" placeholder="https://..." {...field} />} />
        </div>
      </form>
    </CrudDialog>
  );
};