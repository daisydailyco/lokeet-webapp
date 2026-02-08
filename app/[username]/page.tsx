'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, User, Save } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = (params.username as string)?.replace('@', '');

  const [profile, setProfile] = useState<User | null>(null);
  const [saves, setSaves] = useState<Save[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [username]);

  async function loadProfile() {
    const currentUser = api.getCurrentUser();

    // Check if this is the user's own profile
    if (currentUser && currentUser.username === username) {
      setIsOwnProfile(true);
      const fullProfile = await api.getProfile();
      if (fullProfile) {
        setProfile(fullProfile);
        const userSaves = await api.getSaves();
        setSaves(userSaves);
      }
    } else {
      // Load public profile (TODO: implement backend endpoint)
      // For now, redirect non-authenticated users
      const publicProfile = await api.getPublicProfile(username);
      if (publicProfile) {
        setProfile(publicProfile);
      }
    }

    setLoading(false);
  }

  async function handleSaveProfile(updates: Partial<User>) {
    const result = await api.updateProfile(updates);
    if (result.success) {
      setProfile(result.user);
      setIsEditing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">User @{username} doesn't exist</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold">Lokeet</Link>
            {isOwnProfile && (
              <Link
                href="/dashboard"
                className="text-blue-600 hover:underline"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-8">
            {/* Profile Picture Placeholder */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {profile.display_name?.[0] || username[0].toUpperCase()}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">@{username}</h1>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                )}
              </div>

              {isEditing ? (
                <ProfileEditForm
                  profile={profile}
                  onSave={handleSaveProfile}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  {profile.display_name && (
                    <p className="text-xl mb-2">{profile.display_name}</p>
                  )}

                  {profile.zip_code && (
                    <p className="text-gray-600 mb-2">📍 {profile.zip_code}</p>
                  )}

                  {profile.collections && profile.collections.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-4">
                      {profile.collections.map((col, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: col.color || '#e5e7eb' }}
                        >
                          {col.name}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-8 mt-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{saves.length}</div>
                  <div className="text-gray-600 text-sm">Saves</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(saves.map(s => s.category).filter(Boolean)).size}
                  </div>
                  <div className="text-gray-600 text-sm">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button className="py-4 border-b-2 border-black font-semibold">
              SAVES
            </button>
          </div>
        </div>
      </div>

      {/* Saves Grid */}
      <main className="container mx-auto px-4 py-8">
        {saves.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No saves yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saves.map(save => (
              <div key={save.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {save.images.length > 0 && (
                  <img
                    src={save.images[0]}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  {save.category && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {save.category}
                    </span>
                  )}
                  <h3 className="font-semibold mt-2 mb-1">
                    {save.event_name || save.venue_name || 'Saved Post'}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{save.content}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">@{save.author}</span>
                    <a
                      href={save.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileEditForm({
  profile,
  onSave,
  onCancel
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
    email: profile.email
  });
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  async function checkUsername(username: string) {
    if (username === profile.username) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    const available = await api.checkUsernameAvailability(username);
    setUsernameAvailable(available);
    setCheckingUsername(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameAvailable) return;
    await onSave(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <div className="flex items-center gap-2">
          <span>@</span>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
              setFormData({ ...formData, username: val });
              if (val) checkUsername(val);
            }}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="username"
            required
          />
        </div>
        {checkingUsername && (
          <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
        )}
        {!checkingUsername && !usernameAvailable && (
          <p className="text-sm text-red-600 mt-1">Username taken</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Zip Code</label>
        <input
          type="text"
          value={formData.zip_code}
          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          placeholder="90210"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Birthday</label>
        <input
          type="date"
          value={formData.birthday}
          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!usernameAvailable}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Save
        </button>
      </div>
    </form>
  );
}
