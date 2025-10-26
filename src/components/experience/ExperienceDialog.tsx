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
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

const experienceSchema = z.object({
  role: z.string().min(2, 'Role is required'),
  company: z.string().min(2, 'Company is required'),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date().optional().nullable(),
  description: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceDialogProps {
  experience?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ExperienceDialog = ({ experience, isOpen, onClose, onSave }: ExperienceDialogProps) => {
  const { user } = useAuth();
  const { control, handleSubmit, reset } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
  });

  useEffect(() => {
    if (experience) {
      reset({
        ...experience,
        start_date: new Date(experience.start_date),
        end_date: experience.end_date ? new Date(experience.end_date) : null,
      });
    } else {
      reset({ role: '', company: '', description: '', start_date: undefined, end_date: null });
    }
  }, [experience, reset]);

  const onSubmit = async (data: ExperienceFormValues) => {
    if (!user) return;

    const experienceData = {
      ...data,
      user_id: user.id,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
    };

    const query = experience
      ? supabase.from('experience').update(experienceData).eq('id', experience.id)
      : supabase.from('experience').insert(experienceData);

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
          <DialogTitle>{experience ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Controller name="role" control={control} render={({ field }) => <Input id="role" {...field} />} />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Controller name="company" control={control} render={({ field }) => <Input id="company" {...field} />} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} />} />
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