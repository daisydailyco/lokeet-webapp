import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithProvider(provider: 'google' | 'apple') {
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://lokeet.io/auth/callback';

  return supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
}
