import { AuthCallbackPage } from '@fastshot/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function Callback() {
  const router = useRouter();
  return (
    <AuthCallbackPage
      supabaseClient={supabase}
      onSuccess={() => router.replace('/(tabs)')}
      onError={(error) => router.replace(`/login?error=${encodeURIComponent(error.message)}`)}
      loadingText="Выполняется вход..."
    />
  );
}
