import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { services, initialMessages } from '../data/constants';

const ownerQuickActions = [
  { icon: '📋', title: 'Manage Services', desc: 'Add, edit, or remove treatments', id: 'owner-services' },
  { icon: '📅', title: 'View Bookings', desc: 'All upcoming appointments', id: 'owner-bookings' },
  { icon: '👥', title: 'Staff Roster', desc: 'Manage your team schedule', id: 'owner-staff' },
  { icon: '📊', title: 'Reports', desc: 'Business analytics & insights', id: 'owner-reports' },
];

const todayAppointments = [
  { id: 1, client: 'Emily R.', service: 'Swedish Full Body Massage', time: '10:00 AM', therapist: 'Sofia', status: 'confirmed' },
  { id: 2, client: 'James K.', service: 'Facial Rejuvenation', time: '11:30 AM', therapist: 'Luna', status: 'checked-in' },
  { id: 3, client: 'Sarah M.', service: 'Hot Stone Therapy', time: '2:00 PM', therapist: 'Sofia', status: 'confirmed' },
  { id: 4, client: 'Michael T.', service: 'Hair Styling & Cut', time: '3:30 PM', therapist: 'Marco', status: 'pending' },
];

const staffMembers = [
  { name: 'Sofia', role: 'Massage Therapist', rating: 4.9, clients: 128, image: '👩' },
  { name: 'Luna', role: 'Esthetician', rating: 4.8, clients: 96, image: '👩' },
  { name: 'Marco', role: 'Hairstylist', rating: 4.7, clients: 74, image: '👨' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export function OwnerDashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('owner-bookings');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: 'You', text: draft.trim(), type: 'outgoing' },
    ]);
    setDraft('');
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return '✓ Confirmed';
      case 'checked-in': return '🟢 Checked In';
      case 'pending': return '⏳ Pending';
      default: return status;
    }
  };

  const totalRevenue = services.reduce((sum, s) => sum + parseInt(s.price.slice(1)), 0);
  const totalBookings = todayAppointments.length;

  return (
    <div className="page-shell">
      {/* ── Header ──────────────────────── */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="navbar-logo-icon">✦</span>
            <div>
              <h1>Serenity Wellness</h1>
              <p className="header-subtitle">Salon Management Portal</p>
            </div>
          </div>
          <div className="user-info">
            <div className="user-greeting">
              <span className="greeting-text">{getGreeting()}, <strong>{user.name}</strong></span>
              <span className="greeting-emoji">🏪</span>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button className="logout-button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* ── Stats Banner ────────────────── */}
      <section className="owner-stats">
        <div className="owner-stat-card">
          <span className="owner-stat-icon">📅</span>
          <div className="owner-stat-info">
            <span className="owner-stat-value">{totalBookings}</span>
            <span className="owner-stat-label">Today's Bookings</span>
          </div>
        </div>
        <div className="owner-stat-card">
          <span className="owner-stat-icon">💰</span>
          <div className="owner-stat-info">
            <span className="owner-stat-value">${totalRevenue}</span>
            <span className="owner-stat-label">Services Revenue</span>
          </div>
        </div>
        <div className="owner-stat-card">
          <span className="owner-stat-icon">👥</span>
          <div className="owner-stat-info">
            <span className="owner-stat-value">{staffMembers.length}</span>
            <span className="owner-stat-label">Staff Members</span>
          </div>
        </div>
        <div className="owner-stat-card">
          <span className="owner-stat-icon">⭐</span>
          <div className="owner-stat-info">
            <span className="owner-stat-value">4.9</span>
            <span className="owner-stat-label">Avg. Rating</span>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ───────────────── */}
      <section className="quick-actions">
        {ownerQuickActions.map((action) => (
          <button
            key={action.id}
            className={`quick-action-card ${activeTab === action.id ? 'active' : ''}`}
            onClick={() => scrollToSection(action.id)}
          >
            <span className="quick-action-icon">{action.icon}</span>
            <div>
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </div>
          </button>
        ))}
      </section>

      {/* ── Today's Bookings ────────────── */}
      <section className="panel" id="owner-bookings">
        <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">Schedule</p>
            <h2>Today's Appointments</h2>
          </div>
          <span className="stat-pill" style={{ fontSize: '0.85rem' }}>Open today • 9am–7pm</span>
        </div>
        <div className="owner-table">
          <div className="owner-table-header">
            <span>Client</span>
            <span>Service</span>
            <span>Time</span>
            <span>Therapist</span>
            <span>Status</span>
          </div>
          {todayAppointments.map((apt) => (
            <div className="owner-table-row" key={apt.id}>
              <span className="owner-table-client">
                <span className="owner-avatar">{apt.client[0]}</span>
                {apt.client}
              </span>
              <span>{apt.service}</span>
              <span className="owner-table-time">{apt.time}</span>
              <span>{apt.therapist}</span>
              <span className={`owner-status owner-status-${apt.status}`}>{getStatusBadge(apt.status)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services Management ─────────── */}
      <section className="panel" id="owner-services">
        <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">Treatments</p>
            <h2>Services Overview</h2>
          </div>
          <button className="btn btn-primary btn-sm">+ Add Service</button>
        </div>
        <div className="owner-table">
          <div className="owner-table-header">
            <span>Service</span>
            <span>Duration</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {services.map((service) => (
            <div className="owner-table-row" key={service.title}>
              <span className="owner-table-client">
                <span className="owner-service-icon">
                  {service.title.includes('Massage') ? '💆' :
                   service.title.includes('Facial') ? '✨' :
                   service.title.includes('Stone') ? '🪨' :
                   service.title.includes('Hair') ? '💇' :
                   service.title.includes('Manicure') ? '💅' : '🌿'}
                </span>
                {service.title}
              </span>
              <span className="owner-table-time">{service.time}</span>
              <span className="owner-table-price">{service.price}</span>
              <span><span className="owner-status owner-status-confirmed">✓ Active</span></span>
              <span className="owner-table-actions">
                <button className="owner-action-btn" title="Edit">✏️</button>
                <button className="owner-action-btn" title="Disable">👁️</button>
                <button className="owner-action-btn" title="Delete">🗑️</button>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Staff Roster ────────────────── */}
      <section className="panel" id="owner-staff">
        <div className="section-heading">
          <p className="eyebrow">Team</p>
          <h2>Staff Roster</h2>
        </div>
        <div className="owner-staff-grid">
          {staffMembers.map((staff) => (
            <div className="owner-staff-card" key={staff.name}>
              <div className="owner-staff-avatar">{staff.image}</div>
              <h3>{staff.name}</h3>
              <p className="owner-staff-role">{staff.role}</p>
              <div className="owner-staff-stats">
                <div>
                  <span className="owner-staff-stat-value">{staff.rating}</span>
                  <span className="owner-staff-stat-label">Rating</span>
                </div>
                <div>
                  <span className="owner-staff-stat-value">{staff.clients}</span>
                  <span className="owner-staff-stat-label">Clients</span>
                </div>
                <div>
                  <span className="owner-staff-stat-value">95%</span>
                  <span className="owner-staff-stat-label">Satisfaction</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reports ─────────────────────── */}
      <section className="panel" id="owner-reports">
        <div className="section-heading">
          <p className="eyebrow">Analytics</p>
          <h2>Business Reports</h2>
        </div>
        <div className="owner-reports-grid">
          <div className="owner-report-card">
            <div className="owner-report-header">
              <span>📈</span>
              <h3>Weekly Revenue</h3>
            </div>
            <p className="owner-report-number">$3,240</p>
            <p className="owner-report-change positive">↑ 12% from last week</p>
          </div>
          <div className="owner-report-card">
            <div className="owner-report-header">
              <span>👤</span>
              <h3>New Clients</h3>
            </div>
            <p className="owner-report-number">18</p>
            <p className="owner-report-change positive">↑ 8% from last week</p>
          </div>
          <div className="owner-report-card">
            <div className="owner-report-header">
              <span>📋</span>
              <h3>Total Bookings</h3>
            </div>
            <p className="owner-report-number">47</p>
            <p className="owner-report-change positive">↑ 5% from last week</p>
          </div>
          <div className="owner-report-card">
            <div className="owner-report-header">
              <span>⭐</span>
              <h3>Avg. Rating</h3>
            </div>
            <p className="owner-report-number">4.9</p>
            <p className="owner-report-change positive">↑ 0.1 from last week</p>
          </div>
        </div>
      </section>

      {/* ── Chat / Concierge ────────────── */}
      <section className="panel" id="owner-messages">
        <div className="section-heading">
          <p className="eyebrow">Inbox</p>
          <h2>Customer Messages</h2>
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
              placeholder="Reply to customers..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </section>
    </div>
  );
}
