'use client';

import { useState, useRef, useEffect } from 'react';
import { api, User } from '@/lib/api';

const AVATAR_COLORS = ['#42a746', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

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

function ProfileEditForm({ profile, onSave, onCancel }: {
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
  const [saveError, setSaveError] = useState('');

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
    setSaving(true); setSaveError('');
    try { await onSave({ ...formData, email: profile.email }); }
    catch { setSaveError('Something went wrong. Please try again.'); }
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
      {saveError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{saveError}</div>}
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

export default function ProfilePanel({ user, onClose, onLogout, onProfileUpdate }: {
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
  onProfileUpdate: (u: User) => void;
}) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHexInput, setShowHexInput] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [avatarColor, setAvatarColor] = useState('#000000');

  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(`lokeet_avatar_color_${user.id}`);
    if (stored) setAvatarColor(stored);
  }, [user?.id]);

  function saveColor(hex: string) {
    setAvatarColor(hex);
    if (user?.id) localStorage.setItem(`lokeet_avatar_color_${user.id}`, hex);
  }

  function handleClose() {
    setIsEditingProfile(false);
    setShowColorPicker(false);
    setShowHexInput(false);
    setShowGradientPicker(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold">Profile</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: avatarColor }}>
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
                      <button key={color} type="button" onClick={() => {
                        saveColor(color); setShowColorPicker(false);
                      }}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none flex-shrink-0"
                        style={{ backgroundColor: color, boxShadow: avatarColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined }}
                      />
                    ))}
                    <button type="button" onClick={() => setShowHexInput(p => !p)}
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 text-white text-sm font-bold"
                      style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
                    >+</button>
                  </div>
                  {showHexInput && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">#</span>
                        <input type="text" value={avatarColor.replace('#', '')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                            const hex = `#${raw}`;
                            saveColor(hex);
                          }}
                          maxLength={6} placeholder="42a746" autoFocus
                          className="w-24 px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent font-mono uppercase"
                        />
                        <button type="button" onClick={() => setShowGradientPicker(p => !p)}
                          className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0 hover:scale-110 transition-transform"
                          style={{ backgroundColor: avatarColor }}
                        />
                      </div>
                      {showGradientPicker && (
                        <GradientPicker color={avatarColor}
                          onChange={(hex) => saveColor(hex)}
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
                if (result.success) {
                  onProfileUpdate(result.user);
                  setIsEditingProfile(false);
                  setShowColorPicker(false);
                  setShowHexInput(false);
                  setShowGradientPicker(false);
                }
              }}
              onCancel={() => {
                setIsEditingProfile(false);
                setShowColorPicker(false);
                setShowHexInput(false);
                setShowGradientPicker(false);
              }}
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
                    <span className="text-sm font-medium text-gray-900">
                      {value ?? <span className="text-gray-300 italic text-xs">not set</span>}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsEditingProfile(true)}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900">
                Edit Profile
              </button>
              <button onClick={onLogout}
                className="w-full mt-3 text-center text-red-600 text-sm hover:underline">
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
