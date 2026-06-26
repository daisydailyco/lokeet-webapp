/**
 * Lokeet API Client
 * Handles all backend API calls
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-5630.up.railway.app/v1';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  zip_code?: string;
  birthday?: string;
  collections?: Array<{ name: string; color: string }>;
}

export interface Save {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  content: string;
  images: string[];
  author: string;
  event_name?: string;
  venue_name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
  event_date?: string;
  event_end_date?: string;
  event_extra_dates?: string[];
  start_time?: string;
  end_time?: string;
  event_type?: string;
  tags: string[];
  category?: string;
  ai_processed: boolean;
  confidence_score: number;
  saved_at: string;
}

export interface PortalEvent {
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

class LokeetAPI {
  // Routes storage to localStorage (remember me) or sessionStorage (session only).
  private store(): Storage {
    if (typeof window === 'undefined') return localStorage;
    return localStorage.getItem('lokeet_remember') === 'true'
      ? localStorage
      : sessionStorage;
  }

  private getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  private removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getItem('lokeet_session');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Exchange the stored refresh token for a fresh access token. Returns the new
  // token on success, or null. Only clears the session when the refresh token
  // is definitively rejected (not on transient/5xx/network errors).
  private async refreshSession(): Promise<string | null> {
    const refreshToken = this.getItem('lokeet_refresh');
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (res.status >= 500) return null; // transient — keep session

      const data = await res.json();

      if (data.success && data.session?.access_token) {
        this.store().setItem('lokeet_session', data.session.access_token);
        if (data.session.refresh_token) {
          this.store().setItem('lokeet_refresh', data.session.refresh_token);
        }
        if (data.user) {
          this.store().setItem('lokeet_user', JSON.stringify(data.user));
        }
        return data.session.access_token;
      }

      // Refresh token invalid/expired — clear the dead session.
      this.removeItem('lokeet_session');
      this.removeItem('lokeet_refresh');
      this.removeItem('lokeet_user');
      return null;
    } catch {
      return null; // network error — transient, keep session
    }
  }

  // fetch() wrapper that attaches auth headers and, on a 401, transparently
  // refreshes the access token and retries the request once.
  private async authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let res = await fetch(url, {
      ...options,
      headers: { ...this.getAuthHeaders(), ...(options.headers || {}) }
    });

    if (res.status === 401) {
      const newToken = await this.refreshSession();
      if (newToken) {
        res = await fetch(url, {
          ...options,
          headers: { ...this.getAuthHeaders(), ...(options.headers || {}) }
        });
      }
    }

    return res;
  }

  // Auth endpoints
  async signup(email: string, password: string, rememberMe = false) {
    localStorage.setItem('lokeet_remember', rememberMe ? 'true' : 'false');
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success && data.session?.access_token) {
      this.store().setItem('lokeet_session', data.session.access_token);
      if (data.session.refresh_token) {
        this.store().setItem('lokeet_refresh', data.session.refresh_token);
      }
      this.store().setItem('lokeet_user', JSON.stringify(data.user));
    }

    return data;
  }

  async login(email: string, password: string, rememberMe = false) {
    localStorage.setItem('lokeet_remember', rememberMe ? 'true' : 'false');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success && data.session?.access_token) {
      this.store().setItem('lokeet_session', data.session.access_token);
      if (data.session.refresh_token) {
        this.store().setItem('lokeet_refresh', data.session.refresh_token);
      }
      this.store().setItem('lokeet_user', JSON.stringify(data.user));
    }

    return data;
  }

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } finally {
      this.removeItem('lokeet_session');
      this.removeItem('lokeet_refresh');
      this.removeItem('lokeet_user');
      localStorage.removeItem('lokeet_remember');
    }
  }

  async verifySession(): Promise<{ valid: boolean; user?: User }> {
    try {
      let res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      let data = await res.json();

      // /auth/verify returns 200 {valid:false} on an expired token (not 401),
      // so authedFetch can't catch it — refresh and re-verify once here.
      if (!data.valid) {
        const newToken = await this.refreshSession();
        if (newToken) {
          res = await fetch(`${API_BASE}/auth/verify`, {
            method: 'POST',
            headers: this.getAuthHeaders()
          });
          data = await res.json();
        }
      }

      return data;
    } catch {
      return { valid: false };
    }
  }

  // Profile endpoints
  async getProfile(): Promise<User | null> {
    const res = await this.authedFetch(`${API_BASE}/user/profile`);

    if (!res.ok) return null;

    const data = await res.json();
    return data.profile;
  }

  async updateProfile(updates: Partial<User>) {
    const res = await this.authedFetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    return await res.json();
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const res = await this.authedFetch(`${API_BASE}/user/username/check?username=${encodeURIComponent(username)}`);

    const data = await res.json();
    return data.available;
  }

  async getPublicProfile(username: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/user/profile/${username}`);

      if (!res.ok) return null;

      const data = await res.json();
      return data.profile;
    } catch {
      return null;
    }
  }

  // Saves endpoints
  async getSaves(): Promise<Save[]> {
    const res = await this.authedFetch(`${API_BASE}/user/saves`);

    if (!res.ok) return [];

    const data = await res.json();
    return data.saves || [];
  }

  async createSave(save: {
    platform: string;
    url: string;
    content: string;
    images?: string[];
    author: string;
    category?: string;
    event_type?: string;
    tags?: string[];
    city?: string;
    state?: string;
    event_name?: string;
    venue_name?: string;
    address?: string;
    event_date?: string;
    event_end_date?: string;
    event_extra_dates?: string[];
  }): Promise<Save | null> {
    const res = await this.authedFetch(`${API_BASE}/user/saves`, {
      method: 'POST',
      body: JSON.stringify(save)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[createSave] failed', res.status, errText);
      return null;
    }

    const data = await res.json();
    return data.item;
  }

  async updateSave(id: string, updates: Partial<Save>) {
    const res = await this.authedFetch(`${API_BASE}/user/saves/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });

    return await res.json();
  }

  async deleteSave(id: string) {
    const res = await this.authedFetch(`${API_BASE}/user/saves/${id}`, {
      method: 'DELETE'
    });

    return await res.json();
  }

  async fetchMeta(url: string): Promise<{ author: string; content: string }> {
    try {
      const res = await this.authedFetch(
        `${API_BASE}/fetch-meta?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) return { author: '', content: '' };
      return await res.json();
    } catch {
      return { author: '', content: '' };
    }
  }

  // Share endpoints
  async shareCategory(category: string, items: Save[]) {
    const res = await this.authedFetch(`${API_BASE}/share`, {
      method: 'POST',
      body: JSON.stringify({ category, items })
    });

    return await res.json();
  }

  async getSharedList(shareId: string) {
    const res = await fetch(`${API_BASE}/api/share/${shareId}`);
    return await res.json();
  }

  async getPortalEvents(): Promise<PortalEvent[]> {
    try {
      const res = await this.authedFetch(`${API_BASE}/portal/events`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || [];
    } catch { return []; }
  }

  async savePortalEvents(events: PortalEvent[]): Promise<void> {
    try {
      await this.authedFetch(`${API_BASE}/portal/events`, {
        method: 'PUT',
        body: JSON.stringify({ events }),
      });
    } catch {}
  }

  async getPublicPortalEvents(username: string): Promise<PortalEvent[]> {
    try {
      const base = API_BASE.replace('/v1', '');
      const res = await fetch(`${base}/public/portal/${username}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || [];
    } catch { return []; }
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.getItem('lokeet_session');
  }

  getCurrentUser(): User | null {
    const userStr = this.getItem('lokeet_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const api = new LokeetAPI();
