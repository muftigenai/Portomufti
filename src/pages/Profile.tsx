import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { showError, showSuccess } from '@/utils/toast';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { CrudSection } from '@/components/profile/CrudSection';
import { EducationDialog } from '@/components/profile/EducationDialog';
import { OrgExperienceDialog } from '@/components/profile/OrgExperienceDialog';
import { HobbyDialog } from '@/components/profile/HobbyDialog';
import { AchievementDialog } from '@/components/profile/AchievementDialog';
import { format } from 'date-fns';
import { SocialMediaDialog } from '@/components/profile/SocialMediaDialog';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional(),
  location: z.string().max(50, 'Location must be at most 50 characters').optional(),
  photo_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
};

const updateProfile = async ({ userId, ...updates }: ProfileFormValues & { userId: string }) => {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw new Error(error.message);
};

const formatDate = (dateStr: string | null) => dateStr ? format(new Date(dateStr), 'MMM yyyy') : 'N/A';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const { control, handleSubmit, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      photo_url: profile?.photo_url ?? '',
    },
    resetOptions: { keepValues: false }
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      showSuccess('Profile updated successfully!');
    },
    onError: (error) => showError(error.message),
  });

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    mutation.mutate({ userId: user.id, ...data });
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Profil Diri</CardTitle>
            <CardDescription>Kelola informasi profil Anda di sini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvatarUpload
              url={profile?.photo_url}
              onUpload={(filePath) => {
                setValue('photo_url', filePath, { shouldDirty: true });
                handleSubmit(onSubmit)();
              }}
            />
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Controller name="bio" control={control} render={({ field }) => <Textarea id="bio" {...field} placeholder="Tell us a little about yourself" />} />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} />} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <CrudSection
        tableName="education"
        title="Pendidikan"
        columns={[
          { key: 'institution', label: 'Institution' },
          { key: 'degree', label: 'Degree' },
          { key: 'period', label: 'Period', render: (item) => `${formatDate(item.start_date)} - ${formatDate(item.end_date)}` },
        ]}
        dialogComponent={EducationDialog}
      />

      <CrudSection
        tableName="organizational_experience"
        title="Pengalaman Organisasi"
        columns={[
          { key: 'organization', label: 'Organization' },
          { key: 'role', label: 'Role' },
          { key: 'period', label: 'Period', render: (item) => `${formatDate(item.start_date)} - ${formatDate(item.end_date)}` },
        ]}
        dialogComponent={OrgExperienceDialog}
      />

      <CrudSection
        tableName="achievements"
        title="Prestasi"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'date', label: 'Date', render: (item) => formatDate(item.date) },
        ]}
        dialogComponent={AchievementDialog}
      />

      <CrudSection
        tableName="social_media_links"
        title="Media Sosial"
        columns={[
          { key: 'platform', label: 'Platform' },
          { key: 'url', label: 'URL' },
        ]}
        dialogComponent={SocialMediaDialog}
      />

      <CrudSection
        tableName="hobbies"
        title="Hobi"
        columns={[{ key: 'name', label: 'Name' }]}
        dialogComponent={HobbyDialog}
      />
    </div>
  );
};

export default Profile;