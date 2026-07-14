import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { initialMessages } from '../data/constants';

const staffQuickActions = [
  { icon: '📅', title: 'My Schedule', desc: 'View today\'s appointments', id: 'staff-schedule' },
  { icon: '🕐', title: 'Availability', desc: 'Set your working hours', id: 'staff-availability' },
  { icon: '💬', title: 'Messages', desc: 'Chat with customers & owner', id: 'staff-messages' },
];

const todayAppointments = [
  { id: 1, client: 'Emily R.', service: 'Swedish Full Body Massage', time: '10:00 AM', duration: '60 min', status: 'confirmed' },
  { id: 2, client: 'James K.', service: 'Facial Rejuvenation', time: '11:30 AM', duration: '50 min', status: 'checked-in' },
  { id: 3, client: 'Sarah M.', service: 'Hot Stone Therapy', time: '2:00 PM', duration: '75 min', status: 'confirmed' },
  { id: 4, client: 'Michael T.', service: 'Hair Styling & Cut', time: '3:30 PM', duration: '45 min', status: 'pending' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

function getDurationIcon(duration) {
  const min = parseInt(duration, 10);
  if (min <= 30) return '⚡';
  if (min <= 60) return '🕐';
  return '🕑';
}

export function StaffDashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('staff-schedule');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [appointments, setAppointments] = useState(todayAppointments);

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

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return { text: '✓ Confirmed', cls: 'confirmed' };
      case 'checked-in': return { text: '🟢 Checked In', cls: 'checked-in' };
      case 'in-progress': return { text: '🔵 In Progress', cls: 'in-progress' };
      case 'completed': return { text: '✅ Completed', cls: 'completed' };
      case 'pending': return { text: '⏳ Pending', cls: 'pending' };
      case 'cancelled': return { text: '❌ Cancelled', cls: 'cancelled' };
      default: return { text: status, cls: '' };
    }
  };

  const availableAppointments = appointments.filter((a) => a.status !== 'cancelled');
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="page-shell">
      {/* ── Header ──────────────────────── */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="navbar-logo-icon">✦</span>
            <div>
              <h1>Serenity Wellness</h1>
              <p className="header-subtitle">Staff Portal</p>
            </div>
          </div>
          <div className="user-info">
            <div className="user-greeting">
              <span className="greeting-text">{getGreeting()}, <strong>{user.name}</strong></span>
              <span className="greeting-emoji">🧑‍💼</span>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button className="logout-button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* ── Stats Banner ────────────────── */}
      <section className="staff-stats">
        <div className="staff-stat-card">
          <span className="staff-stat-icon">📅</span>
          <div className="staff-stat-info">
            <span className="staff-stat-value">{availableAppointments.length}</span>
            <span className="staff-stat-label">Today's Appointments</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <span className="staff-stat-icon">🕐</span>
          <div className="staff-stat-info">
            <span className="staff-stat-value">{availableAppointments.filter((a) => a.status === 'completed' || a.status === 'in-progress').length}</span>
            <span className="staff-stat-label">In Progress</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <span className="staff-stat-icon">✅</span>
          <div className="staff-stat-info">
            <span className="staff-stat-value">{completedCount}</span>
            <span className="staff-stat-label">Completed</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <span className="staff-stat-icon">⏳</span>
          <div className="staff-stat-info">
            <span className="staff-stat-value">{appointments.filter((a) => a.status === 'pending').length}</span>
            <span className="staff-stat-label">Pending</span>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ───────────────── */}
      <section className="quick-actions">
        {staffQuickActions.map((action) => (
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

      {/* ── Today's Schedule ────────────── */}
      <section className="panel" id="staff-schedule">
        <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">Schedule</p>
            <h2>Today's Appointments</h2>
          </div>
          <span className="stat-pill" style={{ fontSize: '0.85rem' }}>🕐 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="staff-appointments-list">
          {appointments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🎉</span>
              <h3>No appointments today</h3>
              <p>Enjoy your day off or check your upcoming schedule.</p>
            </div>
          ) : (
            appointments.map((apt) => {
              const badge = getStatusBadge(apt.status);
              return (
                <div className={`staff-appointment-card staff-appointment-${apt.status}`} key={apt.id}>
                  <div className="staff-appointment-time">
                    <span className="staff-appointment-time-value">{apt.time}</span>
                    <span className="staff-appointment-duration">
                      {getDurationIcon(apt.duration)} {apt.duration}
                    </span>
                  </div>
                  <div className="staff-appointment-body">
                    <div className="staff-appointment-client">
                      <span className="staff-appointment-avatar">{apt.client[0]}</span>
                      <div>
                        <strong>{apt.client}</strong>
                        <span className="staff-appointment-service">{apt.service}</span>
                      </div>
                    </div>
                    <span className={`staff-status-badge staff-status-${badge.cls}`}>{badge.text}</span>
                  </div>
                  <div className="staff-appointment-actions">
                    {apt.status === 'pending' && (
                      <button
                        className="staff-action-btn staff-action-confirm"
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        title="Confirm appointment"
                      >
                        ✓ Confirm
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        className="staff-action-btn staff-action-checkin"
                        onClick={() => updateAppointmentStatus(apt.id, 'checked-in')}
                        title="Check in client"
                      >
                        🟢 Check In
                      </button>
                    )}
                    {apt.status === 'checked-in' && (
                      <button
                        className="staff-action-btn staff-action-start"
                        onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                        title="Start service"
                      >
                        ▶ Start
                      </button>
                    )}
                    {apt.status === 'in-progress' && (
                      <button
                        className="staff-action-btn staff-action-complete"
                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                        title="Mark as completed"
                      >
                        ✅ Complete
                      </button>
                    )}
                    {(apt.status !== 'completed' && apt.status !== 'cancelled') && (
                      <button
                        className="staff-action-btn staff-action-cancel"
                        onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                        title="Cancel appointment"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── Availability ────────────────── */}
      <section className="panel" id="staff-availability">
        <div className="section-heading">
          <p className="eyebrow">Work Hours</p>
          <h2>My Availability</h2>
        </div>
        <div className="staff-availability-grid">
          <div className="staff-availability-card">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Mon</span>
              <span className="staff-availability-time">9:00 AM – 5:00 PM</span>
            </div>
            <span className="staff-availability-status available">Available</span>
          </div>
          <div className="staff-availability-card">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Tue</span>
              <span className="staff-availability-time">9:00 AM – 5:00 PM</span>
            </div>
            <span className="staff-availability-status available">Available</span>
          </div>
          <div className="staff-availability-card">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Wed</span>
              <span className="staff-availability-time">10:00 AM – 7:00 PM</span>
            </div>
            <span className="staff-availability-status available">Available</span>
          </div>
          <div className="staff-availability-card">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Thu</span>
              <span className="staff-availability-time">9:00 AM – 5:00 PM</span>
            </div>
            <span className="staff-availability-status available">Available</span>
          </div>
          <div className="staff-availability-card">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Fri</span>
              <span className="staff-availability-time">9:00 AM – 3:00 PM</span>
            </div>
            <span className="staff-availability-status available">Available</span>
          </div>
          <div className="staff-availability-card staff-availability-off">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Sat</span>
              <span className="staff-availability-time">—</span>
            </div>
            <span className="staff-availability-status off">Day Off</span>
          </div>
          <div className="staff-availability-card staff-availability-off">
            <div className="staff-availability-day">
              <span className="staff-availability-day-name">Sun</span>
              <span className="staff-availability-time">—</span>
            </div>
            <span className="staff-availability-status off">Day Off</span>
          </div>
        </div>
      </section>

      {/* ── Messages / Concierge ────────── */}
      <section className="panel" id="staff-messages">
        <div className="section-heading">
          <p className="eyebrow">Inbox</p>
          <h2>Messages</h2>
        </div>

        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🧑‍💼</div>
              <div>
                <strong>Team Chat</strong>
                <p>Connect with customers and management</p>
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
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </section>
    </div>
  );
}
