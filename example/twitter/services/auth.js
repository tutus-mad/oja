// Standalone auth service — only used by register.html which has no access to Oja's auth module.
// All other pages use Oja's built-in auth directly.

class AuthService {
    constructor() {
        this.currentUser  = null;
        this.token        = null;
        this._refreshToken = null;
        this.listeners    = new Set();
    }

    async login(username, password) {
        const response = await api.login(username, password);
        this.setSession(response);
        return response.user;
    }

    async logout() {
        await api.logout();
        this.clearSession();
    }

    // Register a new user and open a session immediately
    async register(userData) {
        const response = await api.register(userData);
        this.setSession(response);
        return response.user;
    }

    // Attempt to refresh the access token using the stored refresh token
    async tryRefresh() {
        if (!this._refreshToken) return false;
        try {
            const response = await api.refreshToken(this._refreshToken);
            this.token = response.token;
            this._notifyListeners();
            return true;
        } catch {
            this.clearSession();
            return false;
        }
    }

    setSession({ user, token, refreshToken }) {
        this.currentUser   = user;
        this.token         = token;
        this._refreshToken = refreshToken;

        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        if (refreshToken) localStorage.setItem('auth_refresh_token', refreshToken);

        this._notifyListeners();
    }

    clearSession() {
        this.currentUser   = null;
        this.token         = null;
        this._refreshToken = null;

        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');

        this._notifyListeners();
    }

    // Restore a previously saved session from localStorage
    loadSession() {
        const user         = localStorage.getItem('auth_user');
        const token        = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('auth_refresh_token');

        if (user && token) {
            this.currentUser   = JSON.parse(user);
            this.token         = token;
            this._refreshToken = refreshToken;
            return true;
        }
        return false;
    }

    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }

    getCurrentUser() { return this.currentUser; }
    getToken()       { return this.token; }

    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    _notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentUser));
    }
}

export const auth = new AuthService();

auth.loadSession();