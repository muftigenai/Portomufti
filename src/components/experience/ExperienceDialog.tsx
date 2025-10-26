import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
  });

  useEffect(() => {
    if (experience) {
      form.reset({
        ...experience,
        start_date: new Date(experience.start_date),
        end_date: experience.end_date ? new Date(experience.end_date) : null,
      });
    } else {
      form.reset({ role: '', company: '', description: '', start_date: undefined, end_date: null });
    }
  }, [experience, form]);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0"> {/* Removed w-auto */}
                        <Calendar 
                          mode="single" 
                          selected={field.value} 
                          onSelect={field.onChange} 
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0"> {/* Removed w-auto */}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea id="description" {...field} />
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