// Lokeet Extension Authentication Module
// Shared between popup and background scripts

const API_BASE = 'https://web-production-5630.up.railway.app';

class ExtensionAuth {
  constructor() {
    this.session = null;
    this.user = null;
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.session) {
        // Store session in chrome.storage.sync (syncs across devices)
        await chrome.storage.sync.set({
          lokeet_session: data.session,
          lokeet_user: data.user
        });

        this.session = data.session;
        this.user = data.user;

        console.log('[Auth] Login successful:', data.user.email);

        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Logout
  async logout() {
    try {
      // Get current session
      const { lokeet_session } = await chrome.storage.sync.get(['lokeet_session']);

      if (lokeet_session && lokeet_session.access_token) {
        // Call backend logout
        await fetch(`${API_BASE}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lokeet_session.access_token}`
          }
        });
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      // Clear local session regardless of backend response
      await chrome.storage.sync.remove(['lokeet_session', 'lokeet_user']);
      this.session = null;
      this.user = null;

      console.log('[Auth] Logged out');
    }
  }

  // Get current session
  async getSession() {
    if (this.session) {
      return this.session;
    }

    const { lokeet_session } = await chrome.storage.sync.get(['lokeet_session']);
    this.session = lokeet_session || null;
    return this.session;
  }

  // Get current user
  async getUser() {
    if (this.user) {
      return this.user;
    }

    const { lokeet_user } = await chrome.storage.sync.get(['lokeet_user']);
    this.user = lokeet_user || null;
    return this.user;
  }

  // Check if user is logged in
  async isLoggedIn() {
    const session = await this.getSession();
    return !!(session && session.access_token);
  }

  // Exchange the stored refresh token for a fresh session.
  // Returns the new session on success, or null. Only logs out when the
  // refresh token is definitively rejected (not on transient/network errors),
  // so a brief backend hiccup doesn't kick the user out.
  async refreshSession() {
    const { lokeet_session } = await chrome.storage.sync.get(['lokeet_session']);

    if (!lokeet_session || !lokeet_session.refresh_token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: lokeet_session.refresh_token })
      });

      // 5xx (incl. 503 when Supabase is unreachable) is transient — keep the
      // session and let the caller fall back, rather than logging out.
      if (response.status >= 500) {
        console.warn('[Auth] Refresh unavailable (server error), keeping session');
        return null;
      }

      const data = await response.json();

      if (data.success && data.session) {
        await chrome.storage.sync.set({
          lokeet_session: data.session,
          lokeet_user: data.user
        });
        this.session = data.session;
        this.user = data.user;
        console.log('[Auth] Session refreshed');
        return data.session;
      }

      // Refresh token invalid/expired — session is unrecoverable.
      console.warn('[Auth] Refresh token rejected, logging out');
      await this.logout();
      return null;
    } catch (error) {
      // Network error — transient, keep the session.
      console.error('[Auth] Refresh error (network):', error);
      return null;
    }
  }

  // fetch() wrapper that attaches auth headers and, on a 401, transparently
  // refreshes the access token and retries the request once.
  async authedFetch(url, options = {}) {
    const headers = await this.getAuthHeaders();
    let response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    });

    if (response.status === 401) {
      console.log('[Auth] 401 received — attempting token refresh and retry...');
      const newSession = await this.refreshSession();

      if (newSession && newSession.access_token) {
        const retryHeaders = await this.getAuthHeaders();
        response = await fetch(url, {
          ...options,
          headers: { ...retryHeaders, ...(options.headers || {}) }
        });
      }
    }

    return response;
  }

  // Verify session with backend
  async verifySession() {
    try {
      const session = await this.getSession();

      if (!session || !session.access_token) {
        return { valid: false };
      }

      let response = await fetch(`${API_BASE}/v1/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      let data = await response.json();

      // Access token likely expired — try a refresh and re-verify once before
      // giving up, so the user isn't logged out every time the token expires.
      if (!data.valid) {
        const refreshed = await this.refreshSession();
        if (refreshed && refreshed.access_token) {
          response = await fetch(`${API_BASE}/v1/auth/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshed.access_token}`
            }
          });
          data = await response.json();
        }
      }

      if (data.valid && data.user) {
        // Update stored user info
        await chrome.storage.sync.set({
          lokeet_user: data.user
        });

        this.user = data.user;

        return {
          valid: true,
          user: data.user
        };
      } else {
        // Session invalid, clear it
        await this.logout();
        return { valid: false };
      }
    } catch (error) {
      console.error('[Auth] Session verification error:', error);
      return { valid: false };
    }
  }

  // Get auth headers for API calls
  async getAuthHeaders() {
    const session = await this.getSession();

    if (session && session.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
    }

    return {
      'Content-Type': 'application/json'
    };
  }
}

// Create singleton instance
const extAuth = new ExtensionAuth();
