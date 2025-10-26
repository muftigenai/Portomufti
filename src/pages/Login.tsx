import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Admin</h1>
            <p className="mt-2 text-sm text-gray-600">Sign in to manage your projects</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(222.2 47.4% 11.2%)',
                  brandAccent: 'hsl(222.2 47.4% 15.2%)',
                }
              }
            }
          }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Login;