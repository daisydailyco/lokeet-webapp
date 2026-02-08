'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Save, User } from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [showNewSaveModal, setShowNewSaveModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { valid, user: verifiedUser } = await api.verifySession();

    if (!valid) {
      router.push('/login');
      return;
    }

    setUser(verifiedUser || null);
    await loadSaves();
    setLoading(false);
  }

  async function loadSaves() {
    const data = await api.getSaves();
    setSaves(data);
  }

  async function handleLogout() {
    await api.logout();
    router.push('/');
  }

  async function handleDeleteSave(id: string) {
    if (!confirm('Delete this save?')) return;

    await api.deleteSave(id);
    setSaves(saves.filter(s => s.id !== id));
  }

  async function handleShareCategory(category: string) {
    const itemsToShare = saves.filter(s => s.category === category);
    if (itemsToShare.length === 0) return;

    const result = await api.shareCategory(category, itemsToShare);
    if (result.success) {
      alert(`Share link created: ${result.share_url}`);
      navigator.clipboard.writeText(result.share_url);
    }
  }

  const categories = Array.from(new Set(saves.map(s => s.category).filter(Boolean)));
  const filteredSaves = filter === 'all'
    ? saves
    : saves.filter(s => s.category === filter);

  const sortedSaves = [...filteredSaves].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
    } else {
      return (a.category || '').localeCompare(b.category || '');
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
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

            <div className="flex items-center gap-4">
              <Link
                href={`/@${user?.username || 'profile'}`}
                className="text-sm hover:underline"
              >
                {user?.username ? `@${user.username}` : 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats & Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Saves</h1>
              <p className="text-gray-600">{saves.length} total saves</p>
            </div>
            <button
              onClick={() => setShowNewSaveModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              + New Save
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'category')}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="date">Sort by Date</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => {
                const count = saves.filter(s => s.category === cat).length;
                return (
                  <div key={cat} className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-2">{cat}</h3>
                    <p className="text-sm text-gray-600 mb-3">{count} saves</p>
                    <button
                      onClick={() => handleShareCategory(cat)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Share →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Saves List */}
        <div className="space-y-4">
          {sortedSaves.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-xl text-gray-500 mb-4">No saves yet</p>
              <p className="text-gray-400">Install the extension to start saving!</p>
            </div>
          ) : (
            sortedSaves.map(save => (
              <div key={save.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {save.category && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {save.category}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{save.platform}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                      {save.event_name || save.venue_name || 'Saved Post'}
                    </h3>

                    <p className="text-gray-600 mb-3 line-clamp-2">{save.content}</p>

                    {save.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {save.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>by @{save.author}</span>
                      <span>{new Date(save.saved_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={save.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteSave(save.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {save.images.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {save.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* New Save Modal */}
      {showNewSaveModal && (
        <NewSaveModal
          onClose={() => setShowNewSaveModal(false)}
          onSave={async (save) => {
            const newSave = await api.createSave(save);
            if (newSave) {
              setSaves([newSave, ...saves]);
              setShowNewSaveModal(false);
            }
          }}
        />
      )}
    </div>
  );
}

function NewSaveModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (save: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    platform: 'instagram',
    url: '',
    content: '',
    author: '',
    category: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(formData);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">New Save</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="@username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category (optional)</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Restaurants"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
