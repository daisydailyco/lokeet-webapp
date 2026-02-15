'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, Save, User } from '@/lib/api';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewSaveModal, setShowNewSaveModal] = useState(false);
  const [editingSave, setEditingSave] = useState<Save | null>(null);

  const loadSaves = useCallback(async () => {
    const data = await api.getSaves();
    setSaves(data);
  }, []);

  const checkAuth = useCallback(async () => {
    const { valid, user: verifiedUser } = await api.verifySession();

    if (!valid) {
      router.push('/login');
      return;
    }

    setUser(verifiedUser || null);
    await loadSaves();
    setLoading(false);
  }, [router, loadSaves]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  async function handleLogout() {
    await api.logout();
    router.push('/');
  }

  async function handleDeleteSave(id: string) {
    if (!confirm('Delete this save?')) return;

    await api.deleteSave(id);
    setSaves(saves.filter(s => s.id !== id));
  }

  async function handleShareCategory(category: string | undefined) {
    if (!category) return;

    const itemsToShare = saves.filter(s => s.category === category);
    if (itemsToShare.length === 0) return;

    const result = await api.shareCategory(category, itemsToShare);
    if (result.success) {
      alert(`Share link created: ${result.share_url}`);
      navigator.clipboard.writeText(result.share_url);
    }
  }

  const categories = Array.from(new Set(saves.map(s => s.category).filter(Boolean)));

  // Apply category filter
  const categoryFilteredSaves = filter === 'all'
    ? saves
    : saves.filter(s => s.category === filter);

  // Apply search filter
  const filteredSaves = searchQuery.trim() === ''
    ? categoryFilteredSaves
    : categoryFilteredSaves.filter(save => {
        const query = searchQuery.toLowerCase();
        return (
          (save.venue_name?.toLowerCase().includes(query)) ||
          (save.event_name?.toLowerCase().includes(query)) ||
          (save.content?.toLowerCase().includes(query)) ||
          (save.category?.toLowerCase().includes(query)) ||
          save.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });

  const sortedSaves = [...filteredSaves].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
    } else {
      return (a.category || '').localeCompare(b.category || '');
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Card Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Search and Filters Skeleton */}
            <div className="mb-4">
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Categories Grid Skeleton */}
          <div className="mb-6">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Saves List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
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

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by venue, content, tags, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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

                  <div className="flex gap-3 items-center">
                    <a
                      href={save.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => setEditingSave(save)}
                      className="text-gray-600 hover:text-gray-900 transition"
                      title="Edit save"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
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
        <SaveModal
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

      {/* Edit Save Modal */}
      {editingSave && (
        <SaveModal
          existingSave={editingSave}
          onClose={() => setEditingSave(null)}
          onSave={async (updates) => {
            const result = await api.updateSave(editingSave.id, updates);
            if (result.success) {
              // Update the save in the list
              setSaves(saves.map(s =>
                s.id === editingSave.id
                  ? { ...s, ...updates }
                  : s
              ));
              setEditingSave(null);
            }
          }}
        />
      )}
    </div>
  );
}

interface SaveFormData {
  platform: string;
  url: string;
  content: string;
  author: string;
  category: string;
}

function SaveModal({ existingSave, onClose, onSave }: {
  existingSave?: Save;
  onClose: () => void;
  onSave: (save: SaveFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    platform: existingSave?.platform || 'instagram',
    url: existingSave?.url || '',
    content: existingSave?.content || '',
    author: existingSave?.author || '',
    category: existingSave?.category || ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(formData);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          {existingSave ? 'Edit Save' : 'New Save'}
        </h2>

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
