'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push('/login');
      return;
    }
    api.getProfile().then((p) => {
      if (!p) { router.push('/login'); return; }
      setProfile(p);
      setLoading(false);
    });
  }, [router]);

  async function handleSaveProfile(updates: Partial<User>) {
    const result = await api.updateProfile(updates);
    if (result.success) {
      setProfile(result.user);
      setIsEditing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.display_name?.[0] || profile.email?.[0] || '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold">Lokeet</Link>
          <Link href="/dashboard" className="text-sm hover:underline">← Dashboard</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8">
          {/* Avatar + name */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#42a746] to-[#3a9340] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {initials.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {profile.display_name || profile.email}
              </h1>
              {profile.username && (
                <p className="text-gray-500">@{profile.username}</p>
              )}
              {!profile.username && (
                <p className="text-sm text-amber-600">No username set yet</p>
              )}
            </div>
          </div>

          {isEditing ? (
            <ProfileEditForm
              profile={profile}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="space-y-4 mb-8">
                <Row label="Email" value={profile.email} />
                <Row label="Display name" value={profile.display_name} />
                <Row label="Username" value={profile.username ? `@${profile.username}` : undefined} />
                <Row label="Zip code" value={profile.zip_code} />
                <Row label="Birthday" value={profile.birthday} />
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || <span className="text-gray-300 italic">not set</span>}</span>
    </div>
  );
}

function ProfileEditForm({
  profile,
  onSave,
  onCancel,
}: {
  profile: User;
  onSave: (updates: Partial<User>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    username: profile.username || '',
    zip_code: profile.zip_code || '',
    birthday: profile.birthday || '',
  });
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  async function checkUsername(value: string) {
    if (value === profile.username) { setUsernameAvailable(true); return; }
    setCheckingUsername(true);
    const available = await api.checkUsernameAvailability(value);
    setUsernameAvailable(available);
    setCheckingUsername(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameAvailable || saving) return;
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input type="text" value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-[#42a746] overflow-hidden">
          <span className="px-3 py-3 text-gray-400 bg-gray-50 border-r">@</span>
          <input type="text" value={formData.username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
              setFormData({ ...formData, username: val });
              if (val) checkUsername(val);
            }}
            className="flex-1 px-3 py-3 focus:outline-none"
            placeholder="username"
          />
        </div>
        {checkingUsername && <p className="text-xs text-gray-400 mt-1">Checking...</p>}
        {!checkingUsername && formData.username && !usernameAvailable && (
          <p className="text-xs text-red-600 mt-1">Username already taken</p>
        )}
        {!checkingUsername && formData.username && usernameAvailable && formData.username !== profile.username && (
          <p className="text-xs text-[#42a746] mt-1">Username available</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Zip Code</label>
        <input type="text" value={formData.zip_code}
          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
          placeholder="33701"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Birthday</label>
        <input type="date" value={formData.birthday}
          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={!usernameAvailable || saving}
          className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
