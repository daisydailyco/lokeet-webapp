'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api, PortalEvent } from '@/lib/api';
import Link from 'next/link';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PublicPortalContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = (params.username as string)?.replace('@', '');

  const cityFilter = searchParams.get('city') || 'all';
  const categoryFilter = searchParams.get('category') || 'all';
  const tagFilter = searchParams.get('tag') || 'all';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const sortBy = (searchParams.get('sort') || 'date') as 'date' | 'name' | 'category';
  const sortDir = (searchParams.get('dir') || 'asc') as 'asc' | 'desc';

  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navTransition, setNavTransition] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setNavTransition(true)));
  }, []);

  useEffect(() => {
    async function load() {
      const [data, profile] = await Promise.all([
        api.getPublicPortalEvents(username),
        api.getPublicProfile(username),
      ]);
      if (data === null) { setNotFound(true); }
      else { setEvents(data); }
      if (profile?.display_name) setDisplayName(profile.display_name);
      setLoading(false);
    }
    load();
  }, [username]);

  const filtered = events.filter(e => {
    if (cityFilter !== 'all' && e.city !== cityFilter) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (tagFilter !== 'all' && !(e.tags || []).includes(tagFilter)) return false;
    if (dateFrom || dateTo) {
      if (!e.date) return false;
      const d = new Date(e.date + 'T12:00:00');
      if (dateFrom && d < new Date(dateFrom + 'T00:00:00')) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      if (!a.date) return 1; if (!b.date) return -1;
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === 'asc' ? diff : -diff;
    }
    if (sortBy === 'category') {
      const ca = a.category || '', cb = b.category || '';
      return sortDir === 'asc' ? ca.localeCompare(cb) : cb.localeCompare(ca);
    }
    return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  const activeFilters: { label: string; value: string }[] = [];
  if (cityFilter !== 'all') activeFilters.push({ label: 'City', value: cityFilter });
  if (categoryFilter !== 'all') activeFilters.push({ label: 'Category', value: categoryFilter });
  if (tagFilter !== 'all') activeFilters.push({ label: 'Tag', value: tagFilter });
  if (dateFrom || dateTo) {
    const label = dateFrom && dateTo
      ? `${formatDateShort(dateFrom)} – ${formatDateShort(dateTo)}`
      : dateFrom ? `From ${formatDateShort(dateFrom)}` : `Until ${formatDateShort(dateTo)}`;
    activeFilters.push({ label: 'Dates', value: label });
  }
  if (sortBy !== 'date') activeFilters.push({ label: 'Sort', value: sortBy });
  if (sortDir !== 'asc') activeFilters.push({ label: 'Order', value: 'newest first' });

  const headingName = displayName || username;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 text-center max-w-sm w-full">
          <p className="text-gray-500">Portal not found.</p>
          <Link href="https://lokeet.io" className="mt-4 inline-block text-sm font-semibold text-gray-900 hover:underline">Back to Lokeet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]">
      <header className="bg-white border-b border-black/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{headingName}</span>
              <span className="text-sm text-gray-400 font-medium">
                @{username} on <Link href="https://lokeet.io" className="hover:text-gray-600 transition-colors">Lokeet</Link>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`overflow-hidden whitespace-nowrap ${navTransition ? 'transition-all duration-300 ease-in-out' : ''} ${menuOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                <div className="flex items-center gap-3 pr-1">
                  <Link href="https://lokeet.io/signup" className="flex-shrink-0 text-sm font-medium text-gray-900 hover:underline">
                    Sign Up for Lokeet!
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="bg-white border-b border-black/5 px-4 py-2">
          <div className="container mx-auto flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400">Showing:</span>
            {activeFilters.map(f => (
              <span key={f.label} className="px-2.5 py-1 text-xs rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                <span className="text-gray-400">{f.label}: </span>{f.value}
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-400">{events.length === 0 ? 'No events yet.' : 'No events match these filters.'}</p>
          </div>
        ) : (
          filtered.map(evt => (
            <div key={evt.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-2 mb-1">
                <h3 className="text-lg font-semibold flex-1">{evt.name || 'Untitled'}</h3>
                {evt.category && (
                  <span className="flex-shrink-0 mt-1 px-2 py-0.5 rounded-full text-xs border border-gray-200 text-gray-500">{evt.category}</span>
                )}
              </div>
              {evt.date && (
                <p className="text-sm text-[#42a746] font-medium mb-2">{formatDate(evt.date)}</p>
              )}
              {evt.address && (
                <p className="text-sm text-gray-500">{evt.address}{evt.city ? `, ${evt.city}` : ''}{evt.state ? `, ${evt.state}` : ''}</p>
              )}
              {(evt.tags || []).length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {evt.tags!.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 border border-gray-100 text-gray-500">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <footer className="text-center py-8">
        <p className="text-xs text-gray-400">Powered by <Link href="https://lokeet.io" className="hover:text-gray-600 transition-colors">Lokeet</Link></p>
      </footer>
    </div>
  );
}

export default function PublicPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    }>
      <PublicPortalContent />
    </Suspense>
  );
}
