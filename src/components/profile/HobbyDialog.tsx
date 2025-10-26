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

const hobbySchema = z.object({
  name: z.string().min(2, 'Hobby name is required'),
});

type FormValues = z.infer<typeof hobbySchema>;

interface HobbyDialogProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const HobbyDialog = ({ item, isOpen, onClose, onSave }: HobbyDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(hobbySchema),
  });

  useEffect(() => {
    reset(item || { name: '' });
  }, [item, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    const recordData = { ...data, user_id: user.id };
    const query = item
      ? supabase.from('hobbies').update(recordData).eq('id', item.id)
      : supabase.from('hobbies').insert(recordData);
    const { error } = await query;
    if (error) showError(error.message);
    else { onSave(); onClose(); }
  };

  return (
    <CrudDialog isOpen={isOpen} onClose={onClose} title={item ? 'Edit Hobby' : 'Add Hobby'} formId="hobby-form">
      <form id="hobby-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Hobby</Label>
          <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
        </div>
      </form>
    </CrudDialog>
  );
};