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
import { format, parseISO } from 'date-fns';
import { showError } from '@/utils/toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Helper function to safely parse date strings for default values
const safeParseDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    // Ensure it's in YYYY-MM-DD format for input type="date"
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

// We change the schema to validate the input as a string in YYYY-MM-DD format
const experienceSchema = z.object({
  role: z.string().min(2, 'Role is required'),
  company: z.string().min(2, 'Company is required'),
  // We expect a string in 'YYYY-MM-DD' format from input type="date"
  start_date: z.string().min(1, 'Start date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().optional().nullable().or(z.literal('')),
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
        // Convert date objects/strings from DB to YYYY-MM-DD string for input type="date"
        start_date: safeParseDate(experience.start_date),
        end_date: safeParseDate(experience.end_date),
      });
    } else {
      form.reset({ role: '', company: '', description: '', start_date: '', end_date: '' });
    }
  }, [experience, form]);

  const onSubmit = async (data: ExperienceFormValues) => {
    if (!user) return;

    // Data is already in YYYY-MM-DD string format, ready for Supabase
    const experienceData = {
      ...data,
      user_id: user.id,
      // Ensure empty string is converted to null for optional end_date column
      end_date: data.end_date || null,
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
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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