'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { signInWithProvider } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password does not meet the requirements below');
      return;
    }

    setLoading(true);

    try {
      const result = await api.signup(email, password, rememberMe);

      if (result.success && result.session?.access_token) {
        // Auto-confirmed (should not happen with email confirmation enabled)
        router.push('/onboarding');
      } else if (result.success) {
        // Email confirmation required — show "check your inbox" screen
        setEmailSent(true);
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setOauthLoading(provider);
    const { error } = await signInWithProvider(provider);
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
    // On success the browser redirects — no further action needed here
  }

  if (emailSent) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <div className="mt-8 mb-4">
            <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-gray-600 text-sm mb-2">
            We sent a confirmation link to <strong>{email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to activate your account, then come back here to log in.
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900"
          >
            Go to Login
          </Link>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 flex items-center justify-center hover:opacity-60 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </Link>
      <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* OAuth buttons */}
        <div className="mb-6 hidden">
          <button
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-sm disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </div>

        <div className="relative flex items-center gap-3 mb-6 hidden">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {[
                  { label: 'Min. 6 characters', met: password.length >= 6 },
                  { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
                  { label: 'Lowercase letter', met: /[a-z]/.test(password) },
                  { label: 'Number', met: /[0-9]/.test(password) },
                ].map(({ label, met }) => (
                  <span key={label} className={`flex items-center gap-1 text-xs ${met ? 'text-[#42a746]' : 'text-gray-400'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      {met ? <polyline points="20 6 9 17 4 12"/> : <circle cx="12" cy="12" r="10"/>}
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-gray-900 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer select-none">
              Remember me
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-900">Already have an account? </span>
          <Link href="/login" className="text-gray-900 font-semibold hover:underline">
            Log In
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link href="/legal/terms-of-service" className="underline hover:text-gray-700">Terms of Service</Link>
          {' '}and marketing emails. Protected by reCAPTCHA; Google&apos;s{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>
          {' '}and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a>
          {' '}apply.
        </p>
      </div>
    </div>
  );
}
