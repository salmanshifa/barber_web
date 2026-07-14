import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { API_BASE_URL } from '../utils/api';

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function LoginPage({ onLogin, onBack, theme, onToggleTheme }) {
  const [userType, setUserType] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ login: false, register: false, confirm: false });

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginData.username || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoggingIn(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Login failed (${response.status})`);
      }

      const userData = await response.json();
    
      if (userData.data.token) {
        localStorage.setItem('serenity-token', userData.data.token);
        
      }
      onLogin({ type: userType, username: loginData.username, ...userData.data });
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Registering user with data:', registerData);
    if (!registerData.fullName || !registerData.username || !registerData.email || !registerData.mobile || !registerData.password || !registerData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (registerData.mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid mobile number with at least 10 digits');
      return;
    }

    setRegistering(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          mobileNumber: registerData.mobile,
          role: userType === 'owner' ? 'SHOP_OWNER' : 'CUSTOMER',
          enabled: true,
          password: registerData.password,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Registration failed (${response.status})`);
      }

      const json = await response.json();
      const responseData = json.data;
      if (responseData?.token) {
        localStorage.setItem('serenity-token', responseData.token);
      }
      onLogin({
        type: userType,
        name: registerData.fullName,
        email: registerData.email,
        ...(responseData?.user || responseData),
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setRegistering(false);
    }
  };

  if (!userType) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="auth-theme-toggle" />
          <div className="auth-header">
            <h1>Serenity Wellness</h1>
            <p>Salon & Massage Booking Platform</p>
          </div>
          <p className="auth-intro">Welcome! Choose how you'd like to get started:</p>
          <div className="auth-type-selector">
            <button className="type-card" onClick={() => setUserType('customer')}>
              <div className="type-icon">👤</div>
              <h3>I'm a Customer</h3>
              <p>Book appointments and manage reservations</p>
            </button>
            <button className="type-card" onClick={() => setUserType('owner')}>
              <div className="type-icon">🏢</div>
              <h3>I'm a Shop Owner</h3>
              <p>Manage your salon, staff, and bookings</p>
            </button>
            <button className="type-card" onClick={() => setUserType('staff')}>
              <div className="type-icon">🧑‍💼</div>
              <h3>I'm a Staff Member</h3>
              <p>View your schedule and manage appointments</p>
            </button>
          </div>
          <div className="auth-back-link">
            <button className="btn btn-ghost" onClick={onBack}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => setUserType(null)}>← Back</button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className="auth-theme-toggle" />
        <div className="auth-header">
          <h2>{showRegister ? 'Create Account' : 'Sign In'}</h2>
          <p>{userType === 'customer' ? 'Customer' : userType === 'staff' ? 'Staff' : 'Shop Owner'} Portal</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {!showRegister ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPasswords.login ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePassword('login')}
                  aria-label={showPasswords.login ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.login ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-button" disabled={loggingIn}>
              {loggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="regUsername">Username</label>
              <input
                id="regUsername"
                type="text"
                placeholder="johndoe"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="regEmail">Email</label>
              <input
                id="regEmail"
                type="email"
                placeholder="your@email.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="regMobile">Mobile Number</label>
              <input
                id="regMobile"
                type="tel"
                placeholder="(555) 123-4567"
                value={registerData.mobile}
                onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="regPassword">Password</label>
              <div className="password-wrapper">
                <input
                  id="regPassword"
                  type={showPasswords.register ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePassword('register')}
                  aria-label={showPasswords.register ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.register ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePassword('confirm')}
                  aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-button" disabled={registering}>
              {registering ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            {showRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="toggle-auth"
              onClick={() => {
                setShowRegister(!showRegister);
                setError('');
              }}
            >
              {showRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
