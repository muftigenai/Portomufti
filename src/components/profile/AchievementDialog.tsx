import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';
import { CrudDialog } from './CrudDialog';
import { Button } from '../ui/button';

const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  date: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof achievementSchema>;

interface AchievementDialogProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const AchievementDialog = ({ item, isOpen, onClose, onSave }: AchievementDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(achievementSchema),
  });

  useEffect(() => {
    if (item) {
      reset({ ...item, date: item.date ? new Date(item.date) : null });
    } else {
      reset({ title: '', description: '', date: null });
    }
  }, [item, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    const recordData = { ...data, user_id: user.id };
    const query = item
      ? supabase.from('achievements').update(recordData).eq('id', item.id)
      : supabase.from('achievements').insert(recordData);
    const { error } = await query;
    if (error) showError(error.message);
    else { onSave(); onClose(); }
  };

  return (
    <CrudDialog isOpen={isOpen} onClose={onClose} title={item ? 'Edit Achievement' : 'Add Achievement'} formId="achievement-form">
      <form id="achievement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} />} />
        </div>
        <div>
          <Label>Date</Label>
          <Controller name="date" control={control} render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} /></PopoverContent>
            </Popover>
          )} />
        </div>
      </form>
    </CrudDialog>
  );
};