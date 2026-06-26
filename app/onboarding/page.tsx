'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const USE_CASES = [
  { id: 'saving', label: 'Saving spots I discover online', description: 'Save places from Instagram & TikTok with one click' },
  { id: 'events', label: 'Planning events & outings', description: 'Organize and coordinate events for your crew' },
  { id: 'sharing', label: 'Sharing lists with my community', description: 'Share curated spot lists with friends and followers' },
  { id: 'local', label: 'Discovering local places', description: 'Find great spots in my city and beyond' },
  { id: 'guests', label: 'Managing guests & RSVPs', description: 'Track invites and responses for gatherings' },
];

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = api.getCurrentUser();
    if (user?.display_name) setDisplayName(user.display_name);
    if (user?.username) setUsername(user.username);
  }, [router]);

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const available = await api.checkUsernameAvailability(username);
      setUsernameAvailable(available);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  function toggleUseCase(id: string) {
    setSelectedUseCases(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  }

  async function handleProfileSave() {
    if (!displayName.trim()) {
      setError('Please enter your display name.');
      return;
    }
    if (username.length > 0 && username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (username.length >= 3 && usernameAvailable === false) {
      setError('That username is already taken.');
      return;
    }
    setSaving(true);
    setError('');
    const updates: Record<string, string> = { display_name: displayName.trim() };
    if (username.trim()) updates.username = username.trim();
    const result = await api.updateProfile(updates);
    setSaving(false);
    if (result.success !== false) {
      setStep(3);
    } else {
      setError(result.error || 'Failed to save profile. Please try again.');
    }
  }

  function handleFinish() {
    localStorage.setItem('lokeet_onboarding_complete', 'true');
    localStorage.setItem('lokeet_use_cases', JSON.stringify(selectedUseCases));
    router.push('/dashboard');
  }

  const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-lg">

        <div className="text-center mb-6">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <p className="text-gray-600 mt-1">Let&apos;s set up your account</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#42a746] h-2 rounded-full transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">What will you use Lokeet for?</h2>
            <p className="text-gray-500 text-sm mb-6">Select all that apply — we&apos;ll tailor your experience.</p>
            <div className="space-y-3 mb-8">
              {USE_CASES.map(uc => {
                const selected = selectedUseCases.includes(uc.id);
                return (
                  <button
                    key={uc.id}
                    onClick={() => toggleUseCase(uc.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors duration-150 ${
                      selected ? 'border-[#42a746] bg-[#42a746]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{uc.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{uc.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'border-[#42a746] bg-[#42a746]' : 'border-gray-300'
                      }`}>
                        {selected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900"
            >
              {selectedUseCases.length === 0 ? 'Skip for now' : 'Next'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Set up your profile</h2>
            <p className="text-gray-500 text-sm mb-6">This is how others will find and recognize you on Lokeet.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="yourhandle"
                    className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                  />
                </div>
                {username.length >= 3 && (
                  <p className={`text-xs mt-1 ${
                    checkingUsername ? 'text-gray-400' :
                    usernameAvailable === true ? 'text-[#42a746]' :
                    usernameAvailable === false ? 'text-red-500' : ''
                  }`}>
                    {checkingUsername
                      ? 'Checking availability...'
                      : usernameAvailable === true
                        ? `lokeet.io/${username} is available`
                        : usernameAvailable === false
                          ? 'That username is already taken'
                          : ''}
                  </p>
                )}
                {username.length > 0 && username.length < 3 && (
                  <p className="text-xs mt-1 text-gray-400">Username must be at least 3 characters</p>
                )}
                {username.length === 0 && (
                  <p className="text-xs mt-1 text-gray-400">Your public profile will be at lokeet.io/yourhandle</p>
                )}
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setError(''); setStep(1); }}
                className="flex-1 py-3 rounded-lg border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProfileSave}
                disabled={saving || !displayName.trim() || (username.length >= 3 && usernameAvailable === false) || checkingUsername}
                className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">You&apos;re all set!</h2>
            <p className="text-gray-500 text-sm mb-6">Here&apos;s how to save your first spot on Lokeet.</p>
            <div className="space-y-4 mb-8">
              <div className="border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Install the Chrome Extension</p>
                    <p className="text-xs text-gray-500 mt-0.5">Search &ldquo;Lokeet: Save &amp; Share&rdquo; in the Chrome Web Store and add it to your browser.</p>
                    <a
                      href="https://chromewebstore.google.com/search/Lokeet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs font-semibold text-[#42a746] hover:underline"
                    >
                      Open Chrome Web Store &rarr;
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Browse Instagram or TikTok</p>
                    <p className="text-xs text-gray-500 mt-0.5">When you see a spot, event, or place you love, click the Lokeet extension icon to save it instantly.</p>
                  </div>
                </div>
              </div>
              <div className="border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">View &amp; share your list</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      All your saves appear in your dashboard. Share your list with friends at{' '}
                      {username ? (
                        <span className="font-medium text-gray-700">lokeet.io/{username}</span>
                      ) : (
                        'your public profile link'
                      )}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900"
            >
              Go to my dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
