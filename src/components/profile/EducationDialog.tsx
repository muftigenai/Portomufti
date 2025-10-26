import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
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

const educationSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().optional(),
  field_of_study: z.string().optional(),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof educationSchema>;

interface EducationDialogProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EducationDialog = ({ item, isOpen, onClose, onSave }: EducationDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(educationSchema),
  });

  useEffect(() => {
    if (item) {
      reset({
        ...item,
        start_date: item.start_date ? new Date(item.start_date) : null,
        end_date: item.end_date ? new Date(item.end_date) : null,
      });
    } else {
      reset({ institution: '', degree: '', field_of_study: '', start_date: null, end_date: null });
    }
  }, [item, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    const recordData = { ...data, user_id: user.id };
    const query = item
      ? supabase.from('education').update(recordData).eq('id', item.id)
      : supabase.from('education').insert(recordData);
    const { error } = await query;
    if (error) showError(error.message);
    else { onSave(); onClose(); }
  };

  return (
    <CrudDialog isOpen={isOpen} onClose={onClose} title={item ? 'Edit Education' : 'Add Education'} formId="education-form">
      <form id="education-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="institution">Institution</Label>
          <Controller name="institution" control={control} render={({ field }) => <Input id="institution" {...field} />} />
        </div>
        <div>
          <Label htmlFor="degree">Degree</Label>
          <Controller name="degree" control={control} render={({ field }) => <Input id="degree" {...field} />} />
        </div>
        <div>
          <Label htmlFor="field_of_study">Field of Study</Label>
          <Controller name="field_of_study" control={control} render={({ field }) => <Input id="field_of_study" {...field} />} />
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
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={field.value ?? undefined} 
                    onSelect={field.onChange} 
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
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
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={field.value ?? undefined} 
                    onSelect={field.onChange} 
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            )} />
          </div>
        </div>
      </form>
    </CrudDialog>
  );
};