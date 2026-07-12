import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { services, initialMessages, roleOptions } from '../data/constants';

const quickActions = [
  { icon: '📅', title: 'Book Appointment', desc: 'Schedule your next treatment', id: 'booking' },
  { icon: '📋', title: 'My Appointments', desc: 'View upcoming visits', id: 'appointments' },
  { icon: '💬', title: 'Message Us', desc: 'Chat with our team', id: 'messages' },
];

export function CustomerDashboard({ user, onLogout, theme, onToggleTheme }) {
  const [upcomingAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('booking');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [selectedRole, setSelectedRole] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    service: '',
    notes: '',
    signature: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: 'You', text: draft.trim(), type: 'outgoing' },
    ]);
    setDraft('');
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setSubmitted(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const selectedRoleLabel = roleOptions.find((role) => role.value === selectedRole)?.label ?? 'Role';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-shell">
      {/* ── Header ──────────────────────── */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="navbar-logo-icon">✦</span>
            <div>
              <h1>Serenity Wellness</h1>
              <p className="header-subtitle">Customer Portal</p>
            </div>
          </div>
          <div className="user-info">
            <div className="user-greeting">
              <span className="greeting-text">{getGreeting()}, <strong>{user.name}</strong></span>
              <span className="greeting-emoji">🌿</span>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button className="logout-button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ─────────────────── */}
      <section className="customer-hero">
        <div className="customer-hero-bg">
          <div className="customer-hero-shape shape-1" />
          <div className="customer-hero-shape shape-2" />
        </div>
        <div className="customer-hero-content">
          <div>
            <p className="eyebrow">Welcome to your wellness journey</p>
            <h1>{getGreeting()}, {user.name} ✨</h1>
            <p className="customer-hero-text">
              Your sanctuary awaits. Browse treatments, book appointments, and connect with our wellness experts — all in one place.
            </p>
          </div>
          <div className="customer-hero-stats">
            <div className="hero-stat-card">
              <span className="hero-stat-icon">📅</span>
              <div>
                <span className="hero-stat-value">{upcomingAppointments.length}</span>
                <span className="hero-stat-label">Upcoming</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-icon">⭐</span>
              <div>
                <span className="hero-stat-value">4.9</span>
                <span className="hero-stat-label">Rating</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-icon">🏆</span>
              <div>
                <span className="hero-stat-value">{services.length}</span>
                <span className="hero-stat-label">Services</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ───────────────── */}
      <section className="quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.id}
            className={`quick-action-card ${activeTab === action.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(action.id);
              const el = document.getElementById(action.id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span className="quick-action-icon">{action.icon}</span>
            <div>
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </div>
          </button>
        ))}
      </section>

      {/* ── Upcoming Appointments ───────── */}
      <section className="panel" id="appointments">
        <div className="section-heading">
          <p className="eyebrow">Your Schedule</p>
          <h2>Upcoming Appointments</h2>
        </div>
        {upcomingAppointments.length > 0 ? (
          <div className="appointments-list">
            {upcomingAppointments.map((apt) => (
              <div className="appointment-card" key={apt.id}>
                <div className="appointment-status confirmed">✓ Confirmed</div>
                <div className="appointment-info">
                  <h3>{apt.service}</h3>
                  <p>
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time}</span>
                    <span>👩‍⚕️ {apt.therapist}</span>
                  </p>
                </div>
                <button className="btn btn-secondary btn-sm">Reschedule</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📅</span>
            <h3>No upcoming appointments</h3>
            <p>Book your first treatment and start your wellness journey.</p>
            <button className="btn btn-primary" onClick={() => {
              setActiveTab('booking');
              const el = document.getElementById('booking');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>
              Browse Services
            </button>
          </div>
        )}
      </section>

      {/* ── Services / Booking ──────────── */}
      <section className="panel" id="booking">
        <div className="section-heading">
          <p className="eyebrow">Treatments</p>
          <h2>Our Services</h2>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article className="service-card enhanced" key={service.title}>
              <div className="service-card-body">
                <div className="service-card-icon">
                  {service.title.includes('Massage') ? '💆' :
                   service.title.includes('Facial') ? '✨' :
                   service.title.includes('Stone') ? '🪨' :
                   service.title.includes('Hair') ? '💇' :
                   service.title.includes('Manicure') ? '💅' : '🌿'}
                </div>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.time}</p>
                </div>
              </div>
              <div className="service-card-footer">
                <span className="service-price">{service.price}</span>
                <button className="btn btn-primary btn-sm">Book Now</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Chat / Concierge ────────────── */}
      <section className="panel" id="messages">
        <div className="section-heading">
          <p className="eyebrow">Concierge</p>
          <h2>Get in Touch</h2>
        </div>

        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">👩</div>
              <div>
                <strong>Sofia • Wellness Specialist</strong>
                <p>Usually replies in a few minutes</p>
              </div>
            </div>
            <span className="status-dot">Online</span>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div className={`message ${message.type}`} key={message.id}>
                <span className="message-author">{message.author}</span>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about availability, services, or special requests..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </section>

      {/* ── Booking Confirmation ────────── */}
      <section className="panel signoff-panel" id="signoff">
        <div className="section-heading">
          <p className="eyebrow">Appointment</p>
          <h2>Booking Confirmation</h2>
        </div>

        <div className="signoff-grid">
          <div className="role-selector" aria-label="Select booking role">
            {roleOptions.map((role) => (
              <button
                key={role.value}
                type="button"
                className={`role-pill ${selectedRole === role.value ? 'active' : ''}`}
                onClick={() => handleRoleChange(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form className="signoff-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Sarah Johnson" required />
            </div>

            <div className="field-group">
              <label htmlFor="service">Treatment or Service</label>
              <input id="service" name="service" value={formData.service} onChange={handleInputChange} placeholder="Swedish Massage + Facial" required />
            </div>

            <div className="field-group">
              <label htmlFor="notes">Preferences & Notes</label>
              <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleInputChange} placeholder="Any allergies, preferences, or special requests..." />
            </div>

            <div className="field-group">
              <label htmlFor="signature">Signature</label>
              <input id="signature" name="signature" value={formData.signature} onChange={handleInputChange} placeholder="Type your full name" required />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Confirm Booking</button>
              <span className="status-chip">{submitted ? '✓ Confirmed' : 'Pending'}</span>
            </div>

            {submitted && (
              <p className="success-note">
                Thank you! Your {selectedRoleLabel.toLowerCase()} booking for {formData.service || 'this service'} has been confirmed.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
