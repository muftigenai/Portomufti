import StatCard from "@/components/dashboard/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Star, Code, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const fetchCounts = async () => {
  const tables = ['projects', 'skills', 'experience', 'messages'];
  
  const countPromises = tables.map(table => 
    supabase.from(table).select('*', { count: 'exact', head: true })
  );

  const results = await Promise.all(countPromises);

  results.forEach((res, index) => {
    if (res.error) {
      console.error(`Error fetching count for ${tables[index]}:`, res.error);
      throw new Error(`Could not fetch count for ${tables[index]}. RLS policy might be missing or incorrect.`);
    }
  });

  return {
    projects: results[0].count,
    skills: results[1].count,
    experience: results[2].count,
    messages: results[3].count,
  };
};

const Dashboard = () => {
  const { data: counts, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardCounts'],
    queryFn: fetchCounts,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Proyek" 
          value={counts?.projects} 
          icon={<Briefcase className="h-5 w-5" />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Skill" 
          value={counts?.skills} 
          icon={<Star className="h-5 w-5" />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Pengalaman" 
          value={counts?.experience} 
          icon={<Code className="h-5 w-5" />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Pesan Baru" 
          value={counts?.messages} 
          icon={<Mail className="h-5 w-5" />} 
          isLoading={isLoading}
        />
      </div>

      {isError && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Gagal Memuat Data</AlertTitle>
          <AlertDescription>
            Tidak dapat mengambil data statistik dari database. Pastikan koneksi internet Anda stabil dan coba lagi.
            <p className="text-xs mt-2 font-mono">{error?.message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex items-center justify-center">
            <p className="text-center text-gray-500">Grafik dan ringkasan lainnya akan ditampilkan di sini.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;