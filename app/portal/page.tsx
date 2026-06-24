'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, User } from '@/lib/api';
import Link from 'next/link';
import { Pencil, Calendar, Mail } from 'lucide-react';
import { RadarAddressInput } from '@/components/ui/radar-address-input';
import { DateRangePicker } from '@/components/ui/date-range-picker';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PortalEvent {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  date: string;
  recurring: string;
  category?: string;
  tags?: string[];
  created_at: string;
}

interface EventFormData {
  name: string;
  address: string;
  city: string;
  state?: string;
  date: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'annually' | 'weekdays' | 'custom';
  recurInterval: number;
  recurFreq: 'day' | 'week' | 'month' | 'year';
  category: string;
  tags: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = (uid: string) => `lokeet_portal_events_${uid}`;
const CUSTOM_CATS_KEY = (uid: string) => `lokeet_portal_custom_categories_${uid}`;
const CUSTOM_TAGS_KEY = (uid: string) => `lokeet_portal_custom_tags_${uid}`;
const DELETE_PREF_KEY = 'lokeet_skip_delete_confirm';

const STATIC_CATEGORIES = ['Markets', 'Networking', 'Meet Ups', 'Workshops'];

const CATEGORY_TAGS: Record<string, string[]> = {
  'Markets':    ['Artisan', 'Vintage', 'Food', 'Flea Market', 'Outdoor', 'Indoor', 'Free', 'Pop-Up'],
  'Networking': ['Professional', 'Industry', 'Casual', 'Speed Networking', 'Happy Hour'],
  'Meet Ups':   ['Social', 'Hobby', 'Community', 'Free', 'RSVP Required', 'Adults Only'],
  'Workshops':  ['Educational', 'Hands-On', 'Virtual', 'Beginner', 'Advanced', 'Creative'],
};

const STATIC_TAGS = ['Free', 'Ticketed', 'RSVP Required', 'Outdoor', 'Indoor'];

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T12:00:00');
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function recurringLabel(r: string, dateStr: string): string {
  if (!r || r === 'none') return '';
  if (r === 'daily') return 'Daily';
  if (r === 'weekly') {
    const day = dateStr ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : 'same day';
    return `Weekly on ${day}`;
  }
  if (r === 'monthly') return 'Monthly';
  if (r === 'annually') return 'Annually';
  if (r === 'weekdays') return 'Every weekday';
  return r;
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Portal() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  useEffect(() => { setShowNavMenu(sessionStorage.getItem('lokeet_nav_open') === 'true'); }, []);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PortalEvent | null>(null);
  const [invitingEvent, setInvitingEvent] = useState<PortalEvent | null>(null);

  // Filter state
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [customCities, setCustomCities] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [managedCityOrder, setManagedCityOrder] = useState<string[]>([]);
  const [managedCategoryOrder, setManagedCategoryOrder] = useState<string[]>([]);
  const [managedTagOrder, setManagedTagOrder] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newCityInput, setNewCityInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [activeQuickDate, setActiveQuickDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showEditFilters, setShowEditFilters] = useState(false);
  const [dateMenuTop, setDateMenuTop] = useState(0);
  const [sortMenuTop, setSortMenuTop] = useState(0);
  const [editFiltersTop, setEditFiltersTop] = useState(0);

  const dateMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const editFiltersWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) setShowDateMenu(false);
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setShowSortMenu(false);
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) setShowNavMenu(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { valid, user: verifiedUser } = await api.verifySession();
      if (!valid) { router.push('/login'); return; }
      setUser(verifiedUser || null);
      if (verifiedUser?.id) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY(verifiedUser.id));
          if (stored) setEvents(JSON.parse(stored));
          const cc = localStorage.getItem(CUSTOM_CATS_KEY(verifiedUser.id));
          if (cc) setCustomCategories(JSON.parse(cc));
          const ct = localStorage.getItem(CUSTOM_TAGS_KEY(verifiedUser.id));
          if (ct) setCustomTags(JSON.parse(ct));
        } catch {}
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  function persistEvents(evts: PortalEvent[]) {
    setEvents(evts);
    if (user?.id) localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(evts));
  }

  function persistCustomCategories(cats: string[]) {
    setCustomCategories(cats);
    if (user?.id) localStorage.setItem(CUSTOM_CATS_KEY(user.id), JSON.stringify(cats));
  }

  function persistCustomTags(tags: string[]) {
    setCustomTags(tags);
    if (user?.id) localStorage.setItem(CUSTOM_TAGS_KEY(user.id), JSON.stringify(tags));
  }

  function handleDeleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    persistEvents(events.filter(e => e.id !== id));
  }

  async function handleLogout() {
    await api.logout();
    router.push('/');
  }

  const applyQuickDate = (value: string) => {
    setActiveQuickDate(value);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = new Date();
    if (value === 'all') { setCustomDateFrom(''); setCustomDateTo(''); }
    else if (value === 'today') { setCustomDateFrom(fmt(today)); setCustomDateTo(fmt(today)); }
    else if (value === 'upcoming') { setCustomDateFrom(fmt(today)); setCustomDateTo(''); }
    else if (value === 'past') { setCustomDateFrom(''); setCustomDateTo(fmt(today)); }
    else if (value === 'weekend') {
      const day = today.getDay();
      const sat = new Date(today); sat.setDate(today.getDate() + (6 - day + 7) % 7 || 7);
      const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
      setCustomDateFrom(fmt(sat)); setCustomDateTo(fmt(sun));
    } else if (value === 'month') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setCustomDateFrom(fmt(first)); setCustomDateTo(fmt(last));
    }
  };

  // Derived option lists
  const dynamicCities = Array.from(new Set(events.map(e => e.city).filter(Boolean)));
  const allCities = Array.from(new Set([...dynamicCities, ...customCities]));
  const displayCities = managedCityOrder.length > 0 ? managedCityOrder.filter(c => allCities.includes(c)) : allCities;

  const dynamicCategories = events.map(e => e.category).filter(Boolean) as string[];
  const allCategories = Array.from(new Set([...STATIC_CATEGORIES, ...dynamicCategories, ...customCategories])).sort();
  const displayCategories = managedCategoryOrder.length > 0 ? managedCategoryOrder.filter(c => allCategories.includes(c)) : allCategories;

  const dynamicTags = Array.from(new Set(events.flatMap(e => e.tags || [])));
  const availableTags = (() => {
    const base = categoryFilter !== 'all' && CATEGORY_TAGS[categoryFilter]
      ? CATEGORY_TAGS[categoryFilter]
      : Array.from(new Set([...STATIC_TAGS, ...dynamicTags]));
    return Array.from(new Set([...base, ...customTags]));
  })();
  const displayTags = managedTagOrder.length > 0 ? managedTagOrder.filter(t => availableTags.includes(t)) : availableTags;

  // Filter + sort
  const filteredEvents = events.filter(e => {
    if (cityFilter !== 'all' && e.city !== cityFilter) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (tagFilter !== 'all' && !(e.tags || []).includes(tagFilter)) return false;
    if (!customDateFrom && !customDateTo) return true;
    if (!e.date) return false;
    const d = new Date(e.date + 'T12:00:00');
    const from = customDateFrom ? new Date(customDateFrom + 'T00:00:00') : new Date(0);
    const to = customDateTo ? new Date(customDateTo + 'T23:59:59') : new Date(8640000000000000);
    return d >= from && d <= to;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return sortDirection === 'asc' ? da - db : db - da;
    }
    if (sortBy === 'category') {
      const ca = (a.category || '').toLowerCase();
      const cb = (b.category || '').toLowerCase();
      return sortDirection === 'asc' ? ca.localeCompare(cb) : cb.localeCompare(ca);
    }
    return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  const topEvents = events.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]">
        <header className="bg-white border-b border-black/10 sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]">
      {/* Header */}
      <header className="bg-white border-b border-black/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-3xl font-bold">Lokeet</Link>
            <div className="flex items-center gap-4">
              <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${showNavMenu ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                <div className="flex items-center gap-3 pr-1">
                  <Link href="/dashboard" className={`flex-shrink-0 text-sm font-medium text-gray-900 ${pathname === '/dashboard' ? 'px-3 py-1 border-2 border-gray-900 rounded-full' : 'hover:underline'}`}>
                    Dashboard
                  </Link>
                  <Link href="/portal" className={`flex-shrink-0 text-sm font-medium text-gray-900 ${pathname === '/portal' ? 'px-3 py-1 border-2 border-gray-900 rounded-full' : 'hover:underline'}`}>
                    Portal
                  </Link>
                </div>
              </div>
              <button onClick={() => setShowProfilePanel(true)} className="text-sm hover:underline">
                {user?.username ? (
                  <span className="flex items-baseline gap-1">
                    <span className="font-bold">{user.display_name || user.username}</span>
                    <span className="text-gray-400">@{user.username}</span>
                  </span>
                ) : 'Profile'}
              </button>
              <button onClick={() => setShowNavMenu(p => { const next = !p; sessionStorage.setItem('lokeet_nav_open', String(next)); return next; })} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">

        {/* Filters card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {events.length === 0 && (
            <style>{`
              @keyframes border-pulse {
                0%, 100% { border-color: #111827; }
                50% { border-color: #42a746; }
              }
              .new-event-pulse { animation: border-pulse 1.8s ease-in-out infinite; }
            `}</style>
          )}

          {/* Row 1: filters + button */}
          <div className="flex gap-3 flex-wrap items-center">
            <DeletableSelect
              value={cityFilter}
              onChange={setCityFilter}
              defaultLabel="All Cities"
              options={displayCities.map(c => ({ value: c, label: c, deletable: customCities.includes(c) }))}
              onDelete={(c) => { setCustomCities(p => p.filter(x => x !== c)); if (cityFilter === c) setCityFilter('all'); }}
              addNewLabel="+ Add new city…"
              onAddNew={() => { setShowCityInput(true); setShowCategoryInput(false); setShowTagInput(false); }}
            />
            <DeletableSelect
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setTagFilter('all'); }}
              defaultLabel="All Categories"
              options={displayCategories.map(c => ({ value: c, label: c, deletable: customCategories.includes(c) }))}
              onDelete={(c) => { persistCustomCategories(customCategories.filter(x => x !== c)); if (categoryFilter === c) { setCategoryFilter('all'); setTagFilter('all'); } }}
              addNewLabel="+ Add new category…"
              onAddNew={() => { setShowCategoryInput(true); setShowCityInput(false); setShowTagInput(false); }}
            />
            <DeletableSelect
              value={tagFilter}
              onChange={setTagFilter}
              defaultLabel="All Tags"
              options={displayTags.map(t => ({ value: t, label: t, deletable: customTags.includes(t) }))}
              onDelete={(t) => { persistCustomTags(customTags.filter(x => x !== t)); if (tagFilter === t) setTagFilter('all'); }}
              addNewLabel="+ Add new tag…"
              onAddNew={() => { setShowTagInput(true); setShowCityInput(false); setShowCategoryInput(false); }}
            />

            {/* Date filter */}
            <div ref={dateMenuRef} className="relative">
              <button
                type="button"
                onClick={() => { if (dateMenuRef.current) setDateMenuTop(dateMenuRef.current.getBoundingClientRect().bottom + 4); setShowDateMenu(p => !p); setShowSortMenu(false); setShowEditFilters(false); }}
                className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${(customDateFrom || customDateTo) ? 'border-gray-900 bg-gray-100' : ''}`}
                title="Filter by date"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
              {showDateMenu && (
                <div
                  className="fixed left-1/2 -translate-x-1/2 w-[90vw] sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-11 sm:w-auto sm:min-w-[300px] bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4"
                  style={isMobile() ? { top: dateMenuTop } : undefined}
                >
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Date range</p>
                  <div className="mb-4">
                    <DateRangePicker
                      startDate={customDateFrom}
                      endDate={customDateTo}
                      onChange={(start, end) => { setCustomDateFrom(start); setCustomDateTo(end); setActiveQuickDate(''); }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick select</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 'today', label: 'Today' },
                      { value: 'weekend', label: 'This Weekend' },
                      { value: 'month', label: 'This Month' },
                      { value: 'upcoming', label: 'Upcoming' },
                      { value: 'past', label: 'Previous' },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => applyQuickDate(opt.value)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${activeQuickDate === opt.value ? 'border-gray-900 bg-gray-100 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Filters */}
            <div ref={editFiltersWrapRef} className="relative">
              <button
                type="button"
                onClick={() => { if (editFiltersWrapRef.current) setEditFiltersTop(editFiltersWrapRef.current.getBoundingClientRect().bottom + 4); setShowEditFilters(p => !p); setShowDateMenu(false); setShowSortMenu(false); }}
                className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${showEditFilters ? 'border-gray-900 bg-gray-100' : ''}`}
                title="Edit Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
                  <line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
                  <line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
                </svg>
              </button>
              {showEditFilters && (
                <EditFiltersPopup
                  cities={displayCities} categories={displayCategories} tags={displayTags}
                  customCities={customCities} customCategories={customCategories} customTags={customTags}
                  onDeleteCity={(v) => { setCustomCities(p => p.filter(x => x !== v)); if (cityFilter === v) setCityFilter('all'); }}
                  onDeleteCategory={(v) => { persistCustomCategories(customCategories.filter(x => x !== v)); if (categoryFilter === v) { setCategoryFilter('all'); setTagFilter('all'); } }}
                  onDeleteTag={(v) => { persistCustomTags(customTags.filter(x => x !== v)); if (tagFilter === v) setTagFilter('all'); }}
                  onAddCity={(v) => setCustomCities(p => [...p, v])}
                  onAddCategory={(v) => persistCustomCategories([...customCategories, v])}
                  onAddTag={(v) => persistCustomTags([...customTags, v])}
                  onSave={(cities, categories, tags) => { setManagedCityOrder(cities); setManagedCategoryOrder(categories); setManagedTagOrder(tags); }}
                  onClose={() => setShowEditFilters(false)}
                  mobileTop={editFiltersTop}
                />
              )}
            </div>

            {/* Sort */}
            <div ref={sortMenuRef} className="relative">
              <button
                type="button"
                onClick={() => { if (sortMenuRef.current) setSortMenuTop(sortMenuRef.current.getBoundingClientRect().bottom + 4); setShowSortMenu(p => !p); setShowDateMenu(false); setShowEditFilters(false); }}
                className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                title="Sort"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="8" y1="12" x2="20" y2="12"/>
                  <line x1="12" y1="18" x2="20" y2="18"/>
                </svg>
              </button>
              {showSortMenu && (
                <div
                  className="fixed left-1/2 -translate-x-1/2 w-[90vw] sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-11 sm:w-auto sm:min-w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4"
                  style={isMobile() ? { top: sortMenuTop } : undefined}
                >
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sort by</p>
                  <div className="flex gap-2 mb-4">
                    {(['date', 'category', 'name'] as const).map(opt => (
                      <button key={opt} type="button" onClick={() => setSortBy(opt)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm border transition-colors ${sortBy === opt ? 'border-gray-900 bg-gray-100 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order</p>
                  <div className="flex gap-2">
                    {(['asc', 'desc'] as const).map(opt => (
                      <button key={opt} type="button" onClick={() => setSortDirection(opt)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm border transition-colors ${sortDirection === opt ? 'border-gray-900 bg-gray-100 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                        {opt === 'asc' ? '↑ Ascending' : '↓ Descending'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* New Event button — pill, inline with filters */}
            <button
              onClick={() => setShowNewEventModal(true)}
              className={`ml-auto flex-shrink-0 bg-white text-gray-900 font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 text-sm${events.length === 0 ? ' new-event-pulse' : ''}`}
            >
              + New Event
            </button>
          </div>

          {/* Row 2: add-new inputs */}
          {showCityInput && (
            <div className="flex gap-2 mt-3">
              <input type="text" value={newCityInput} onChange={e => setNewCityInput(e.target.value)}
                placeholder="City, State (e.g. Orlando, FL)" autoFocus
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
              <button type="button" onClick={() => { const v = newCityInput.trim(); if (v) setCustomCities(p => [...p, v]); setNewCityInput(''); setShowCityInput(false); }}
                className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
              <button type="button" onClick={() => { setShowCityInput(false); setNewCityInput(''); }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          )}
          {showCategoryInput && (
            <div className="flex gap-2 mt-3">
              <input type="text" value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)}
                placeholder="e.g. Charity" autoFocus
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
              <button type="button" onClick={() => { const v = newCategoryInput.trim(); if (v) persistCustomCategories([...customCategories, v]); setNewCategoryInput(''); setShowCategoryInput(false); }}
                className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
              <button type="button" onClick={() => { setShowCategoryInput(false); setNewCategoryInput(''); }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          )}
          {showTagInput && (
            <div className="flex gap-2 mt-3">
              <input type="text" value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                placeholder="e.g. Pet Friendly" autoFocus
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
              <button type="button" onClick={() => { const v = newTagInput.trim(); if (v) persistCustomTags([...customTags, v]); setNewTagInput(''); setShowTagInput(false); }}
                className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
              <button type="button" onClick={() => { setShowTagInput(false); setNewTagInput(''); }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          )}
        </div>

        {/* Top Events */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Top Events</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topEvents.length > 0 ? topEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-1 truncate">{evt.name || 'Untitled'}</h3>
                {evt.date && <p className="text-sm text-[#42a746] font-medium mb-1">{formatDate(evt.date)}</p>}
                <p className="text-sm text-gray-500 truncate">{evt.city || evt.address || '—'}</p>
              </div>
            )) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Portal heading + count */}
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-xl font-bold">My Portal</h2>
          <span className="text-sm text-gray-500">{events.length} event{events.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-xl text-gray-500 mb-4">{events.length === 0 ? 'No events yet' : 'No events match your filters'}</p>
              {events.length === 0 && <p className="text-gray-400">Click "+ New Event" to add your first event.</p>}
            </div>
          ) : (
            sortedEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{evt.name || 'Untitled'}</h3>
                      {evt.category && <span className="flex-shrink-0 mt-1 px-2 py-0.5 rounded-full text-xs border border-gray-200 text-gray-500">{evt.category}</span>}
                    </div>
                    {evt.date && (
                      <div className="flex items-center gap-1 text-sm text-[#42a746] font-medium mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(evt.date)}</span>
                        {evt.recurring && evt.recurring !== 'none' && (
                          <span className="text-gray-400 font-normal ml-1">· {recurringLabel(evt.recurring, evt.date)}</span>
                        )}
                      </div>
                    )}
                    {evt.address && <p className="text-sm text-gray-600 mb-1">{evt.address}</p>}
                    {evt.city && <p className="text-xs text-gray-400 mb-2">{evt.city}{evt.state ? `, ${evt.state}` : ''}</p>}
                    {(evt.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(evt.tags || []).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setInvitingEvent(evt)} className="text-gray-400 hover:text-gray-700 transition" title="Invite people">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingEvent(evt)} className="text-gray-400 hover:text-gray-700 transition" title="Edit event">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteEvent(evt.id)} className="text-red-500 hover:text-red-700 transition" title="Delete event">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 py-12 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-70">Made with ❤️ for Locals</p>
        </div>
      </footer>

      {/* New Event Modal */}
      {showNewEventModal && (
        <NewEventModal
          onClose={() => setShowNewEventModal(false)}
          onSave={(evt) => {
            const newEvt: PortalEvent = { ...evt, id: `evt_${Date.now()}`, created_at: new Date().toISOString() };
            persistEvents([newEvt, ...events]);
            setShowNewEventModal(false);
          }}
          sharedCategories={displayCategories}
          sharedTags={availableTags}
          customCategories={customCategories}
          customTags={customTags}
          onAddCategory={(v) => persistCustomCategories([...customCategories, v])}
          onDeleteCategory={(v) => persistCustomCategories(customCategories.filter(x => x !== v))}
          onAddTag={(v) => persistCustomTags([...customTags, v])}
          onDeleteTag={(v) => persistCustomTags(customTags.filter(x => x !== v))}
          tagsByCategory={CATEGORY_TAGS}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <NewEventModal
          existingEvent={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={(evt) => {
            persistEvents(events.map(e => e.id === editingEvent.id ? { ...editingEvent, ...evt } : e));
            setEditingEvent(null);
          }}
          sharedCategories={displayCategories}
          sharedTags={availableTags}
          customCategories={customCategories}
          customTags={customTags}
          onAddCategory={(v) => persistCustomCategories([...customCategories, v])}
          onDeleteCategory={(v) => persistCustomCategories(customCategories.filter(x => x !== v))}
          onAddTag={(v) => persistCustomTags([...customTags, v])}
          onDeleteTag={(v) => persistCustomTags(customTags.filter(x => x !== v))}
          tagsByCategory={CATEGORY_TAGS}
        />
      )}

      {/* Invite Panel */}
      {invitingEvent && (
        <InvitePanel event={invitingEvent} onClose={() => setInvitingEvent(null)} displayName={user?.display_name || user?.username || ''} />
      )}

      {/* Profile panel */}
      {showProfilePanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowProfilePanel(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">Profile</h2>
              <button onClick={() => setShowProfilePanel(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-bold">
                  {(user?.display_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.display_name || user?.email}</p>
                  {user?.username ? <p className="text-sm text-gray-500">@{user.username}</p> : <p className="text-xs text-amber-600">No username set</p>}
                </div>
              </div>
              <div className="space-y-0 mb-6 rounded-xl border border-gray-100 overflow-hidden">
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Display name', value: user?.display_name },
                  { label: 'Username', value: user?.username ? `@${user.username}` : undefined },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value ?? <span className="text-gray-300 italic text-xs">not set</span>}</span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard">
                <button className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900">
                  Go to Dashboard
                </button>
              </Link>
              <button onClick={handleLogout} className="w-full mt-3 text-center text-red-600 text-sm hover:underline">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function DeleteConfirmPopup({ itemName, onConfirm, onCancel, warning }: {
  itemName: string; onConfirm: () => void; onCancel: () => void; warning?: string;
}) {
  const [dontAsk, setDontAsk] = useState(false);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30" onMouseDown={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4">
        <h3 className="font-bold text-base mb-1">Are you sure you want to delete?</h3>
        <p className="text-sm text-gray-500 mb-2">"{itemName}" will be removed from the list.</p>
        {warning ? (
          <p className="text-sm text-gray-900 font-bold mb-5">{warning}</p>
        ) : (
          <label className="flex items-center gap-2 text-sm mb-5 cursor-pointer select-none">
            <input type="checkbox" checked={dontAsk} onChange={e => setDontAsk(e.target.checked)} className="w-4 h-4 accent-gray-900" />
            Don't ask me again
          </label>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => {
            if (!warning && dontAsk) localStorage.setItem(DELETE_PREF_KEY, 'true');
            onConfirm();
          }} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function DeletableSelect({ value, onChange, options, onDelete, defaultLabel, defaultValue = 'all', addNewLabel, onAddNew, className = '', deleteWarning, optionGroups }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; deletable?: boolean }[];
  onDelete?: (v: string) => void;
  defaultLabel: string;
  defaultValue?: string;
  addNewLabel?: string;
  onAddNew?: () => void;
  className?: string;
  deleteWarning?: (v: string) => string | null;
  optionGroups?: { label: string; options: { value: string; label: string; deletable?: boolean }[] }[];
}) {
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ value: string; warning?: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label ?? (value === defaultValue ? defaultLabel : value);

  function requestDelete(v: string) {
    const warning = deleteWarning?.(v) ?? undefined;
    if (!warning && typeof window !== 'undefined' && localStorage.getItem(DELETE_PREF_KEY) === 'true') {
      onDelete?.(v);
      if (value === v) onChange(defaultValue);
    } else {
      setPendingDelete({ value: v, warning });
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2 border rounded-lg bg-white text-sm flex items-center gap-2 min-w-[130px]">
        <span className="flex-1 text-left truncate">{value === defaultValue ? defaultLabel : selectedLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] max-h-64 overflow-y-auto">
          <button type="button" onClick={() => { onChange(defaultValue); setOpen(false); }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${value === defaultValue ? 'font-semibold' : ''}`}>
            {defaultLabel}
          </button>
          {(optionGroups ?? [{ label: '', options }]).filter(g => g.options.length > 0).map((group, gi) => (
            <div key={group.label || gi}>
              {group.label && (
                <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-t border-gray-100">
                  {group.label}
                </div>
              )}
              {group.options.map(opt => (
                <div key={opt.value} className="flex items-center hover:bg-gray-50">
                  {opt.deletable && onDelete ? (
                    <button type="button" onClick={(e) => { e.stopPropagation(); requestDelete(opt.value); }}
                      className="pl-3 pr-2 py-2 text-gray-300 hover:text-red-500 transition-colors text-base leading-none flex-shrink-0 font-bold">−</button>
                  ) : (
                    <span className="pl-4" />
                  )}
                  <button type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`flex-1 pr-4 py-2 text-left text-sm transition-colors ${value === opt.value ? 'font-semibold' : ''}`}>
                    {opt.label}
                  </button>
                </div>
              ))}
            </div>
          ))}
          {addNewLabel && onAddNew && (
            <button type="button" onClick={() => { onAddNew(); setOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-gray-50 border-t border-gray-100 transition-colors">
              {addNewLabel}
            </button>
          )}
        </div>
      )}
      {pendingDelete && (
        <DeleteConfirmPopup
          itemName={pendingDelete.value}
          warning={pendingDelete.warning}
          onConfirm={() => { onDelete?.(pendingDelete.value); if (value === pendingDelete.value) onChange(defaultValue); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

function EditFiltersPopup({
  cities, categories, tags,
  customCities, customCategories, customTags,
  onDeleteCity, onDeleteCategory, onDeleteTag,
  onAddCity, onAddCategory, onAddTag,
  onSave, onClose, mobileTop,
}: {
  cities: string[]; categories: string[]; tags: string[];
  customCities: string[]; customCategories: string[]; customTags: string[];
  onDeleteCity: (v: string) => void; onDeleteCategory: (v: string) => void; onDeleteTag: (v: string) => void;
  onAddCity: (v: string) => void; onAddCategory: (v: string) => void; onAddTag: (v: string) => void;
  onSave: (cities: string[], categories: string[], tags: string[]) => void;
  onClose: () => void;
  mobileTop?: number;
}) {
  const [localCities, setLocalCities] = useState([...cities]);
  const [localCategories, setLocalCategories] = useState([...categories]);
  const [localTags, setLocalTags] = useState([...tags]);
  const [pendingDelete, setPendingDelete] = useState<{ section: 'city' | 'cat' | 'tag'; value: string } | null>(null);
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [addVal, setAddVal] = useState('');
  const [sortDirs, setSortDirs] = useState<Record<string, 'asc' | 'desc'>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { onSave(localCities, localCategories, localTags); onClose(); }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [localCities, localCategories, localTags, onSave, onClose]);

  function doDelete(section: 'city' | 'cat' | 'tag', value: string) {
    if (section === 'city') { setLocalCities(p => p.filter(x => x !== value)); onDeleteCity(value); }
    if (section === 'cat') { setLocalCategories(p => p.filter(x => x !== value)); onDeleteCategory(value); }
    if (section === 'tag') { setLocalTags(p => p.filter(x => x !== value)); onDeleteTag(value); }
  }

  function commitAdd() {
    const v = addVal.trim(); if (!v || !showAdd) return;
    if (showAdd === 'city') { onAddCity(v); setLocalCities(p => [...p, v]); }
    if (showAdd === 'cat') { onAddCategory(v); setLocalCategories(p => [...p, v]); }
    if (showAdd === 'tag') { onAddTag(v); setLocalTags(p => [...p, v]); }
    setAddVal(''); setShowAdd(null);
  }

  function toggleSort(key: string, arr: string[], setter: (v: string[]) => void) {
    const next = sortDirs[key] === 'asc' ? 'desc' : 'asc';
    setSortDirs(prev => ({ ...prev, [key]: next }));
    setter([...arr].sort((a, b) => next === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
  }

  function SortIcon({ dir }: { dir?: 'asc' | 'desc' }) {
    if (dir === 'asc') return <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 3 18 9"/><line x1="12" y1="3" x2="12" y2="21"/></svg>;
    if (dir === 'desc') return <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 21 18 15"/><line x1="12" y1="21" x2="12" y2="3"/></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 3 18 9"/><polyline points="6 15 12 21 18 15"/></svg>;
  }

  function PillSection({ title, items, section, addPlaceholder, sortKey }: {
    title: string; items: string[]; section: 'city' | 'cat' | 'tag'; addPlaceholder: string; sortKey: string;
  }) {
    const dir = sortDirs[sortKey];
    const isCollapsed = collapsed[section];
    const arr = section === 'city' ? localCities : section === 'cat' ? localCategories : localTags;
    const setter = section === 'city' ? setLocalCities : section === 'cat' ? setLocalCategories : setLocalTags;
    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center gap-1.5 mb-2">
          <button type="button" onClick={() => setCollapsed(p => ({ ...p, [section]: !p[section] }))}
            className="text-gray-400 hover:text-gray-700 text-xs font-bold w-3 text-left">{isCollapsed ? '>' : '˅'}</button>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}{isCollapsed ? '…' : ''}</p>
          {!isCollapsed && <>
            <button type="button" onClick={() => toggleSort(sortKey, arr, setter)}
              className="text-gray-300 hover:text-gray-600 transition-colors"><SortIcon dir={dir} /></button>
            <button type="button" onClick={() => { setShowAdd(section); setAddVal(''); }}
              className="text-xs text-gray-400 hover:text-gray-700">Add +</button>
          </>}
        </div>
        {!isCollapsed && <>
          <div className="flex flex-wrap gap-2 mb-2">
            {items.map(item => (
              <div key={item} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-white border-gray-200 hover:border-gray-400">
                <span>{item}</span>
                <button type="button" onClick={() => {
                  if (typeof window !== 'undefined' && localStorage.getItem(DELETE_PREF_KEY) === 'true') doDelete(section, item);
                  else setPendingDelete({ section, value: item });
                }} className="text-gray-300 hover:text-red-500 transition-colors leading-none ml-0.5">×</button>
              </div>
            ))}
          </div>
          {showAdd === section && (
            <div className="flex gap-2 mb-2">
              <input autoFocus value={addVal} onChange={e => setAddVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') { setShowAdd(null); setAddVal(''); } }}
                placeholder={addPlaceholder}
                className="flex-1 px-2.5 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-[#42a746] focus:border-transparent" />
              <button type="button" onClick={commitAdd} className="px-2.5 py-1 border-2 border-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-50">Add</button>
              <button type="button" onClick={() => { setShowAdd(null); setAddVal(''); }} className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </>}
      </div>
    );
  }

  return (
    <div ref={ref}
      className="fixed left-1/2 -translate-x-1/2 w-[90vw] max-h-[70vh] overflow-y-auto sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-11 sm:w-[360px] sm:max-h-[calc(100vh-5rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4"
      style={typeof window !== 'undefined' && window.innerWidth < 640 && mobileTop ? { top: mobileTop } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Edit Filters</h3>
      </div>
      <PillSection title="Cities" items={localCities} section="city" addPlaceholder="City, State (e.g. Orlando, FL)" sortKey="city" />
      <PillSection title="Categories" items={localCategories} section="cat" addPlaceholder="e.g. Charity" sortKey="cat" />
      <PillSection title="Tags" items={localTags} section="tag" addPlaceholder="e.g. Outdoor" sortKey="tag" />
      {pendingDelete && (
        <DeleteConfirmPopup
          itemName={pendingDelete.value}
          onConfirm={() => { doDelete(pendingDelete.section, pendingDelete.value); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Invite Panel ────────────────────────────────────────────────────────────

interface RsvpFormConfig {
  formName: string;
  hostedBy: string;
  nameFieldLabel: string;
  confirmationHeader: string;
  confirmationSubheader: string;
  confirmationSignature: string;
  fields: { id: string; label: string; required: boolean; type?: string; options?: string[] }[];
  createdAt: string;
}

const RSVP_FORM_KEY = (eventId: string) => `lokeet_portal_rsvp_form_${eventId}`;

type InviteView = 'choose' | 'public-form' | 'direct';

function InvitePanel({ event, onClose, displayName }: { event: PortalEvent; onClose: () => void; displayName: string }) {
  const [view, setView] = useState<InviteView>('choose');

  const closeIcon = (
    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 ml-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );

  const backBtn = (label: string) => (
    <button type="button" onClick={() => setView('choose')}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0 flex-1">
            {view !== 'choose' && <div className="mb-1">{backBtn('Invite Options')}</div>}
            <h2 className="text-lg font-bold">
              {view === 'choose' && 'Invite People'}
              {view === 'public-form' && 'Public Intake Form'}
              {view === 'direct' && 'Email or Text'}
            </h2>
            <p className="text-sm text-gray-500 truncate">{event.name || 'Untitled'}</p>
          </div>
          {closeIcon}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Choose view ── */}
          {view === 'choose' && (
            <div className="space-y-4">
              {/* Event summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <p className="font-semibold text-gray-900 mb-1">{event.name || 'Untitled'}</p>
                {event.date && (
                  <div className="flex items-center gap-1.5 text-sm text-[#42a746] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                )}
                {event.city && <p className="text-sm text-gray-500 mt-1">{event.city}</p>}
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Choose how to invite</p>

              {/* Public form card */}
              <button
                type="button"
                onClick={() => setView('public-form')}
                className="w-full text-left bg-white border-2 border-gray-900 rounded-2xl p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 mb-1">Public Intake Form</p>
                    <p className="text-sm text-gray-500 leading-snug">Build a signup form for this event and share a link — anyone can fill it out to request an invite.</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0 mt-1">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>

              {/* Direct invite card — Coming Soon */}
              <button
                type="button"
                onClick={() => setView('direct')}
                className="w-full text-left bg-white border-2 border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-colors relative"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-500">Email or Text</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-400 uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-snug">Send direct invitations to specific people by email or SMS.</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0 mt-1">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* ── Public Form view ── */}
          {view === 'public-form' && (
            <PublicFormBuilder event={event} displayName={displayName} />
          )}

          {/* ── Direct / Coming Soon view ── */}
          {view === 'direct' && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Direct email and text invitations are on the way. For now, use the public invite form to let people sign up.</p>
              </div>
              <button
                type="button"
                onClick={() => setView('public-form')}
                className="px-6 py-2.5 rounded-full border-2 border-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Use Public Form Instead
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Public Form Builder ──────────────────────────────────────────────────────

function PublicFormBuilder({ event, displayName }: { event: PortalEvent; displayName: string }) {
  const storageKey = RSVP_FORM_KEY(event.id);

  const loadSaved = (): RsvpFormConfig | null => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  };

  const init = loadSaved();

  const [saved, setSaved] = useState<RsvpFormConfig | null>(init);
  const [editing, setEditing] = useState<boolean>(init === null);
  const [formName, setFormName] = useState(init?.formName ?? event.name ?? '');
  const [hostedBy, setHostedBy] = useState(init?.hostedBy ?? displayName);
  const [nameFieldLabel, setNameFieldLabel] = useState(init?.nameFieldLabel ?? 'Full Name');
  const [confirmationHeader, setConfirmationHeader] = useState(init?.confirmationHeader ?? "You're on the list!");
  const [confirmationSubheader, setConfirmationSubheader] = useState(init?.confirmationSubheader ?? "Thank you for your interest! We'll be in touch soon.");
  const [confirmationSignature, setConfirmationSignature] = useState(init?.confirmationSignature ?? (displayName ? `Hosted by ${displayName}` : ''));
  const [builderStep, setBuilderStep] = useState<'fields' | 'confirmation'>('fields');
  const [editingNameLabel, setEditingNameLabel] = useState(false);
  const [customFields, setCustomFields] = useState<{ id: string; label: string; required: boolean; type: string; options?: string[] }[]>(
    init?.fields.filter(f => !['name', 'email', 'hosted_by'].includes(f.id)).map(f => ({ ...f, type: f.type ?? 'text' })) ?? []
  );
  const [showingResponses, setShowingResponses] = useState(false);
  const [addingField, setAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState(['Yes', 'No']);
  const [newOptionDraft, setNewOptionDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const nameLabelRef = useRef<HTMLInputElement>(null);

  const formLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://lokeet.io'}/rsvp/${event.id}`;

  function saveForm() {
    const config: RsvpFormConfig = {
      formName,
      hostedBy,
      nameFieldLabel,
      confirmationHeader,
      confirmationSubheader,
      confirmationSignature,
      fields: [
        { id: 'name',      label: nameFieldLabel, required: false },
        { id: 'email',     label: 'Email',        required: true  },
        { id: 'hosted_by', label: 'Hosted By',    required: false },
        ...customFields,
      ],
      createdAt: init?.createdAt ?? new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(config));
    setSaved(config);
    setEditing(false);
  }

  const FIELD_TYPES = [
    { type: 'text',      label: 'Short Answer', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
    { type: 'paragraph', label: 'Paragraph',    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="15" y2="18"/></svg> },
    { type: 'number',    label: 'Number',       icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg> },
    { type: 'phone',     label: 'Phone',        icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 5.45 5.45l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
    { type: 'radio',     label: 'Multiple Choice', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg> },
    { type: 'checkbox',  label: 'Checkboxes',   icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { type: 'select',    label: 'Dropdown',     icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="8 10 12 14 16 10"/></svg> },
    { type: 'date',      label: 'Date',         icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ];

  const needsOptions = (t: string) => ['radio', 'checkbox', 'select'].includes(t);

  function commitAddField() {
    const label = newFieldLabel.trim();
    if (!label) return;
    const options = needsOptions(newFieldType) ? newFieldOptions.filter(o => o.trim()) : undefined;
    setCustomFields(p => [...p, { id: `cf_${Date.now()}`, label, required: false, type: newFieldType, ...(options ? { options } : {}) }]);
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions(['Yes', 'No']);
    setNewOptionDraft('');
    setAddingField(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(formLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Live view (after saving) ──
  if (saved && !editing) {
    // ── Responses sub-view ──
    if (showingResponses) {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`lokeet_portal_rsvp_responses_${event.id}`) : null;
      const responses: Record<string, string>[] = raw ? JSON.parse(raw) : [];
      const visibleFields = saved.fields.filter(f => f.id !== 'hosted_by');

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowingResponses(false)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <span className="text-xs text-gray-400">{responses.length} {responses.length === 1 ? 'response' : 'responses'}</span>
          </div>

          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <p className="text-sm text-gray-500">No responses yet.<br />Share your invite link to get signups.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-400">#{responses.length - i}</span>
                    <span className="text-xs text-gray-400">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  {visibleFields.map(f => {
                    const val = r[f.id];
                    if (!val) return null;
                    const display = val.includes('||') ? val.split('||').join(', ') : val;
                    return (
                      <div key={f.id}>
                        <p className="text-xs text-gray-400">{f.label}</p>
                        <p className="text-sm text-gray-800 font-medium">{display}</p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── Form overview sub-view ──
    return (
      <div className="space-y-6">
        <div className="bg-[#42a746]/10 border border-[#42a746]/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#42a746] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{saved.formName || 'Your form'} is live</p>
            <p className="text-xs text-gray-600 mt-0.5">Hosted by {saved.hostedBy || 'you'} · Share the link below.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Invite Link</label>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 truncate font-mono">{formLink}</div>
            <button type="button" onClick={copyLink}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${copied ? 'border-[#42a746] text-[#42a746] bg-[#42a746]/5' : 'border-gray-900 hover:bg-gray-50'}`}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Form Fields</label>
          <div className="space-y-2">
            {saved.fields.map(f => (
              <div key={f.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-800">{f.label}</span>
                {f.required
                  ? <span className="text-xs text-gray-400">Required</span>
                  : <span className="text-xs text-gray-300">Optional</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { setBuilderStep('fields'); setEditing(true); }}
            className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Edit Form</button>
          <button type="button" onClick={() => setShowingResponses(true)}
            className="flex-1 py-2.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            View Responses
          </button>
        </div>
      </div>
    );
  }

  // ── Builder view — Step 1: Fields ──
  if (builderStep === 'fields') {
    return (
      <div className="space-y-5">
        <p className="text-sm text-gray-500">Build the form people will fill out to request an invite.</p>

        {/* Form Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Form Name</label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. RSVP for Summer Market"
            className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
          />
        </div>

        {/* Hosted By */}
        <div>
          <label className="block text-sm font-medium mb-1">Hosted By</label>
          <input
            type="text"
            value={hostedBy}
            onChange={e => setHostedBy(e.target.value)}
            placeholder="Your name or organization"
            className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
          />
        </div>

        {/* Default Fields */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Default Fields</label>
          <div className="space-y-2">
            {/* Name field — editable label, not required */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              {editingNameLabel ? (
                <input
                  ref={nameLabelRef}
                  autoFocus
                  type="text"
                  value={nameFieldLabel}
                  onChange={e => setNameFieldLabel(e.target.value)}
                  onBlur={() => setEditingNameLabel(false)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingNameLabel(false); }}
                  className="flex-1 text-sm bg-white border rounded px-2 py-0.5 focus:ring-1 focus:ring-[#42a746] focus:border-transparent"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingNameLabel(true)}
                  className="flex-1 text-left text-sm text-gray-800 flex items-center gap-1.5 group"
                  title="Click to rename"
                >
                  {nameFieldLabel}
                  <Pencil className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              )}
              <span className="text-xs text-gray-300 flex-shrink-0">Optional</span>
            </div>

            {/* Email — required, locked */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm text-gray-800">Email</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Required
              </span>
            </div>
          </div>
        </div>

        {/* Custom questions */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Custom Questions</label>

          {/* Existing fields */}
          <div className="space-y-2 mb-3">
            {customFields.length === 0 && !addingField && (
              <p className="text-sm text-gray-400 italic px-1">No custom questions yet.</p>
            )}
            {customFields.map((f, i) => {
              const typeMeta = FIELD_TYPES.find(t => t.type === f.type);
              return (
                <div key={f.id} className="flex items-center gap-2 px-3 py-2.5 bg-white border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800">{f.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{typeMeta?.label ?? 'Short Answer'}</span>
                    {f.options && f.options.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{f.options.join(' · ')}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => setCustomFields(p => p.filter((_, idx) => idx !== i))}
                    className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none font-bold flex-shrink-0">×</button>
                </div>
              );
            })}
          </div>

          {/* Add question form */}
          {addingField ? (
            <div className="border-2 border-gray-900 rounded-xl p-4 space-y-4">

              {/* Type picker */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Field Type</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {FIELD_TYPES.map(ft => (
                    <button
                      key={ft.type}
                      type="button"
                      onClick={() => setNewFieldType(ft.type)}
                      className={`flex flex-col items-center gap-1 px-1 py-2 rounded-lg border text-center transition-colors ${newFieldType === ft.type ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}
                    >
                      {ft.icon}
                      <span className="text-[10px] leading-tight font-medium">{ft.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Question</p>
                <input
                  autoFocus
                  type="text"
                  value={newFieldLabel}
                  onChange={e => setNewFieldLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !needsOptions(newFieldType)) { e.preventDefault(); commitAddField(); } }}
                  placeholder="e.g. Dietary restrictions"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                />
              </div>

              {/* Options (for radio / checkbox / select) */}
              {needsOptions(newFieldType) && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Options</p>
                  <div className="space-y-1.5 mb-2">
                    {newFieldOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">{opt}</span>
                        <button type="button" onClick={() => setNewFieldOptions(p => p.filter((_, idx) => idx !== i))}
                          className="text-gray-300 hover:text-red-500 transition-colors leading-none text-base font-bold">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOptionDraft}
                      onChange={e => setNewOptionDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const v = newOptionDraft.trim();
                          if (v) { setNewFieldOptions(p => [...p, v]); setNewOptionDraft(''); }
                        }
                      }}
                      placeholder="Add option…"
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-1 focus:ring-[#42a746] focus:border-transparent"
                    />
                    <button type="button"
                      onClick={() => { const v = newOptionDraft.trim(); if (v) { setNewFieldOptions(p => [...p, v]); setNewOptionDraft(''); } }}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">Add</button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setAddingField(false); setNewFieldLabel(''); setNewFieldType('text'); setNewFieldOptions(['Yes', 'No']); setNewOptionDraft(''); }}
                  className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="button" onClick={commitAddField} disabled={!newFieldLabel.trim()}
                  className="flex-1 py-2 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40">
                  Add Question
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setAddingField(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Add Question
            </button>
          )}
        </div>

        {/* Next */}
        <div className="flex gap-3 pt-2">
          {saved && (
            <button type="button" onClick={() => setEditing(false)}
              className="flex-1 py-3 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          )}
          <button type="button" onClick={() => setBuilderStep('confirmation')}
            className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 flex items-center justify-center gap-2">
            Next, Confirmation Message
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ── Builder view — Step 2: Confirmation Page ──
  return (
    <div className="space-y-5">
      {/* Back */}
      <button type="button" onClick={() => setBuilderStep('fields')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Form Fields
      </button>

      <div>
        <h3 className="text-base font-semibold mb-1">Confirmation Page</h3>
        <p className="text-sm text-gray-500">What guests see after they submit. All fields are editable.</p>
      </div>

      {/* Header */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Header</label>
        <input
          autoFocus
          type="text"
          value={confirmationHeader}
          onChange={e => setConfirmationHeader(e.target.value)}
          placeholder="You're on the list!"
          className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
        />
      </div>

      {/* Subheader */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subheader</label>
        <textarea
          value={confirmationSubheader}
          onChange={e => setConfirmationSubheader(e.target.value)}
          rows={3}
          placeholder="Thank you for your interest! We'll be in touch soon."
          className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent resize-none"
        />
      </div>

      {/* Signature — read-only */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Signature</label>
        <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600">
          {confirmationSignature || `Hosted by ${hostedBy || 'you'}`}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setBuilderStep('fields')}
          className="flex-1 py-3 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Back</button>
        <button type="button" onClick={saveForm}
          className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900">
          {saved ? 'Save Changes' : 'Create Form'}
        </button>
      </div>
    </div>
  );
}

// ─── New Event Modal ──────────────────────────────────────────────────────────

function NewEventModal({ onClose, onSave, existingEvent, sharedCategories, sharedTags, customCategories, customTags, onAddCategory, onDeleteCategory, onAddTag, onDeleteTag, tagsByCategory }: {
  onClose: () => void;
  onSave: (evt: Omit<PortalEvent, 'id' | 'created_at'>) => void;
  existingEvent?: PortalEvent;
  sharedCategories: string[];
  sharedTags: string[];
  customCategories: string[];
  customTags: string[];
  onAddCategory: (v: string) => void;
  onDeleteCategory: (v: string) => void;
  onAddTag: (v: string) => void;
  onDeleteTag: (v: string) => void;
  tagsByCategory: Record<string, string[]>;
}) {
  const [form, setForm] = useState<EventFormData>({
    name: existingEvent?.name || '',
    address: existingEvent?.address || '',
    city: existingEvent?.city || '',
    state: existingEvent?.state || '',
    date: existingEvent?.date || '',
    recurring: 'none',
    recurInterval: 1,
    recurFreq: 'week',
    category: existingEvent?.category || '',
    tags: existingEvent?.tags || [],
  });
  const [saving, setSaving] = useState(false);
  const [showFormCategoryInput, setShowFormCategoryInput] = useState(false);
  const [showFormTagInput, setShowFormTagInput] = useState(false);
  const [newFormCategoryInput, setNewFormCategoryInput] = useState('');
  const [newFormTagInput, setNewFormTagInput] = useState('');

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }

  const availableTagsForForm = (() => {
    const base = form.category && tagsByCategory[form.category]
      ? tagsByCategory[form.category]
      : Array.from(new Set([...STATIC_TAGS, ...sharedTags]));
    return Array.from(new Set([...base, ...customTags]));
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    onSave({
      name: form.name,
      address: form.address,
      city: form.city,
      state: form.state,
      date: form.date,
      recurring: form.recurring === 'custom'
        ? `Every ${form.recurInterval} ${form.recurFreq}${form.recurInterval !== 1 ? 's' : ''}`
        : form.recurring,
      category: form.category || undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold">{existingEvent ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <RadarAddressInput
                value={form.address}
                onChange={(raw) => setForm(f => ({ ...f, address: raw }))}
                onSelect={(result) => {
                  const cityStr = result.city ? `${result.city}${result.stateCode ? `, ${result.stateCode}` : ''}` : '';
                  setForm(f => ({
                    ...f,
                    address: result.formattedAddress,
                    name: f.name || result.placeLabel || '',
                    city: cityStr || f.city,
                    state: result.stateCode || f.state,
                  }));
                }}
                placeholder="Enter name or address to search"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                placeholder="Event or venue name" />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input type="text" value={form.city}
                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                placeholder="e.g. St. Pete, FL" />
            </div>

            {/* Category + Tags */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <label className="block text-sm font-medium">Category</label>
                <DeletableSelect
                  value={form.category}
                  onChange={(v) => setForm(f => ({ ...f, category: v, tags: [] }))}
                  defaultLabel="Select…"
                  defaultValue=""
                  options={sharedCategories.map(c => ({ value: c, label: c, deletable: customCategories.includes(c) }))}
                  onDelete={(v) => { onDeleteCategory(v); if (form.category === v) setForm(f => ({ ...f, category: '', tags: [] })); }}
                  addNewLabel="+ Add new…"
                  onAddNew={() => setShowFormCategoryInput(true)}
                  className="w-full"
                />
                {showFormCategoryInput && (
                  <div className="flex gap-2">
                    <input type="text" value={newFormCategoryInput} onChange={e => setNewFormCategoryInput(e.target.value)}
                      placeholder="e.g. Charity"
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                    <button type="button" onClick={() => {
                      const v = newFormCategoryInput.trim();
                      if (v) { onAddCategory(v); setForm(f => ({ ...f, category: v, tags: [] })); setNewFormCategoryInput(''); }
                      setShowFormCategoryInput(false);
                    }} className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                    <button type="button" onClick={() => { setShowFormCategoryInput(false); setNewFormCategoryInput(''); }}
                      className="px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <label className="block text-sm font-medium">Tags</label>
                <DeletableSelect
                  value=""
                  onChange={(v) => { if (v) toggleTag(v); }}
                  defaultLabel="Select…"
                  defaultValue=""
                  options={availableTagsForForm.filter(t => !form.tags.includes(t)).map(t => ({ value: t, label: t, deletable: customTags.includes(t) }))}
                  optionGroups={(() => {
                    const cat = form.category;
                    const suggested = cat && tagsByCategory[cat] ? tagsByCategory[cat] : [];
                    const available = availableTagsForForm.filter(t => !form.tags.includes(t));
                    if (!suggested.length) return undefined;
                    const suggestedOpts = available.filter(t => suggested.includes(t)).map(t => ({ value: t, label: t, deletable: customTags.includes(t) }));
                    const otherOpts = available.filter(t => !suggested.includes(t)).map(t => ({ value: t, label: t, deletable: customTags.includes(t) }));
                    return [
                      { label: `Suggested for ${cat}`, options: suggestedOpts },
                      { label: 'All Tags', options: otherOpts },
                    ];
                  })()}
                  onDelete={(v) => { onDeleteTag(v); if (form.tags.includes(v)) toggleTag(v); }}
                  addNewLabel="+ Add new tag…"
                  onAddNew={() => setShowFormTagInput(true)}
                  className="w-full"
                />
                {showFormTagInput && (
                  <div className="flex gap-2">
                    <input type="text" value={newFormTagInput} onChange={e => setNewFormTagInput(e.target.value)}
                      placeholder="e.g. Outdoor"
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                    <button type="button" onClick={() => {
                      const v = newFormTagInput.trim();
                      if (v) { onAddTag(v); toggleTag(v); setNewFormTagInput(''); }
                      setShowFormTagInput(false);
                    }} className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                    <button type="button" onClick={() => { setShowFormTagInput(false); setNewFormTagInput(''); }}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                )}
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)}
                        className="px-3 py-1 rounded-full text-xs border border-gray-900 bg-gray-100 font-semibold flex items-center gap-1 hover:bg-red-50 hover:border-red-300 transition-colors">
                        {tag} <span className="text-gray-400">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date + Recurring */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Date</label>
                <DateRangePicker
                  startDate={form.date}
                  endDate=""
                  onChange={(start) => setForm(f => ({ ...f, date: start }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Recurring</label>
                <select value={form.recurring}
                  onChange={(e) => setForm(f => ({ ...f, recurring: e.target.value as EventFormData['recurring'] }))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent">
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly on {form.date ? new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : 'same day'}</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                  <option value="weekdays">Every weekday (Mon–Fri)</option>
                  <option value="custom">Custom…</option>
                </select>
              </div>
            </div>

            {form.recurring === 'custom' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Every</span>
                <input type="number" min={1} max={99} value={form.recurInterval}
                  onChange={(e) => setForm(f => ({ ...f, recurInterval: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-16 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent text-center" />
                <select value={form.recurFreq}
                  onChange={(e) => setForm(f => ({ ...f, recurFreq: e.target.value as EventFormData['recurFreq'] }))}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent">
                  <option value="day">{form.recurInterval === 1 ? 'Day' : 'Days'}</option>
                  <option value="week">{form.recurInterval === 1 ? 'Week' : 'Weeks'}</option>
                  <option value="month">{form.recurInterval === 1 ? 'Month' : 'Months'}</option>
                  <option value="year">{form.recurInterval === 1 ? 'Year' : 'Years'}</option>
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 disabled:opacity-50">
                {saving ? 'Saving...' : existingEvent ? 'Save Changes' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
