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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const skillSchema = z.object({
  name: z.string().min(2, 'Skill name is required'),
  category: z.enum(['Hard Skill', 'Soft Skill'], {
    required_error: 'You must select a category.',
  }),
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
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (skill) {
        form.reset(skill);
      } else {
        form.reset({ name: '', category: undefined });
      }
    }
  }, [skill, isOpen, form]);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Hard Skill" />
                        </FormControl>
                        <FormLabel className="font-normal">Hard Skill</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Soft Skill" />
                        </FormControl>
                        <FormLabel className="font-normal">Soft Skill</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};