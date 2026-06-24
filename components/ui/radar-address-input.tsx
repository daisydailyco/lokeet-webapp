'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Radar from 'radar-sdk-js';

const RADAR_KEY = 'prj_live_pk_8c9d4c6a85d8b9e0aacb1b2f6f7ec0ead4cb799a';
let radarInitialized = false;

function ensureRadar() {
  if (!radarInitialized) {
    Radar.initialize(RADAR_KEY);
    radarInitialized = true;
  }
}

export interface AddressSelection {
  formattedAddress: string;
  placeLabel?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  value: string;
  onChange: (raw: string) => void;
  onSelect: (result: AddressSelection) => void;
  placeholder?: string;
  className?: string;
}

export function RadarAddressInput({ value, onChange, onSelect, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSelection[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      ensureRadar();
      const res = await Radar.autocomplete({
        query,
        near: '27.7676,-82.6403',
        layers: ['place', 'address'],
        limit: 8,
      });
      const mapped: AddressSelection[] = (res.addresses || []).map(a => ({
        formattedAddress: a.formattedAddress || a.addressLabel || '',
        placeLabel: a.placeLabel || undefined,
        city: a.city,
        state: a.state,
        stateCode: a.stateCode,
        latitude: a.latitude,
        longitude: a.longitude,
      }));
      setSuggestions(mapped);
      setOpen(mapped.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    onChange(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(raw), 300);
  }

  function handleSelect(suggestion: AddressSelection) {
    onChange(suggestion.formattedAddress);
    onSelect(suggestion);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ''}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder || 'Enter name or address to search'}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent"
        autoComplete="off"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          Searching…
        </span>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="px-4 py-2.5 cursor-pointer hover:bg-[#f9f8e5] border-b border-gray-100 last:border-0"
            >
              {s.placeLabel ? (
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 shrink-0">{s.placeLabel}</span>
                  <span className="text-xs text-gray-500 truncate">{s.formattedAddress}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-800">{s.formattedAddress}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
