'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, Save, User } from '@/lib/api';
import Link from 'next/link';
import { Pencil, Calendar } from 'lucide-react';
import { RadarAddressInput } from '@/components/ui/radar-address-input';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [customCities, setCustomCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'name'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showNavMenu, setShowNavMenu] = useState(false);
  useEffect(() => { setShowNavMenu(sessionStorage.getItem('lokeet_nav_open') === 'true'); }, []);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const editFiltersWrapRef = useRef<HTMLDivElement>(null);
  const [dateMenuTop, setDateMenuTop] = useState(0);
  const [sortMenuTop, setSortMenuTop] = useState(0);
  const [editFiltersTop, setEditFiltersTop] = useState(0);
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) setShowDateMenu(false);
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setShowSortMenu(false);
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) setShowNavMenu(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHexInput, setShowHexInput] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>(() => {
    if (typeof window === 'undefined') return '#000000';
    const stored = localStorage.getItem('lokeet_avatar_color');
    // Migrate old green default to black
    if (!stored || stored === '#42a746') {
      localStorage.setItem('lokeet_avatar_color', '#000000');
      return '#000000';
    }
    return stored;
  });
  const [activeQuickDate, setActiveQuickDate] = useState('all');

  const applyQuickDate = (value: string) => {
    setActiveQuickDate(value);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = new Date();
    if (value === 'all') {
      setDateFilter('all'); setCustomDateFrom(''); setCustomDateTo('');
    } else if (value === 'today') {
      setDateFilter('all'); setCustomDateFrom(fmt(today)); setCustomDateTo(fmt(today));
    } else if (value === 'past') {
      setDateFilter('past'); setCustomDateFrom(''); setCustomDateTo(fmt(today));
    } else if (value === 'upcoming') {
      setDateFilter('upcoming'); setCustomDateFrom(fmt(today)); setCustomDateTo('');
    } else if (value === 'weekend') {
      const day = today.getDay();
      const sat = new Date(today); sat.setDate(today.getDate() + (6 - day + 7) % 7 || 7);
      const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
      setDateFilter('all'); setCustomDateFrom(fmt(sat)); setCustomDateTo(fmt(sun));
    } else if (value === 'week') {
      const day = today.getDay();
      const mon = new Date(today); mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      setDateFilter('all'); setCustomDateFrom(fmt(mon)); setCustomDateTo(fmt(sun));
    } else if (value === 'month') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setDateFilter('all'); setCustomDateFrom(fmt(first)); setCustomDateTo(fmt(last));
    }
  };
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const toggleActiveFilter = (key: string) =>
    setActiveFilters(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const [editingCategories, setEditingCategories] = useState(false);
  const [pinnedCategories, setPinnedCategories] = useState<string[]>([]);
  const [customContentTypes, setCustomContentTypes] = useState<string[]>([]);
  const [showContentInput, setShowContentInput] = useState(false);
  const [newContentInput, setNewContentInput] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showNewSaveModal, setShowNewSaveModal] = useState(false);
  const [editingSave, setEditingSave] = useState<Save | null>(null);
  const [expandedSaves, setExpandedSaves] = useState<Set<string>>(new Set());
  const [showEditFilters, setShowEditFilters] = useState(false);
  const [managedCityOrder, setManagedCityOrder] = useState<string[]>([]);
  const [managedCategoryOrder, setManagedCategoryOrder] = useState<string[]>([]);
  const [managedTagOrder, setManagedTagOrder] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [saveCustomData, setSaveCustomData] = useState<Record<string, Record<string, string>>>({});
  const [customFieldFilters, setCustomFieldFilters] = useState<Record<string, string>>({});
  const [showCustomFieldInput, setShowCustomFieldInput] = useState<string | null>(null); // field id
  const [newCustomFieldVal, setNewCustomFieldVal] = useState('');

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

    const u = verifiedUser || null;
    setUser(u);
    if (u?.id) {
      try {
        const cf = localStorage.getItem(`lokeet_custom_fields_${u.id}`);
        if (cf) setCustomFields(JSON.parse(cf));
        const cd = localStorage.getItem(`lokeet_save_fields_${u.id}`);
        if (cd) setSaveCustomData(JSON.parse(cd));
      } catch {}
    }
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

  function getCategoryDeleteWarning(v: string): string | null {
    const count = saves.filter(s => s.event_type === v || s.category === v).length;
    return count > 0
      ? `"${v}" is assigned to ${count} save${count === 1 ? '' : 's'}. Deleting it will remove the category from those saves.`
      : null;
  }

  function handleDeleteCategory(v: string) {
    setCustomCategories(p => p.filter(x => x !== v));
    if (eventTypeFilter === v) { setEventTypeFilter('all'); setTagFilter('all'); }
    const affected = saves.filter(s => s.event_type === v || s.category === v);
    if (affected.length > 0) {
      setSaves(prev => prev.map(s =>
        (s.event_type === v || s.category === v) ? { ...s, event_type: undefined, category: undefined } : s
      ));
      affected.forEach(s => api.updateSave(s.id, { event_type: null as unknown as string, category: '' }));
    }
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

  const STATIC_CATEGORIES = ['Activities', 'Events', 'Food & Drink'];

  const CATEGORY_TAGS: Record<string, string[]> = {
    'Activities':             ['Nature', 'Outdoors', 'Sports', 'Workouts'],
    'Events':                 ['Free Events', 'Ticketed Events', 'Event Spaces', 'Meet Ups', 'Trivia'],
    'Self Care':              ['Estheticians', 'Salons', 'Massage', 'Tattoos', 'Wellness'],
    'Date Nights & Nightlife':['DJs', 'Nightlife'],
    'Food & Drink':           ['Cafes', 'Coffee', 'Tea', 'Casual Eats', 'Quick Bites', 'Restaurants', 'Dive Bars', 'Grocery', 'Catering'],
    'Lifestyle':              ['Guides', 'For Kids', 'Pet Friendly'],
    'Shopping':               ['Apparel', 'Jewelry', 'Markets', 'Souvenirs'],
  };

  const STATIC_TAGS = ['Free Events', 'Ticketed Events', 'Restaurants', 'Cafes'];

  const dynamicEventTypes = saves.map(s => s.event_type).filter(Boolean) as string[];
  const eventTypes = Array.from(new Set([...STATIC_CATEGORIES, ...dynamicEventTypes, ...customCategories])).sort();

  const saveTags = Array.from(new Set(saves.flatMap(s => s.tags || [])));
  const availableTags = (() => {
    const base = eventTypeFilter !== 'all' && CATEGORY_TAGS[eventTypeFilter]
      ? CATEGORY_TAGS[eventTypeFilter]
      : Array.from(new Set([...STATIC_TAGS, ...saveTags]));
    return Array.from(new Set([...base, ...customTags]));
  })();

  const DEFAULT_CITIES = ['St. Pete, FL', 'Tampa, FL'];
  const saveCities = Array.from(new Set(
    saves.map(s => s.city ? `${s.city}${s.state ? `, ${s.state}` : ''}` : null).filter(Boolean)
  )) as string[];
  const allCities = Array.from(new Set([...DEFAULT_CITIES, ...saveCities, ...customCities]));

  // Managed display order — respects user reordering from Edit Filters, falls back to computed
  const displayCities = managedCityOrder.length > 0 ? managedCityOrder.filter(c => allCities.includes(c)) : allCities;
  const displayCategories = managedCategoryOrder.length > 0 ? managedCategoryOrder.filter(c => eventTypes.includes(c)) : eventTypes;
  const displayTags = managedTagOrder.length > 0 ? managedTagOrder.filter(t => availableTags.includes(t)) : availableTags;

  const cityKey = (s: { city?: string; state?: string }) =>
    s.city ? `${s.city}${s.state ? `, ${s.state}` : ''}` : '';

  const matchesDateFilter = (s: Save): boolean => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const allDates = [s.event_date, s.event_end_date, ...(s.event_extra_dates || [])]
      .filter(Boolean)
      .map(d => { const dt = new Date(d!); dt.setHours(0, 0, 0, 0); return dt; });
    const inRange = (d: Date, from: Date, to: Date) => d >= from && d <= to;

    if (customDateFrom || customDateTo) {
      if (allDates.length === 0) return false;
      const from = customDateFrom ? new Date(customDateFrom + 'T00:00:00') : new Date(0);
      const to = customDateTo ? new Date(customDateTo + 'T00:00:00') : new Date(8640000000000000);
      return allDates.some(d => inRange(d, from, to));
    }
    if (dateFilter === 'all') return true;
    if (allDates.length === 0) return false;
    if (dateFilter === 'today') return allDates.some(d => d.getTime() === now.getTime());
    if (dateFilter === 'weekend') {
      const day = now.getDay();
      const sat = new Date(now); sat.setDate(now.getDate() + (6 - day));
      const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
      return allDates.some(d => d.getTime() === sat.getTime() || d.getTime() === sun.getTime());
    }
    if (dateFilter === 'week') { const end = new Date(now); end.setDate(now.getDate() + 6); return allDates.some(d => inRange(d, now, end)); }
    if (dateFilter === 'month') { const end = new Date(now); end.setDate(now.getDate() + 30); return allDates.some(d => inRange(d, now, end)); }
    if (dateFilter === 'upcoming') return allDates.some(d => d >= now);
    if (dateFilter === 'past') return allDates.some(d => d < now);
    return true;
  };

  function persistCustomFields(fields: CustomField[]) {
    setCustomFields(fields);
    if (user?.id) localStorage.setItem(`lokeet_custom_fields_${user.id}`, JSON.stringify(fields));
  }

  function persistSaveCustomData(data: Record<string, Record<string, string>>) {
    setSaveCustomData(data);
    if (user?.id) localStorage.setItem(`lokeet_save_fields_${user.id}`, JSON.stringify(data));
  }

  const tagsByCategory = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const s of saves) {
      const cat = s.event_type || s.category;
      if (cat && s.tags?.length) {
        if (!map[cat]) map[cat] = [];
        for (const t of s.tags) if (!map[cat].includes(t)) map[cat].push(t);
      }
    }
    return map;
  }, [saves]);

  const categoryByTag = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const s of saves) {
      const cat = s.event_type || s.category;
      if (cat && s.tags?.length) {
        for (const t of s.tags) {
          if (!map[t]) map[t] = [];
          if (!map[t].includes(cat)) map[t].push(cat);
        }
      }
    }
    return map;
  }, [saves]);

  const filteredSaves = saves
    .filter(s => filter === 'all' || s.category === filter)
    .filter(s => eventTypeFilter === 'all' || s.event_type === eventTypeFilter || s.category === eventTypeFilter)
    .filter(s => cityFilter === 'all' || cityKey(s) === cityFilter)
    .filter(matchesDateFilter)
    .filter(s => tagFilter === 'all' || s.tags.includes(tagFilter))
    .filter(s => Object.entries(customFieldFilters).every(([field, val]) => !val || val === 'all' || saveCustomData[s.id]?.[field] === val));

  const sortedSaves = [...filteredSaves].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'date') {
      cmp = new Date(a.event_date || a.saved_at).getTime() - new Date(b.event_date || b.saved_at).getTime();
    } else if (sortBy === 'name') {
      cmp = (a.event_name || '').localeCompare(b.event_name || '');
    } else {
      cmp = (a.event_type || '').localeCompare(b.event_type || '');
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-black/10 sticky top-0 z-30">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]">
      {/* Header */}
      <header className="bg-white border-b border-black/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold">Lokeet</Link>

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
              <button
                onClick={() => { setShowProfilePanel(true); setIsEditingProfile(false); }}
                className="text-sm hover:underline"
              >
                {user?.username ? (
                  <span className="flex items-baseline gap-1">
                    <span className="font-bold">{user.display_name || user.username}</span>
                    <span className="text-gray-400">@{user.username}</span>
                  </span>
                ) : 'Profile'}
              </button>
              <button
                onClick={() => setShowNavMenu(p => { const next = !p; sessionStorage.setItem('lokeet_nav_open', String(next)); return next; })}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Menu"
              >
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats & Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {saves.length === 0 && (
            <style>{`
              @keyframes border-pulse {
                0%, 100% { border-color: #111827; }
                50% { border-color: #42a746; }
              }
              .new-save-pulse { animation: border-pulse 1.8s ease-in-out infinite; }
            `}</style>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-2">
            {/* Row 1: dropdowns — never moves */}
            <div className="flex gap-3 flex-wrap items-center">
              <DeletableSelect
                value={cityFilter}
                onChange={setCityFilter}
                defaultLabel="All Cities"
                options={displayCities.map(c => ({ value: c, label: c, deletable: customCities.includes(c) }))}
                onDelete={(c) => { setCustomCities(p => p.filter(x => x !== c)); if (cityFilter === c) setCityFilter('all'); }}
                addNewLabel="+ Add new city…"
                onAddNew={() => { setShowCityInput(true); setShowCategoryInput(false); setShowTagInput(false); setShowCustomFieldInput(null); }}
              />
              <DeletableSelect
                value={eventTypeFilter}
                onChange={(v) => { setEventTypeFilter(v); setTagFilter('all'); }}
                defaultLabel="All Categories"
                options={displayCategories.map(t => ({ value: t, label: t, deletable: customCategories.includes(t) }))}
                onDelete={handleDeleteCategory}
                deleteWarning={getCategoryDeleteWarning}
                addNewLabel="+ Add new category…"
                onAddNew={() => { setShowCategoryInput(true); setShowCityInput(false); setShowTagInput(false); setShowCustomFieldInput(null); }}
              />
              <DeletableSelect
                value={tagFilter}
                onChange={setTagFilter}
                defaultLabel="All Tags"
                options={displayTags.map(t => ({ value: t, label: t, deletable: customTags.includes(t) }))}
                onDelete={(t) => { setCustomTags(p => p.filter(x => x !== t)); if (tagFilter === t) setTagFilter('all'); }}
                addNewLabel="+ Add new tag…"
                onAddNew={() => { setShowTagInput(true); setShowCityInput(false); setShowCategoryInput(false); setShowCustomFieldInput(null); }}
              />

              {/* Custom field filters */}
              {customFields.map(field => {
                const savedVals = Object.values(saveCustomData).map(d => d[field.name]).filter(Boolean);
                const opts = Array.from(new Set([...(field.options || []), ...savedVals]));
                return (
                  <DeletableSelect key={field.id}
                    value={customFieldFilters[field.name] || 'all'}
                    onChange={(v) => setCustomFieldFilters(prev => ({ ...prev, [field.name]: v }))}
                    defaultLabel={`All ${field.name}`}
                    options={opts.map(v => ({ value: v, label: v }))}
                    addNewLabel={`+ Add new ${field.name.toLowerCase()}…`}
                    onAddNew={() => { setShowCustomFieldInput(field.id); setNewCustomFieldVal(''); setShowCityInput(false); setShowCategoryInput(false); setShowTagInput(false); }}
                  />
                );
              })}

            {/* Calendar / date popup */}
            <div ref={dateMenuRef} className="relative">
              <button
                type="button"
                onClick={() => { if (dateMenuRef.current) setDateMenuTop(dateMenuRef.current.getBoundingClientRect().bottom + 4); setShowDateMenu(prev => !prev); setShowSortMenu(false); }}
                className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${(dateFilter !== 'all' || customDateFrom || customDateTo) ? 'border-gray-900 bg-gray-100' : ''}`}
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
                      onChange={(start, end) => {
                        setCustomDateFrom(start);
                        setCustomDateTo(end);
                        setDateFilter('all');
                        setActiveQuickDate('');
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick select</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 'today',    label: 'Today' },
                      { value: 'weekend',  label: 'This Weekend' },
                      { value: 'week',     label: 'This Week' },
                      { value: 'month',    label: 'This Month' },
                      { value: 'upcoming', label: 'Upcoming' },
                      { value: 'past',     label: 'Previous' },
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

            {/* Edit Filters icon */}
            <div ref={editFiltersWrapRef} className="relative">
              <button
                type="button"
                onClick={() => { if (editFiltersWrapRef.current) setEditFiltersTop(editFiltersWrapRef.current.getBoundingClientRect().bottom + 4); setShowEditFilters(prev => !prev); setShowDateMenu(false); setShowSortMenu(false); }}
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
                  onDeleteCategory={handleDeleteCategory}
                  getCategoryWarning={getCategoryDeleteWarning}
                  onDeleteTag={(v) => { setCustomTags(p => p.filter(x => x !== v)); if (tagFilter === v) setTagFilter('all'); }}
                  onAddCity={(v) => setCustomCities(p => [...p, v])}
                  onAddCategory={(v) => setCustomCategories(p => [...p, v])}
                  onAddTag={(v) => setCustomTags(p => [...p, v])}
                  onSave={(cities, categories, tags) => { setManagedCityOrder(cities); setManagedCategoryOrder(categories); setManagedTagOrder(tags); }}
                  onClose={() => setShowEditFilters(false)}
                  customFields={customFields}
                  onUpdateCustomFields={(fields) => persistCustomFields(fields)}
                  categoryByTag={categoryByTag}
                  mobileTop={editFiltersTop}
                />
              )}
            </div>

            {/* Sort icon */}
            <div ref={sortMenuRef} className="relative">
              <button
                type="button"
                onClick={() => { if (sortMenuRef.current) setSortMenuTop(sortMenuRef.current.getBoundingClientRect().bottom + 4); setShowSortMenu(prev => !prev); setShowDateMenu(false); }}
                className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                title="Sort & more filters"
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
                  {/* Sort by */}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sort by</p>
                  <div className="flex gap-2 mb-4">
                    {(['date', 'category', 'name'] as const).map(opt => (
                      <button key={opt} type="button" onClick={() => setSortBy(opt)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm border transition-colors ${sortBy === opt ? 'border-gray-900 bg-gray-100 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Order */}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order</p>
                  <div className="flex gap-2 mb-4">
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

            {/* New Save button — inline with filters */}
            <button
              onClick={() => setShowNewSaveModal(true)}
              className={`ml-auto flex-shrink-0 bg-white text-gray-900 font-semibold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 text-sm${saves.length === 0 ? ' new-save-pulse' : ''}`}
            >
              + New Save
            </button>
            </div>{/* end Row 1 */}

            {/* Row 2: add-new inputs — appears below without shifting Row 1 */}
            {showCityInput && (
              <div className="flex gap-2">
                <input type="text" value={newCityInput} onChange={(e) => setNewCityInput(e.target.value)}
                  placeholder="City, State (e.g. Orlando, FL)" autoFocus
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                <button type="button" onClick={() => { const v = newCityInput.trim(); if (v) { setCustomCities(p => [...p, v]); setCityFilter(v); setNewCityInput(''); } setShowCityInput(false); }}
                  className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                <button type="button" onClick={() => { setShowCityInput(false); setNewCityInput(''); }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            )}
            {showCategoryInput && (
              <div className="flex gap-2">
                <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Pets" autoFocus
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                <button type="button" onClick={() => { const v = newCategoryInput.trim(); if (v) { setCustomCategories(p => [...p, v]); setEventTypeFilter(v); setTagFilter('all'); setNewCategoryInput(''); } setShowCategoryInput(false); }}
                  className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                <button type="button" onClick={() => { setShowCategoryInput(false); setNewCategoryInput(''); }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            )}
            {showTagInput && (
              <div className="flex gap-2">
                <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="e.g. Rooftop" autoFocus
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                <button type="button" onClick={() => { const v = newTagInput.trim(); if (v) { setCustomTags(p => [...p, v]); setTagFilter(v); setNewTagInput(''); } setShowTagInput(false); }}
                  className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                <button type="button" onClick={() => { setShowTagInput(false); setNewTagInput(''); }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            )}
            {showCustomFieldInput && (() => {
              const field = customFields.find(f => f.id === showCustomFieldInput);
              if (!field) return null;
              return (
                <div className="flex gap-2">
                  <input type="text" value={newCustomFieldVal} onChange={e => setNewCustomFieldVal(e.target.value)}
                    placeholder={`e.g. ${field.name} value`} autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); const v = newCustomFieldVal.trim(); if (v) { persistCustomFields(customFields.map(f => f.id === field.id ? { ...f, options: [...(f.options || []), v] } : f)); setCustomFieldFilters(prev => ({ ...prev, [field.name]: v })); setNewCustomFieldVal(''); } setShowCustomFieldInput(null); }
                      if (e.key === 'Escape') { setShowCustomFieldInput(null); setNewCustomFieldVal(''); }
                    }}
                    className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                  <button type="button" onClick={() => { const v = newCustomFieldVal.trim(); if (v) { persistCustomFields(customFields.map(f => f.id === field.id ? { ...f, options: [...(f.options || []), v] } : f)); setCustomFieldFilters(prev => ({ ...prev, [field.name]: v })); setNewCustomFieldVal(''); } setShowCustomFieldInput(null); }}
                    className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                  <button type="button" onClick={() => { setShowCustomFieldInput(null); setNewCustomFieldVal(''); }}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
              );
            })()}
          </div>{/* end Filters flex-col */}
        </div>

        {/* Categories Preview */}
        {(() => {
          const defaultTop4 = STATIC_CATEGORIES.slice(0, 4);
          const displayed = pinnedCategories.length > 0 ? pinnedCategories : defaultTop4;
          const togglePin = (cat: string) => {
            setPinnedCategories(prev =>
              prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : prev.length < 4 ? [...prev, cat] : prev
            );
          };
          return (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">Top Categories</h2>
                <button
                  onClick={() => setEditingCategories(e => !e)}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {editingCategories ? 'Done' : 'Edit'}
                </button>
              </div>

              {editingCategories ? (
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-3">Select up to 4 categories to feature. ({pinnedCategories.length}/4 selected)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {STATIC_CATEGORIES.map(cat => {
                      const selected = pinnedCategories.includes(cat);
                      const disabled = !selected && pinnedCategories.length >= 4;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => !disabled && togglePin(cat)}
                          className={`px-3 py-2 rounded-lg text-sm border text-left transition-colors ${
                            selected
                              ? 'border-gray-900 bg-gray-100 font-semibold'
                              : disabled
                              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {selected && <span className="mr-1">✓</span>}{cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {displayed.map(cat => {
                    const count = saves.filter(s => s.event_type === cat || s.category === cat).length;
                    return (
                      <div key={cat} className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-2">{cat}</h3>
                        <p className="text-sm text-gray-600 mb-3">{count} saves</p>
                        {count > 0 ? (
                          <button
                            onClick={() => handleShareCategory(cat)}
                            className="text-sm text-gray-900 font-semibold hover:underline"
                          >
                            Share →
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-gray-900 font-semibold">Share</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span className="text-xs text-gray-400">save to share</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Saves List */}
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-xl font-bold">My Saves</h2>
          <span className="text-sm text-gray-500">{saves.length} saves</span>
        </div>
        <div className="space-y-4">
          {sortedSaves.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-xl text-gray-500 mb-4">No saves yet</p>
              <p className="text-gray-400">Add a New Save to start sharing!</p>
              <p className="text-gray-400">
                Install our{' '}
                <a
                  href="https://chromewebstore.google.com/detail/dekngoiefdiboafldkkefkpiddndnfjo?utm_source=item-share-cb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 underline hover:text-gray-600 transition-colors"
                >
                  chrome extension
                </a>
                {' '}to save directly from Instagram or TikTok
              </p>
            </div>
          ) : (
            sortedSaves.map(save => {
              const isExpanded = expandedSaves.has(save.id);
              const toggleExpand = () => setExpandedSaves(prev => {
                const next = new Set(prev);
                if (next.has(save.id)) next.delete(save.id); else next.add(save.id);
                return next;
              });
              return (
                <div key={save.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-4">
                    {/* Featured image */}
                    {save.images.length > 0 && (
                      <img
                        src={save.images[0]}
                        alt=""
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0 self-start"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      {/* City */}
                      {save.city && (
                        <p className="text-xs text-gray-400 mb-1">{save.city}{save.state ? `, ${save.state}` : ''}</p>
                      )}

                      {/* Title row with expand toggle and action buttons */}
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={toggleExpand}
                          className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                        <h3 className="text-lg font-semibold flex-1 min-w-0 truncate">
                          {save.event_name || save.venue_name || 'Saved Post'}
                        </h3>
                        <div className="flex gap-3 items-center flex-shrink-0">
                          <a
                            href={save.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 transition"
                            title="View original"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
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
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete save"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>


                      {/* Date */}
                      {formatEventDateSummary(save) && (
                        <div className="flex items-center gap-1 text-sm text-[#42a746] font-medium mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{formatEventDateSummary(save)}</span>
                        </div>
                      )}

                      {/* Author · platform · date */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        {save.author && <span>by @{save.author}</span>}
                        {save.author && <span>{save.platform}</span>}
                        <span>{new Date(save.saved_at).toLocaleDateString()}</span>
                      </div>

                      {/* Category + tag pills */}
                      {(save.event_type || save.category || save.tags.length > 0) && (
                        <div className="flex gap-2 flex-wrap">
                          {(save.event_type || save.category) && (
                            <span className="bg-[#f9f8e5] text-gray-800 text-xs px-2 py-1 rounded-full border border-black/10">
                              {save.event_type || save.category}
                            </span>
                          )}
                          {save.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-black/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Save Modal */}
      {showNewSaveModal && (
        <SaveModal
          onClose={() => setShowNewSaveModal(false)}
          onSave={async (save) => {
            const { customFieldValues, ...saveData } = save;
            const newSave = await api.createSave(saveData);
            if (!newSave) throw new Error('Failed to create save. Check your connection and try again.');
            if (customFieldValues && Object.keys(customFieldValues).length > 0) {
              persistSaveCustomData({ ...saveCustomData, [newSave.id]: customFieldValues });
            }
            setSaves([{ ...newSave, event_type: newSave.event_type ?? saveData.event_type }, ...saves]);
            setShowNewSaveModal(false);
          }}
          sharedCities={displayCities} sharedCategories={displayCategories} sharedTags={displayTags}
          customCities={customCities} customCategories={customCategories} customTags={customTags}
          onAddCity={(v) => setCustomCities(p => [...p, v])}
          onDeleteCity={(v) => setCustomCities(p => p.filter(x => x !== v))}
          onAddCategory={(v) => setCustomCategories(p => [...p, v])}
          onDeleteCategory={(v) => setCustomCategories(p => p.filter(x => x !== v))}
          onAddTag={(v) => setCustomTags(p => [...p, v])}
          onDeleteTag={(v) => setCustomTags(p => p.filter(x => x !== v))}
          customFields={customFields}
          tagsByCategory={tagsByCategory}
        />
      )}

      {/* Profile panel */}
      {showProfilePanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowProfilePanel(false)} />
          {/* Drawer */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">Profile</h2>
              <button onClick={() => setShowProfilePanel(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: avatarColor }}>
                    {(user?.display_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                  </div>
                  {isEditingProfile && (
                    <button type="button" onClick={() => setShowColorPicker(p => !p)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  {showColorPicker && isEditingProfile && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        {AVATAR_COLORS.map(color => (
                          <button key={color} type="button" onClick={() => { setAvatarColor(color); localStorage.setItem('lokeet_avatar_color', color); setShowColorPicker(false); }}
                            className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none flex-shrink-0"
                            style={{ backgroundColor: color, boxShadow: avatarColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined }}
                          />
                        ))}
                        {/* Rainbow "+" — toggles hex input */}
                        <button type="button"
                          onClick={() => setShowHexInput(p => !p)}
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 text-white text-sm font-bold"
                          style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
                        >+</button>
                      </div>
                      {showHexInput && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono">#</span>
                            <input
                              type="text"
                              value={avatarColor.replace('#', '')}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                                const hex = `#${raw}`;
                                setAvatarColor(hex);
                                if (raw.length === 6) localStorage.setItem('lokeet_avatar_color', hex);
                              }}
                              maxLength={6}
                              placeholder="42a746"
                              className="w-24 px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent font-mono uppercase"
                              autoFocus
                            />
                            <button type="button" onClick={() => setShowGradientPicker(p => !p)}
                              className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0 hover:scale-110 transition-transform"
                              style={{ backgroundColor: avatarColor }}
                            />
                          </div>
                          {showGradientPicker && (
                            <GradientPicker
                              color={avatarColor}
                              onChange={(hex) => { setAvatarColor(hex); localStorage.setItem('lokeet_avatar_color', hex); }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="font-bold text-gray-900">{user?.display_name || user?.email}</p>
                  {user?.username
                    ? <p className="text-sm text-gray-500">@{user.username}</p>
                    : <p className="text-xs text-amber-600">No username set</p>
                  }
                </div>
              </div>

              {isEditingProfile ? (
                <ProfileEditForm
                  profile={user!}
                  onSave={async (updates) => {
                    const result = await api.updateProfile(updates);
                    if (result.success) { setUser(result.user); setIsEditingProfile(false); }
                  }}
                  onCancel={() => { setIsEditingProfile(false); setShowColorPicker(false); setShowHexInput(false); setShowGradientPicker(false); }}
                />
              ) : (
                <>
                  <div className="space-y-0 mb-6 rounded-xl border border-gray-100 overflow-hidden">
                    {[
                      { label: 'Email', value: user?.email },
                      { label: 'Display name', value: user?.display_name },
                      { label: 'Username', value: user?.username ? `@${user.username}` : undefined },
                      { label: 'Zip code', value: user?.zip_code },
                      { label: 'Birthday', value: user?.birthday },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className="text-sm font-medium text-gray-900">{value ?? <span className="text-gray-300 italic text-xs">not set</span>}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-3 text-center text-red-600 text-sm hover:underline"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-black/10 py-12 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-70">Made with ❤️ for Locals</p>
        </div>
      </footer>

      {/* Edit Save Modal */}
      {editingSave && (
        <SaveModal
          existingSave={editingSave}
          onClose={() => setEditingSave(null)}
          sharedCities={displayCities} sharedCategories={displayCategories} sharedTags={displayTags}
          customCities={customCities} customCategories={customCategories} customTags={customTags}
          onAddCity={(v) => setCustomCities(p => [...p, v])}
          onDeleteCity={(v) => setCustomCities(p => p.filter(x => x !== v))}
          onAddCategory={(v) => setCustomCategories(p => [...p, v])}
          onDeleteCategory={(v) => setCustomCategories(p => p.filter(x => x !== v))}
          onAddTag={(v) => setCustomTags(p => [...p, v])}
          onDeleteTag={(v) => setCustomTags(p => p.filter(x => x !== v))}
          customFields={customFields}
          tagsByCategory={tagsByCategory}
          existingCustomData={saveCustomData[editingSave.id]}
          onSave={async (updates) => {
            const { customFieldValues, ...saveData } = updates;
            const result = await api.updateSave(editingSave.id, saveData);
            if (!result.success) throw new Error('Failed to update save. Please try again.');
            if (customFieldValues) {
              persistSaveCustomData({ ...saveCustomData, [editingSave.id]: customFieldValues });
            }
            setSaves(saves.map(s =>
              s.id === editingSave.id
                ? { ...s, ...saveData }
                : s
            ));
            setEditingSave(null);
          }}
        />
      )}
    </div>
  );
}

interface CustomField {
  id: string;
  name: string;
  options?: string[];
}

interface SaveFormData {
  platform: string;
  url: string;
  content: string;
  author: string;
  category: string;
  event_type?: string;
  city?: string;
  state?: string;
  event_name?: string;
  address?: string;
  tags?: string[];
  event_date?: string;
  event_end_date?: string;
  event_extra_dates?: string[];
  customFieldValues?: Record<string, string>;
}

// Compact label for a (possibly multi-day) event, e.g. "Feb 20–23, 2026 + 1 more".
function formatEventDateSummary(save: Save): string | null {
  if (!save.event_date) return null;
  const fmt = (s: string) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtShort = (s: string) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  let label: string | null;
  if (save.event_end_date && save.event_end_date !== save.event_date) {
    label = `${fmtShort(save.event_date)}–${fmt(save.event_end_date)}`;
  } else {
    label = fmt(save.event_date);
  }
  if (!label) return null;

  const extras = (save.event_extra_dates || []).filter(Boolean);
  if (extras.length === 1) {
    const e = fmtShort(extras[0]);
    if (e) label += ` + ${e}`;
  } else if (extras.length > 1) {
    label += ` + ${extras.length} more`;
  }
  return label;
}

// --- Color helpers ---
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: max ? Math.round((d / max) * 100) : 0, v: Math.round(max * 100) };
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100; v /= 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const [r, g, b] = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i];
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function GradientPicker({ color, onChange }: { color: string; onChange: (hex: string) => void }) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(color);
  const init = valid ? hexToHsv(color) : { h: 133, s: 60, v: 65 };
  const [h, setH] = useState(init.h);
  const [s, setS] = useState(init.s);
  const [v, setV] = useState(init.v);
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!valid) return;
    const { h: nh, s: ns, v: nv } = hexToHsv(color);
    setH(nh); setS(ns); setV(nv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const emit = (nh: number, ns: number, nv: number) => onChange(hsvToHex(nh, ns, nv));

  const onSquare = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = squareRef.current!.getBoundingClientRect();
    const ns = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
    const nv = Math.round((1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))) * 100);
    setS(ns); setV(nv); emit(h, ns, nv);
  };

  const onHue = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = hueRef.current!.getBoundingClientRect();
    const nh = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 360);
    setH(nh); emit(nh, s, v);
  };

  const hueColor = `hsl(${h},100%,50%)`;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white p-3 space-y-2">
      {/* Sat/Val square */}
      <div ref={squareRef}
        className="relative h-28 w-full rounded-lg cursor-crosshair select-none"
        style={{ background: hueColor }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onSquare(e); }}
        onPointerMove={(e) => { if (e.buttons) onSquare(e); }}
      >
        <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
        <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
        <div className="absolute w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${s}%`, top: `${100 - v}%`, backgroundColor: hsvToHex(h, s, v) }} />
      </div>
      {/* Hue bar */}
      <div ref={hueRef}
        className="relative h-3 w-full rounded-full cursor-pointer select-none"
        style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onHue(e); }}
        onPointerMove={(e) => { if (e.buttons) onHue(e); }}
      >
        <div className="absolute w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none -translate-x-1/2 -translate-y-0"
          style={{ left: `${(h / 360) * 100}%`, top: 0, backgroundColor: hueColor }} />
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  '#42a746', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
];

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

  const [saveError, setSaveError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameAvailable || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...formData, email: profile.email });
    } catch {
      setSaveError('Something went wrong. Please try again.');
    }
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
          <span className="px-3 py-3 text-gray-400 bg-gray-50 border-r text-sm">@</span>
          <input type="text" value={formData.username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
              setFormData({ ...formData, username: val });
              if (val) checkUsername(val);
            }}
            className="flex-1 px-3 py-3 focus:outline-none text-sm"
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
      {saveError && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{saveError}</div>
      )}
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

const DELETE_PREF_KEY = 'lokeet_skip_delete_confirm';

function DeleteConfirmPopup({ itemName, onConfirm, onCancel, warning }: {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  warning?: string;
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
            <input type="checkbox" checked={dontAsk} onChange={e => setDontAsk(e.target.checked)}
              className="w-4 h-4 accent-gray-900" />
            Don't ask me again
          </label>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
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
                <div className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-t border-gray-100 first:border-t-0">
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
  onSave, onClose,
  customFields, onUpdateCustomFields,
  getCategoryWarning, categoryByTag, mobileTop,
}: {
  cities: string[]; categories: string[]; tags: string[];
  customCities: string[]; customCategories: string[]; customTags: string[];
  onDeleteCity: (v: string) => void; onDeleteCategory: (v: string) => void; onDeleteTag: (v: string) => void;
  onAddCity: (v: string) => void; onAddCategory: (v: string) => void; onAddTag: (v: string) => void;
  onSave: (cities: string[], categories: string[], tags: string[]) => void;
  onClose: () => void;
  customFields: CustomField[];
  onUpdateCustomFields: (fields: CustomField[]) => void;
  getCategoryWarning?: (v: string) => string | null;
  categoryByTag?: Record<string, string[]>;
  mobileTop?: number;
}) {
  const [localCities, setLocalCities] = useState([...cities]);
  const [localCategories, setLocalCategories] = useState([...categories]);
  const [localTags, setLocalTags] = useState([...tags]);
  const [localCustomFields, setLocalCustomFields] = useState<CustomField[]>(customFields.map(f => ({ ...f, options: [...(f.options || [])] })));
  const [pendingDelete, setPendingDelete] = useState<{ section: 'city' | 'cat' | 'tag'; value: string; warning?: string } | null>(null);
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [addVal, setAddVal] = useState('');
  const [sortDirs, setSortDirs] = useState<Record<string, 'asc' | 'desc'>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { onSave(localCities, localCategories, localTags); onUpdateCustomFields(localCustomFields); onClose(); }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [localCities, localCategories, localTags, localCustomFields, onSave, onUpdateCustomFields, onClose]);


  function requestDelete(section: 'city' | 'cat' | 'tag', value: string) {
    const warning = section === 'cat' ? (getCategoryWarning?.(value) ?? undefined) : undefined;
    if (!warning && typeof window !== 'undefined' && localStorage.getItem(DELETE_PREF_KEY) === 'true') doDelete(section, value);
    else setPendingDelete({ section, value, warning });
  }

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


  function commitCfAdd(fieldId: string) {
    const v = addVal.trim(); if (!v) return;
    setLocalCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, options: [...(f.options || []), v] } : f));
    setAddVal(''); setShowAdd(null);
  }

  function deleteCfField(id: string) {
    setLocalCustomFields(prev => prev.filter(f => f.id !== id));
  }

  function deleteCfOption(fieldId: string, opt: string) {
    setLocalCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, options: (f.options || []).filter(o => o !== opt) } : f));
  }

  function CustomFieldSection({ field }: { field: CustomField }) {
    const opts = field.options || [];
    const dir = sortDirs[field.id];
    const isCollapsed = collapsed[field.id];
    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setCollapsed(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
              className="text-gray-400 hover:text-gray-700 transition-colors text-xs font-bold w-3 text-left">
              {isCollapsed ? '>' : '˅'}
            </button>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {field.name}{isCollapsed ? '…' : ''}
            </p>
            {!isCollapsed && <>
              <button type="button" title={dir === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
                onClick={() => toggleSort(field.id, opts, (sorted) => setLocalCustomFields(prev => prev.map(f => f.id === field.id ? { ...f, options: sorted } : f)))}
                className="text-gray-300 hover:text-gray-600 transition-colors">
                {dir === 'asc' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 3 18 9"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                ) : dir === 'desc' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 21 18 15"/><line x1="12" y1="21" x2="12" y2="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 3 18 9"/><polyline points="6 15 12 21 18 15"/></svg>
                )}
              </button>
              <button type="button" onClick={() => { setShowAdd(field.id); setAddVal(''); }}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Add +</button>
            </>}
          </div>
          <button type="button" onClick={() => deleteCfField(field.id)}
            className="text-xs text-gray-300 hover:text-red-500 transition-colors">× Remove field</button>
        </div>
        {!isCollapsed && <>
          <div className="flex flex-wrap gap-2 mb-2">
            {opts.map((opt) => (
              <div key={opt}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-white border-gray-200 hover:border-gray-400">
                <span>{opt}</span>
                <button type="button" onClick={() => deleteCfOption(field.id, opt)}
                  className="text-gray-300 hover:text-red-500 transition-colors leading-none ml-0.5">×</button>
              </div>
            ))}
          </div>
          {showAdd === field.id && (
            <div className="flex gap-2 mt-1">
              <input autoFocus value={addVal} onChange={e => setAddVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitCfAdd(field.id); if (e.key === 'Escape') { setShowAdd(null); setAddVal(''); } }}
                placeholder={`e.g. ${field.name} value`}
                className="flex-1 px-2.5 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-[#42a746] focus:border-transparent" />
              <button type="button" onClick={() => commitCfAdd(field.id)} className="px-2.5 py-1 border-2 border-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-50">Add</button>
              <button type="button" onClick={() => { setShowAdd(null); setAddVal(''); }} className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </>}
      </div>
    );
  }

  function PillSection({ title, items, section, addPlaceholder, onSort, sortKey, getSubtext }: {
    title: string; items: string[]; section: 'city' | 'cat' | 'tag'; addPlaceholder: string;
    onSort: () => void; sortKey: string; getSubtext?: (item: string) => string;
  }) {
    const dir = sortDirs[sortKey];
    const isCollapsed = collapsed[section];
    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center gap-1.5 mb-2">
          <button type="button" onClick={() => setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))}
            className="text-gray-400 hover:text-gray-700 transition-colors text-xs font-bold w-3 text-left">
            {isCollapsed ? '>' : '˅'}
          </button>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {title}{isCollapsed ? '…' : ''}
          </p>
          {!isCollapsed && <>
            <button type="button" onClick={onSort} title={dir === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
              className="text-gray-300 hover:text-gray-600 transition-colors">
              {dir === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 3 18 9"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
              ) : dir === 'desc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 21 18 15"/><line x1="12" y1="21" x2="12" y2="3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 3 18 9"/><polyline points="6 15 12 21 18 15"/></svg>
              )}
            </button>
            <button type="button" onClick={() => { setShowAdd(section); setAddVal(''); }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Add +</button>
          </>}
        </div>
        {!isCollapsed && <>
          <div className="flex flex-wrap gap-2 mb-2">
            {items.map((item) => {
              const sub = getSubtext?.(item);
              return (
                <div key={item}
                  className={`flex items-center gap-1.5 px-2.5 py-1 border text-xs bg-white border-gray-200 hover:border-gray-400 ${sub ? 'rounded-lg' : 'rounded-full'}`}>
                  <div className="flex flex-col min-w-0">
                    <span>{item}</span>
                    {sub && <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[110px]">{sub}</span>}
                  </div>
                  <button type="button" onClick={() => requestDelete(section, item)}
                    className="text-gray-300 hover:text-red-500 transition-colors leading-none ml-0.5 flex-shrink-0">×</button>
                </div>
              );
            })}
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
      className="fixed left-1/2 -translate-x-1/2 w-[90vw] max-h-[70vh] overflow-y-auto sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-11 sm:w-[380px] sm:max-h-[calc(100vh-5rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4"
      style={typeof window !== 'undefined' && window.innerWidth < 640 && mobileTop ? { top: mobileTop } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Edit Filters</h3>
      </div>
      <PillSection title="Cities" items={localCities} section="city" addPlaceholder="City, State (e.g. Orlando, FL)" sortKey="city" onSort={() => toggleSort('city', localCities, setLocalCities)} />
      <PillSection title="Categories" items={localCategories} section="cat" addPlaceholder="e.g. Pets" sortKey="cat" onSort={() => toggleSort('cat', localCategories, setLocalCategories)} />
      <PillSection title="Tags" items={localTags} section="tag" addPlaceholder="e.g. Rooftop" sortKey="tag" onSort={() => toggleSort('tag', localTags, setLocalTags)}
        getSubtext={categoryByTag ? (tag) => {
          const cats = categoryByTag[tag];
          if (!cats?.length) return '';
          const shown = cats.slice(0, 3).join(', ');
          return cats.length > 3 ? `${shown} +${cats.length - 3}` : shown;
        } : undefined}
      />

      {/* One section per custom field */}
      {localCustomFields.map(field => (
        <CustomFieldSection key={field.id} field={field} />
      ))}

      {/* Add custom field */}
      <div className="border-t border-gray-100 pt-3 mt-1">
        {showAdd === 'newField' ? (
          <div className="flex gap-2">
            <input autoFocus value={addVal} onChange={e => setAddVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { if (addVal.trim()) { setLocalCustomFields(p => [...p, { id: `cf_${Date.now()}`, name: addVal.trim(), options: [] }]); setAddVal(''); setShowAdd(null); } }
                if (e.key === 'Escape') { setShowAdd(null); setAddVal(''); }
              }}
              placeholder="Filter name (e.g. Content By)"
              className="flex-1 px-2.5 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-[#42a746] focus:border-transparent" />
            <button type="button" onClick={() => { if (addVal.trim()) { setLocalCustomFields(p => [...p, { id: `cf_${Date.now()}`, name: addVal.trim(), options: [] }]); setAddVal(''); } setShowAdd(null); }}
              className="px-2.5 py-1 border-2 border-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-50">Add</button>
            <button type="button" onClick={() => { setShowAdd(null); setAddVal(''); }}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => { setShowAdd('newField'); setAddVal(''); }}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors">+ Add custom filter</button>
        )}
      </div>

      {pendingDelete && (
        <DeleteConfirmPopup
          itemName={pendingDelete.value}
          warning={pendingDelete.warning}
          onConfirm={() => { doDelete(pendingDelete.section, pendingDelete.value); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

function detectFromUrl(url: string): Partial<SaveFormData> {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host === 'instagram.com') return { platform: 'instagram' };
    if (host === 'tiktok.com') {
      const m = u.pathname.match(/^\/@([^/]+)/);
      return { platform: 'tiktok', ...(m ? { author: m[1] } : {}) };
    }
  } catch {}
  return {};
}

function SaveModal({ existingSave, onClose, onSave, sharedCities = [], sharedCategories = [], sharedTags = [], customCities = [], customCategories = [], customTags = [], onAddCity, onDeleteCity, onAddCategory, onDeleteCategory, onAddTag, onDeleteTag, customFields = [], existingCustomData, tagsByCategory }: {
  existingSave?: Save;
  onClose: () => void;
  onSave: (save: SaveFormData) => Promise<void>;
  sharedCities?: string[];
  sharedCategories?: string[];
  sharedTags?: string[];
  customCities?: string[];
  customCategories?: string[];
  customTags?: string[];
  onAddCity?: (v: string) => void;
  onDeleteCity?: (v: string) => void;
  onAddCategory?: (v: string) => void;
  onDeleteCategory?: (v: string) => void;
  onAddTag?: (v: string) => void;
  onDeleteTag?: (v: string) => void;
  customFields?: CustomField[];
  existingCustomData?: Record<string, string>;
  tagsByCategory?: Record<string, string[]>;
}) {
  const [formData, setFormData] = useState<SaveFormData>({
    platform: existingSave?.platform || 'instagram',
    url: existingSave?.url || '',
    content: '',
    author: existingSave?.author || '',
    category: existingSave?.event_type || existingSave?.category || '',
    event_type: existingSave?.event_type || existingSave?.category || '',
    city: existingSave?.city || '',
    event_name: existingSave?.event_name || '',
    address: existingSave?.address || '',
    tags: existingSave?.tags || [],
    event_date: existingSave?.event_date || '',
    event_end_date: existingSave?.event_end_date || '',
    event_extra_dates: existingSave?.event_extra_dates || [],
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(existingCustomData || {});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const metaDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleUrlChange(url: string) {
    const detected = detectFromUrl(url);
    setFormData(prev => ({ ...prev, url, ...detected }));

    if (metaDebounceRef.current) clearTimeout(metaDebounceRef.current);
    metaDebounceRef.current = setTimeout(async () => {
      try { new URL(url); } catch { return; } // not a valid URL yet
      setFetchingMeta(true);
      const meta = await api.fetchMeta(url);
      setFetchingMeta(false);
      setFormData(prev => ({
        ...prev,
        ...(meta.author && !prev.author ? { author: meta.author } : {}),
      }));
    }, 800);
  }

  function toggleTag(tag: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  }

  const categoryTags: Record<string, string[]> = {
    'Activities': ['Nature', 'Outdoors', 'Sports', 'Workouts'],
    'Events': ['Free Events', 'Ticketed Events', 'Event Spaces', 'Meet Ups', 'Trivia'],
    'Self Care': ['Estheticians', 'Salons', 'Massage', 'Tattoos', 'Wellness'],
    'Date Nights & Nightlife': ['DJs', 'Nightlife'],
    'Food & Drink': ['Cafes', 'Coffee', 'Tea', 'Casual Eats', 'Quick Bites', 'Restaurants', 'Dive Bars', 'Grocery', 'Catering'],
    'Lifestyle': ['Guides', 'For Kids', 'Pet Friendly'],
    'Shopping': ['Apparel', 'Jewelry', 'Markets', 'Souvenirs'],
  };
  const FORM_CONTENT_TYPE_TAGS = ['Local (no voiceover)', 'Creator (voiceover)'];
  const availableTagsForForm = Array.from(new Set([
    ...FORM_CONTENT_TYPE_TAGS,
    ...(formData.category && categoryTags[formData.category]
      ? [...categoryTags[formData.category], ...customTags]
      : sharedTags.filter(t => !FORM_CONTENT_TYPE_TAGS.includes(t))),
  ]));

  const [showFormCityInput, setShowFormCityInput] = useState(false);
  const [newFormCityInput, setNewFormCityInput] = useState('');
  const [showFormCategoryInput, setShowFormCategoryInput] = useState(false);
  const [newFormCategoryInput, setNewFormCategoryInput] = useState('');
  const [showFormTagInput, setShowFormTagInput] = useState(false);
  const [newFormTagInput, setNewFormTagInput] = useState('');

  const [recurrence, setRecurrence] = useState({
    preset: 'none' as 'none'|'daily'|'weekly'|'monthly'|'annually'|'weekdays'|'custom',
    interval: 1,
    freq: 'week' as 'day'|'week'|'month'|'year',
    endType: 'never' as 'never'|'on'|'after',
    endDate: '',
    endCount: 13,
  });

  function computeRecurringDates(): string[] {
    const startDate = formData.event_date;
    if (!startDate || recurrence.preset === 'none') return [];
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const start = new Date(startDate + 'T12:00:00');
    const endOn = recurrence.endType === 'on' && recurrence.endDate ? new Date(recurrence.endDate + 'T23:59:59') : null;
    const maxCount = recurrence.endType === 'after' ? Math.min(recurrence.endCount, 365) : 365;
    const cap = new Date(start); cap.setFullYear(cap.getFullYear() + 2);
    const results: string[] = [];
    const cur = new Date(start);

    function advance() {
      if (recurrence.preset === 'daily') { cur.setDate(cur.getDate() + 1); }
      else if (recurrence.preset === 'weekly') { cur.setDate(cur.getDate() + 7); }
      else if (recurrence.preset === 'monthly') { cur.setMonth(cur.getMonth() + 1); }
      else if (recurrence.preset === 'annually') { cur.setFullYear(cur.getFullYear() + 1); }
      else if (recurrence.preset === 'weekdays') {
        cur.setDate(cur.getDate() + 1);
        while (cur.getDay() === 0 || cur.getDay() === 6) cur.setDate(cur.getDate() + 1);
      } else if (recurrence.preset === 'custom') {
        const n = recurrence.interval || 1;
        if (recurrence.freq === 'day') cur.setDate(cur.getDate() + n);
        else if (recurrence.freq === 'week') cur.setDate(cur.getDate() + 7 * n);
        else if (recurrence.freq === 'month') cur.setMonth(cur.getMonth() + n);
        else cur.setFullYear(cur.getFullYear() + n);
      }
    }

    advance();
    while (results.length < maxCount && cur <= cap && (!endOn || cur <= endOn)) {
      results.push(fmt(cur));
      advance();
    }
    return results;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const cleaned: SaveFormData = {
      ...formData,
      event_end_date: formData.event_end_date || undefined,
      event_extra_dates: computeRecurringDates(),
      customFieldValues: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
    };
    try {
      await onSave(cleaned);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold">{existingSave ? 'Edit Save' : 'New Save'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <RadarAddressInput
                value={formData.address || ''}
                onChange={(raw) => setFormData({ ...formData, address: raw })}
                onSelect={(result) => {
                  const cityStr = result.city
                    ? `${result.city}${result.stateCode ? `, ${result.stateCode}` : ''}`
                    : '';
                  const existingCity = cityStr
                    ? sharedCities.find(c => c.toLowerCase() === cityStr.toLowerCase())
                    : undefined;
                  if (cityStr && !existingCity) onAddCity?.(cityStr);
                  setFormData({
                    ...formData,
                    address: result.formattedAddress,
                    event_name: formData.event_name || result.placeLabel || '',
                    city: cityStr ? (existingCity ?? cityStr) : formData.city,
                    state: result.stateCode || formData.state,
                  });
                }}
                placeholder="Enter name or address to search"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.event_name || ''}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                placeholder="Name of the place or event"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium">City</label>
              <DeletableSelect
                value={formData.city || ''}
                onChange={(v) => setFormData({ ...formData, city: v === '' ? '' : v })}
                defaultLabel="Select a city…"
                defaultValue=""
                options={sharedCities.map(c => ({ value: c, label: c, deletable: customCities.includes(c) }))}
                onDelete={(v) => { onDeleteCity?.(v); if (formData.city === v) setFormData({ ...formData, city: '' }); }}
                addNewLabel="+ Add new city…"
                onAddNew={() => setShowFormCityInput(true)}
                className="w-full"
              />
              {showFormCityInput && (
                <div className="flex gap-2">
                  <input type="text" value={newFormCityInput} onChange={(e) => setNewFormCityInput(e.target.value)}
                    placeholder="City, State (e.g. Orlando, FL)"
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                  <button type="button" onClick={() => {
                    const v = newFormCityInput.trim();
                    if (v) { onAddCity?.(v); setFormData({ ...formData, city: v }); setNewFormCityInput(''); }
                    setShowFormCityInput(false);
                  }} className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                  <button type="button" onClick={() => { setShowFormCityInput(false); setNewFormCityInput(''); }}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
              )}
            </div>

            {/* Category + Tags */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <label className="block text-sm font-medium">Category</label>
                <DeletableSelect
                  value={formData.category}
                  onChange={(v) => setFormData({ ...formData, category: v, event_type: v || undefined, tags: [] })}
                  defaultLabel="Select…"
                  defaultValue=""
                  options={sharedCategories.map(c => ({ value: c, label: c, deletable: customCategories.includes(c) }))}
                  onDelete={(v) => { onDeleteCategory?.(v); if (formData.category === v) setFormData({ ...formData, category: '', event_type: undefined, tags: [] }); }}
                  addNewLabel="+ Add new…"
                  onAddNew={() => setShowFormCategoryInput(true)}
                  className="w-full"
                />
                {showFormCategoryInput && (
                  <div className="flex gap-2">
                    <input type="text" value={newFormCategoryInput} onChange={(e) => setNewFormCategoryInput(e.target.value)}
                      placeholder="e.g. Pets"
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                    <button type="button" onClick={() => {
                      const v = newFormCategoryInput.trim();
                      if (v) { onAddCategory?.(v); setFormData({ ...formData, category: v, tags: [] }); setNewFormCategoryInput(''); }
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
                  options={availableTagsForForm.filter(t => !formData.tags?.includes(t)).map(t => ({ value: t, label: t, deletable: customTags.includes(t) }))}
                  optionGroups={(() => {
                    const cat = formData.category;
                    const suggested = cat && tagsByCategory?.[cat] ? tagsByCategory[cat] : [];
                    const available = availableTagsForForm.filter(t => !formData.tags?.includes(t));
                    if (!suggested.length) return undefined;
                    const suggestedOpts = available.filter(t => suggested.includes(t)).map(t => ({ value: t, label: t, deletable: customTags.includes(t) }));
                    const otherOpts = available.filter(t => !suggested.includes(t)).map(t => ({ value: t, label: t, deletable: customTags.includes(t) }));
                    return [
                      { label: `Suggested for ${cat}`, options: suggestedOpts },
                      { label: 'All Tags', options: otherOpts },
                    ];
                  })()}
                  onDelete={(v) => { onDeleteTag?.(v); toggleTag(v); }}
                  addNewLabel="+ Add new tag…"
                  onAddNew={() => setShowFormTagInput(true)}
                  className="w-full"
                />
                {showFormTagInput && (
                  <div className="flex gap-2">
                    <input type="text" value={newFormTagInput} onChange={(e) => setNewFormTagInput(e.target.value)}
                      placeholder="e.g. Rooftop"
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                    <button type="button" onClick={() => {
                      const v = newFormTagInput.trim();
                      if (v) { onAddTag?.(v); toggleTag(v); setNewFormTagInput(''); }
                      setShowFormTagInput(false);
                    }} className="px-3 py-1.5 border-2 border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50">Add</button>
                    <button type="button" onClick={() => { setShowFormTagInput(false); setNewFormTagInput(''); }}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                )}
                {(formData.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map(tag => (
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
                  startDate={formData.event_date || ''}
                  endDate={formData.event_end_date || ''}
                  onChange={(start, end) => setFormData({ ...formData, event_date: start, event_end_date: end })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Recurring</label>
                <select value={recurrence.preset}
                  onChange={(e) => setRecurrence(r => ({ ...r, preset: e.target.value as typeof r.preset }))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent">
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly on {formData.event_date ? new Date(formData.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : 'same day'}</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                  <option value="weekdays">Every weekday (Mon–Fri)</option>
                  <option value="custom">Custom…</option>
                </select>
              </div>
            </div>

            {/* Recurring expanded options */}
            {recurrence.preset === 'custom' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Every</span>
                <input type="number" min={1} max={99} value={recurrence.interval}
                  onChange={(e) => setRecurrence(r => ({ ...r, interval: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-16 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent text-center" />
                <select value={recurrence.freq}
                  onChange={(e) => setRecurrence(r => ({ ...r, freq: e.target.value as typeof r.freq }))}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent">
                  <option value="day">{recurrence.interval === 1 ? 'Day' : 'Days'}</option>
                  <option value="week">{recurrence.interval === 1 ? 'Week' : 'Weeks'}</option>
                  <option value="month">{recurrence.interval === 1 ? 'Month' : 'Months'}</option>
                  <option value="year">{recurrence.interval === 1 ? 'Year' : 'Years'}</option>
                </select>
              </div>
            )}

            {recurrence.preset !== 'none' && (
              <div className="flex flex-col gap-2 pl-1">
                <span className="text-sm font-medium text-gray-700">Ends</span>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="recur-end" value="never" checked={recurrence.endType === 'never'}
                    onChange={() => setRecurrence(r => ({ ...r, endType: 'never' }))} className="accent-gray-900" />
                  Never
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="recur-end" value="on" checked={recurrence.endType === 'on'}
                    onChange={() => setRecurrence(r => ({ ...r, endType: 'on' }))} className="accent-gray-900" />
                  On
                  <input type="date" value={recurrence.endDate}
                    onClick={() => setRecurrence(r => ({ ...r, endType: 'on' }))}
                    onChange={(e) => setRecurrence(r => ({ ...r, endType: 'on', endDate: e.target.value }))}
                    className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent" />
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="recur-end" value="after" checked={recurrence.endType === 'after'}
                    onChange={() => setRecurrence(r => ({ ...r, endType: 'after' }))} className="accent-gray-900" />
                  After
                  <input type="number" min={1} max={365} value={recurrence.endCount}
                    onClick={() => setRecurrence(r => ({ ...r, endType: 'after' }))}
                    onChange={(e) => setRecurrence(r => ({ ...r, endType: 'after', endCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-16 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-[#42a746] focus:border-transparent text-center" />
                  occurrences
                </label>
              </div>
            )}

            {/* URL — auto-fills platform + author */}
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input type="url" value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                placeholder="Paste the share link from IG or TikTok here..." />
              {fetchingMeta && (
                <p className="text-xs text-gray-400 mt-1">Fetching info from URL…</p>
              )}
            </div>

            {/* Author + Platform — only shown when auto-filled from URL or editing an existing save */}
            {(formData.author || existingSave?.author) && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input type="text" value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
                    placeholder="@username" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <select value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom fields */}
            {customFields && customFields.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Custom Fields</p>
                {customFields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-1">{field.name}</label>
                    <DeletableSelect
                      value={customFieldValues[field.name] || ''}
                      onChange={v => setCustomFieldValues(prev => ({ ...prev, [field.name]: v }))}
                      defaultLabel={`Select ${field.name}…`}
                      defaultValue=""
                      options={(field.options || []).map(o => ({ value: o, label: o }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2 pb-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {saveError && (
              <p className="text-sm text-red-600 mt-2 text-center">{saveError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
