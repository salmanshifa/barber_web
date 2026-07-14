import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { OwnerDashboard } from './components/OwnerDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { Toast, useToast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';
import { API_BASE_URL } from './utils/api';

function getPersistedState(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setPersistedState(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, dismissToast } = useToast();
  const [page, setPage] = useState(() => getPersistedState('serenity-page', 'home'));
  const [isLoggedIn, setIsLoggedIn] = useState(() => getPersistedState('serenity-logged-in', false));
  const [user, setUser] = useState(() => getPersistedState('serenity-user', null));
  const [sessionChecked, setSessionChecked] = useState(false);

  // Persist state changes to localStorage
  useEffect(() => { setPersistedState('serenity-page', page); }, [page]);
  useEffect(() => { setPersistedState('serenity-logged-in', isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { setPersistedState('serenity-user', user); }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('serenity-token');
    localStorage.removeItem('serenity-user');
    localStorage.removeItem('serenity-logged-in');
    localStorage.removeItem('serenity-page');
    setIsLoggedIn(false);
    setUser(null);
    setPage('home');
  };

  const handleNavigate = (target) => {
    if (target === 'login') setPage('login');
    else if (target === 'home') setPage('home');
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('serenity-token');
      if (!token) {
        // No token — clear any stale cached state so old dashboard doesn't flash
        localStorage.removeItem('serenity-user');
        localStorage.removeItem('serenity-logged-in');
        localStorage.removeItem('serenity-page');
        setIsLoggedIn(false);
        setUser(null);
        setPage('home');
        setSessionChecked(true);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid — clear everything
          localStorage.removeItem('serenity-token');
          localStorage.removeItem('serenity-user');
          localStorage.removeItem('serenity-logged-in');
          localStorage.removeItem('serenity-page');
          showToast('Session expired. Please sign in again.', 'warning', 6000);
          setSessionChecked(true);
          setIsLoggedIn(false);
          setUser(null);
          setPage('home');
          return;
        }

        if (!response.ok) {
          // Server error — keep the token, try again on next reload
          showToast('Server error — could not restore your session. Try again later.', 'error', 6000);
          setSessionChecked(true);
          return;
        }

        const json = await response.json();
        const { data } = json;
        if (!data) throw new Error('No profile data');

        const userData = {
          type: data.role === 'SHOP_OWNER' ? 'owner' : data.role === 'STAFF' ? 'staff' : 'customer',
          name: data.username || data.email?.split('@')[0],
          username: data.username,
          email: data.email,
          id: data.id,
          role: data.role,
          enabled: data.enabled,
        };
        setUser(userData);
        setIsLoggedIn(true);
        setPage('dashboard');
      } catch {
        // Network error (backend not running, timeout, etc.) — keep the token
        // so it works on next reload when backend is available
        showToast('Could not restore session — backend may be offline. Please sign in.', 'warning', 8000);
      } finally {
        clearTimeout(timeoutId);
        setSessionChecked(true);
      }
    };

    restoreSession();
  }, []);

  if (!sessionChecked) {
    return (
      <div className="loading-screen">
        <div className="loading-screen-inner">
          <div className="loading-ring">
            <div className="loading-ring-segment" />
          </div>
          <div className="loading-brand">
            <span className="loading-brand-icon">🧘</span>
            <h2>Serenity Wellness</h2>
          </div>
          <div className="loading-bar-track">
            <div className="loading-bar-fill" />
          </div>
          <p className="loading-text">Restoring your session...</p>
        </div>
        <div className="loading-theme-toggle">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toast={toast} onDismiss={dismissToast} />
      {isLoggedIn && page === 'dashboard' ? (
        user.type === 'staff' ? (
          <StaffDashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        ) : user.type === 'customer' ? (
          <CustomerDashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        ) : (
          <OwnerDashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        )
      ) : page === 'login' ? (
        <LoginPage onLogin={handleLogin} onBack={() => setPage('home')} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <HomePage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
      )}
    </>
  );
}

export default App;
