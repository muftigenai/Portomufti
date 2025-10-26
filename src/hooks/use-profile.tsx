import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  // PGRST116 means no rows found, which is fine for a new user.
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
};

export const useProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Function to get public URL for avatar
  const getAvatarUrl = (path: string | null | undefined) => {
    if (!path) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    // Append updated_at timestamp to bust cache if profile was recently updated
    const timestamp = profile?.updated_at ? new Date(profile.updated_at).getTime() : Date.now();
    return `${data.publicUrl}?t=${timestamp}`;
  };

  return {
    profile,
    isLoading,
    error,
    getAvatarUrl,
  };
};