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

const orgExperienceSchema = z.object({
  organization: z.string().min(2, 'Organization is required'),
  role: z.string().min(2, 'Role is required'),
  description: z.string().optional(),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof orgExperienceSchema>;

interface OrgExperienceDialogProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const OrgExperienceDialog = ({ item, isOpen, onClose, onSave }: OrgExperienceDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(orgExperienceSchema),
  });

  useEffect(() => {
    if (item) {
      reset({
        ...item,
        start_date: item.start_date ? new Date(item.start_date) : null,
        end_date: item.end_date ? new Date(item.end_date) : null,
      });
    } else {
      reset({ organization: '', role: '', description: '', start_date: null, end_date: null });
    }
  }, [item, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    const recordData = { ...data, user_id: user.id };
    const query = item
      ? supabase.from('organizational_experience').update(recordData).eq('id', item.id)
      : supabase.from('organizational_experience').insert(recordData);
    const { error } = await query;
    if (error) showError(error.message);
    else { onSave(); onClose(); }
  };

  return (
    <CrudDialog isOpen={isOpen} onClose={onClose} title={item ? 'Edit Org. Experience' : 'Add Org. Experience'} formId="org-exp-form">
      <form id="org-exp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Controller name="organization" control={control} render={({ field }) => <Input id="organization" {...field} />} />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Controller name="role" control={control} render={({ field }) => <Input id="role" {...field} />} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} />} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Controller name="start_date" control={control} render={({ field }) => (
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
          <div>
            <Label>End Date</Label>
            <Controller name="end_date" control={control} render={({ field }) => (
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
        </div>
      </form>
    </CrudDialog>
  );
};