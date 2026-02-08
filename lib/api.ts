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
  start_time?: string;
  end_time?: string;
  event_type?: string;
  tags: string[];
  category?: string;
  ai_processed: boolean;
  confidence_score: number;
  saved_at: string;
}

class LokeetAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('lokeet_session');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Auth endpoints
  async signup(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success && data.session?.access_token) {
      localStorage.setItem('lokeet_session', data.session.access_token);
      localStorage.setItem('lokeet_user', JSON.stringify(data.user));
    }

    return data;
  }

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success && data.session?.access_token) {
      localStorage.setItem('lokeet_session', data.session.access_token);
      localStorage.setItem('lokeet_user', JSON.stringify(data.user));
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
      localStorage.removeItem('lokeet_session');
      localStorage.removeItem('lokeet_user');
    }
  }

  async verifySession(): Promise<{ valid: boolean; user?: User }> {
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      return await res.json();
    } catch {
      return { valid: false };
    }
  }

  // Profile endpoints
  async getProfile(): Promise<User | null> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: this.getAuthHeaders()
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.profile;
  }

  async updateProfile(updates: Partial<User>) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    return await res.json();
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/user/username/check?username=${encodeURIComponent(username)}`, {
      headers: this.getAuthHeaders()
    });

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
    const res = await fetch(`${API_BASE}/user/saves`, {
      headers: this.getAuthHeaders()
    });

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
  }): Promise<Save | null> {
    const res = await fetch(`${API_BASE}/user/saves`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(save)
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.item;
  }

  async updateSave(id: string, updates: Partial<Save>) {
    const res = await fetch(`${API_BASE}/user/saves/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    return await res.json();
  }

  async deleteSave(id: string) {
    const res = await fetch(`${API_BASE}/user/saves/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return await res.json();
  }

  // Share endpoints
  async shareCategory(category: string, items: Save[]) {
    const res = await fetch(`${API_BASE}/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ category, items })
    });

    return await res.json();
  }

  async getSharedList(shareId: string) {
    const res = await fetch(`${API_BASE}/api/share/${shareId}`);
    return await res.json();
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('lokeet_session');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('lokeet_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const api = new LokeetAPI();
