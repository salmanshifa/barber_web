import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { fetchPublicServices, fetchBookings, createBooking, cancelBooking } from '../utils/api';
import { initialMessages } from '../data/constants';

const quickActions = [
  { icon: '📅', title: 'Book Appointment', desc: 'Schedule your next treatment', id: 'booking' },
  { icon: '📋', title: 'My Appointments', desc: 'View upcoming visits', id: 'appointments' },
  { icon: '💬', title: 'Message Us', desc: 'Chat with our team', id: 'messages' },
];

function toLocalISOString(date) {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${M}-${d}T${h}:${m}:${s}`;
}

function getMinDate() {
  return toLocalISOString(new Date()).slice(0, 10);
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 18) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export function CustomerDashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('booking');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [selectedRole, setSelectedRole] = useState('client');

  // Services
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  // Booking form
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState(getMinDate());
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // ── Fetch services on mount ──────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);
        const data = await fetchPublicServices();
        if (!cancelled) setServices(data);
      } catch {
        if (!cancelled) setServicesError('Unable to load services. Please try again later.');
      } finally {
        if (!cancelled) setServicesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch bookings on mount ──────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setBookingsLoading(true);
        setBookingsError(null);
        const data = await fetchBookings();
        if (!cancelled) setBookings(data);
      } catch {
        if (!cancelled) setBookingsError('Unable to load your bookings.');
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const refreshBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch {
      // Silently fail on refresh
    }
  };

  // ── Chat handlers ──────────────────────────────
  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: 'You', text: draft.trim(), type: 'outgoing' },
    ]);
    setDraft('');
  };

  // ── Booking handlers ────────────────────────────

  const handleBookNow = (service) => {
    setSelectedService(service);
    setBookingSuccess(null);
    setBookingError(null);
    setActiveTab('booking');
    // Scroll to the booking form section
    const el = document.getElementById('booking-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!selectedService) {
      setBookingError('Please select a service first.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const dateStr = bookingDate;
      const timeStr = bookingTime;
      const appointmentTime = `${dateStr}T${timeStr}:00`;

      // Calculate end time based on service duration
      const durationMatch = selectedService.time.match(/(\d+)/);
      const durationMinutes = durationMatch ? parseInt(durationMatch[1], 10) : 60;
      const startDate = new Date(`${dateStr}T${timeStr}:00`);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
      const endTime = toLocalISOString(endDate);

      await createBooking({
        appointmentTime,
        endTime,
        serviceId: selectedService.id,
      });

      setBookingSuccess(`Your booking for "${selectedService.title}" is confirmed!`);
      setSelectedService(null);
      setBookingDate(getMinDate());
      setBookingTime('09:00');

      // Refresh bookings list
      await refreshBookings();
    } catch (err) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm(`Cancel your ${booking.date} appointment?`)) return;
    try {
      await cancelBooking(booking.id);
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    } catch {
      setBookingError('Failed to cancel booking.');
    }
  };

  // ── Greeting ────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Active bookings (upcoming) vs history ─────
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const aptTime = b.appointmentTime ? new Date(b.appointmentTime) : null;
    return aptTime && aptTime >= now;
  });
  const pastBookings = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return true;
    const aptTime = b.appointmentTime ? new Date(b.appointmentTime) : null;
    return !aptTime || aptTime < now;
  });

  const getServiceTitle = (serviceId) => {
    const s = services.find((s) => s.id === serviceId);
    return s ? s.title : 'Service';
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
                <span className="hero-stat-value">{upcomingBookings.length}</span>
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

        {bookingsLoading ? (
          <div className="empty-state">
            <span className="empty-state-icon">⏳</span>
            <h3>Loading appointments...</h3>
          </div>
        ) : bookingsError ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <h3>Could not load appointments</h3>
            <p>{bookingsError}</p>
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="appointments-list">
            {upcomingBookings.map((apt) => (
              <div className="appointment-card" key={apt.id}>
                <div className={`appointment-status ${apt.status === 'CONFIRMED' ? 'confirmed' : 'pending'}`}>
                  {apt.statusIcon} {apt.statusLabel}
                </div>
                <div className="appointment-info">
                  <h3>{getServiceTitle(apt.serviceId)}</h3>
                  <p>
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time} — {apt.endTimeFormatted}</span>
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCancelBooking(apt)}
                >
                  Cancel
                </button>
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

        {/* Past bookings collapse */}
        {pastBookings.length > 0 && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{
              cursor: 'pointer',
              color: 'var(--text-light)',
              fontWeight: 600,
              fontSize: '0.85rem',
              padding: '8px 0',
            }}>
              Past Appointments ({pastBookings.length})
            </summary>
            <div className="appointments-list" style={{ marginTop: '8px' }}>
              {pastBookings.map((apt) => (
                <div className="appointment-card" key={apt.id} style={{ opacity: 0.75 }}>
                  <div className={`appointment-status ${
                    apt.status === 'CANCELLED' ? '' :
                    apt.status === 'COMPLETED' ? 'confirmed' : 'pending'
                  }`}>
                    {apt.statusIcon} {apt.statusLabel}
                  </div>
                  <div className="appointment-info">
                    <h3>{getServiceTitle(apt.serviceId)}</h3>
                    <p>
                      <span>📅 {apt.date}</span>
                      <span>⏰ {apt.time} — {apt.endTimeFormatted}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      {/* ── Services / Booking ──────────── */}
      <section className="panel" id="booking">
        <div className="section-heading">
          <p className="eyebrow">Treatments</p>
          <h2>Our Services</h2>
        </div>
        <div className="service-list">
          {servicesLoading ? (
            <div className="empty-state">
              <span className="empty-state-icon">⏳</span>
              <h3>Loading services...</h3>
              <p>Please wait while we fetch our available treatments.</p>
            </div>
          ) : servicesError ? (
            <div className="empty-state">
              <span className="empty-state-icon">⚠️</span>
              <h3>Could not load services</h3>
              <p>{servicesError}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setServicesLoading(true);
                  setServicesError(null);
                  fetchPublicServices()
                    .then(setServices)
                    .catch(() => setServicesError('Unable to load services. Please try again later.'))
                    .finally(() => setServicesLoading(false));
                }}
              >
                Try Again
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🧘</span>
              <h3>No services available yet</h3>
              <p>Check back soon for our full range of treatments.</p>
            </div>
          ) : (
            services.map((service) => (
              <article className={`service-card enhanced ${selectedService?.id === service.id ? 'active-service' : ''}`} key={service.id}>
                <div className="service-card-body">
                  <div className="service-card-icon">{service.icon}</div>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.time} &middot; {service.description}</p>
                  </div>
                </div>
                <div className="service-card-footer">
                  <span className="service-price">{service.price}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleBookNow(service)}
                  >
                    {selectedService?.id === service.id ? 'Selected' : 'Book Now'}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ── Booking Form ────────────────── */}
        <div id="booking-form-section" style={{ marginTop: '24px' }}>
          {bookingSuccess && (
            <div className="booking-success-banner">
              <span className="booking-success-icon">✅</span>
              <div className="booking-success-body">
                <strong>Booking Confirmed!</strong>
                <p>{bookingSuccess}</p>
              </div>
              <button
                className="booking-success-close"
                onClick={() => setBookingSuccess(null)}
              >
                ✕
              </button>
            </div>
          )}

          {!bookingSuccess && (
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="section-heading" style={{ marginBottom: '16px' }}>
                <p className="eyebrow">Reserve</p>
                <h2 style={{ fontSize: '1.3rem' }}>Book a Treatment</h2>
              </div>

              {bookingError && (
                <div className="booking-form-error">
                  <span>⚠️</span>
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="booking-form-grid">
                {/* Service */}
                <div className="booking-form-field">
                  <label>Selected Service</label>
                  <div className="booking-form-service-display">
                    {selectedService ? (
                      <>
                        <span className="booking-form-service-icon">{selectedService.icon}</span>
                        <div>
                          <strong>{selectedService.title}</strong>
                          <span>{selectedService.time} &middot; {selectedService.price}</span>
                        </div>
                      </>
                    ) : (
                      <span className="booking-form-placeholder">Choose a service above</span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="booking-form-field">
                  <label htmlFor="booking-date">Date</label>
                  <input
                    id="booking-date"
                    type="date"
                    value={bookingDate}
                    min={getMinDate()}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    disabled={!selectedService || bookingSubmitting}
                  />
                </div>

                {/* Time */}
                <div className="booking-form-field">
                  <label htmlFor="booking-time">Time</label>
                  <select
                    id="booking-time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    disabled={!selectedService || bookingSubmitting}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration & end time preview */}
              {selectedService && (
                <div className="booking-duration-preview">
                  <div className="booking-duration-item">
                    <span className="booking-duration-icon">⏱</span>
                    <div>
                      <span className="booking-duration-label">Duration</span>
                      <span className="booking-duration-value">{selectedService.time}</span>
                    </div>
                  </div>
                  <div className="booking-duration-arrow">→</div>
                  <div className="booking-duration-item">
                    <span className="booking-duration-icon">🏁</span>
                    <div>
                      <span className="booking-duration-label">End Time</span>
                      <span className="booking-duration-value">
                        {(() => {
                          const mins = parseInt(selectedService.time.match(/(\d+)/)?.[1] || '60', 10);
                          const [h, m] = bookingTime.split(':').map(Number);
                          const total = h * 60 + m + mins;
                          const eh = Math.floor(total / 60) % 24;
                          const em = total % 60;
                          return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="booking-form-actions">
                {selectedService && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setSelectedService(null);
                      setBookingError(null);
                    }}
                    disabled={bookingSubmitting}
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedService || bookingSubmitting}
                  style={{ minWidth: '160px', justifyContent: 'center' }}
                >
                  {bookingSubmitting ? (
                    <><span className="modal-spinner" /> Booking...</>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          )}
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
    </div>
  );
}
