import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { showError } from '@/utils/toast';

const skillSchema = z.object({
  name: z.string().min(2, 'Skill name is required'),
  level: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillDialogProps {
  skill?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SkillDialog = ({ skill, isOpen, onClose, onSave }: SkillDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
  });

  useEffect(() => {
    if (skill) {
      reset(skill);
    } else {
      reset({ name: '', level: '' });
    }
  }, [skill, reset]);

  const onSubmit = async (data: SkillFormValues) => {
    if (!user) return;

    const skillData = {
      ...data,
      user_id: user.id,
    };

    const query = skill
      ? supabase.from('skills').update(skillData).eq('id', skill.id)
      : supabase.from('skills').insert(skillData);

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
          <DialogTitle>{skill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Skill Name</Label>
            <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
          </div>
          <div>
            <Label htmlFor="level">Level (e.g., Intermediate, 80%)</Label>
            <Controller name="level" control={control} render={({ field }) => <Input id="level" {...field} />} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};