'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || 'Authentication failed. Please try again.');
        return;
      }

      let session = null;

      if (code) {
        // PKCE flow — OAuth providers and newer email confirmation links
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        session = data.session;
      } else {
        // Implicit flow — legacy email confirmation links (tokens in URL hash)
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      if (!session) {
        setError('Could not establish a session. Please try signing in again.');
        return;
      }

      // Store tokens using the same keys as the backend auth flow
      const remember = localStorage.getItem('lokeet_remember') === 'true';
      const store = remember ? localStorage : sessionStorage;
      localStorage.setItem('lokeet_remember', 'true'); // OAuth = always persist
      store.setItem('lokeet_session', session.access_token);
      if (session.refresh_token) store.setItem('lokeet_refresh', session.refresh_token);

      // Store basic user info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        store.setItem('lokeet_user', JSON.stringify({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || user.user_metadata?.display_name || '',
          username: user.user_metadata?.username || '',
        }));
      }

      // Check backend profile to decide new vs. returning user
      const profile = await api.getProfile();
      if (profile?.display_name) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <p className="text-red-600 mt-6 text-sm">{error}</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-gray-900 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <Link href="/" className="text-4xl font-bold">Lokeet</Link>
        <p className="text-gray-500 mt-4 text-sm">Signing you in&hellip;</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <p className="text-gray-500 mt-4 text-sm">Loading&hellip;</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
