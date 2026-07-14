import { useState, useEffect, useCallback } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { AddServiceModal } from './AddServiceModal';
import { ServiceDetailModal } from './ServiceDetailModal';
import { StaffManagementModal } from './StaffManagementModal';
import { services as initialServices, initialMessages } from '../data/constants';
import { fetchServices, createService, updateService, deleteService, fetchStaff, createStaff, updateStaff, deleteStaff } from '../utils/api';

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

const initialStaffMembers = [
  { id: 'st1', name: 'Sofia', role: 'Massage Therapist', rating: 4.9, clients: 128, image: '👩', avatar: '👩', email: 'sofia@serenity.com', phone: '+1 (555) 101-1001', specialty: 'Deep tissue & sports massage' },
  { id: 'st2', name: 'Luna', role: 'Esthetician', rating: 4.8, clients: 96, image: '👩', avatar: '👩', email: 'luna@serenity.com', phone: '+1 (555) 101-1002', specialty: 'Organic facials & chemical peels' },
  { id: 'st3', name: 'Marco', role: 'Hairstylist', rating: 4.7, clients: 74, image: '👨', avatar: '👨', email: 'marco@serenity.com', phone: '+1 (555) 101-1003', specialty: 'Precision cuts & color treatment' },
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
  const [services, setServices] = useState(initialServices);
  const [staffMembers, setStaffMembers] = useState(initialStaffMembers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [notification, setNotification] = useState(null);

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

  // Fetch services from backend on mount
  const loadServices = useCallback(async () => {
    try {
      const data = await fetchServices();
      if (data.length > 0) setServices(data);
    } catch {
      // Backend unavailable — keep the initial/fallback services
    }
  }, []);

  // Fetch staff from backend on mount
  const loadStaff = useCallback(async () => {
    try {
      const data = await fetchStaff();
      if (data.length > 0) {
        // Merge API data with existing local state to preserve fields
        // the backend doesn't return (phone, specialty, avatar, etc.)
        setStaffMembers((prev) =>
          data.map((apiStaff) => {
            const existing = prev.find((s) => s.id === apiStaff.id);
            return existing ? { ...existing, ...apiStaff } : apiStaff;
          })
        );
      }
    } catch {
      // Backend unavailable — keep the initial/fallback staff
    }
  }, []);

  useEffect(() => {
    loadServices();
    loadStaff();
  }, [loadServices, loadStaff]);

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return '✓ Confirmed';
      case 'checked-in': return '🟢 Checked In';
      case 'pending': return '⏳ Pending';
      default: return status;
    }
  };

  const totalRevenue = services.reduce((sum, s) => sum + (parseInt((s.price || '').replace(/[^0-9]/g, ''), 10) || 0), 0);
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
          </div>            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add Service</button>
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
            <div className="owner-table-row" key={service.id || service.title}>
              <span className="owner-table-client">
                <span className="owner-service-icon">
                  {service.icon || '🌟'}
                </span>
                {service.title}
              </span>
              <span className="owner-table-time">{service.time}</span>
              <span className="owner-table-price">{service.price}</span>
              <span><span className="owner-status owner-status-confirmed">✓ Active</span></span>
              <span className="owner-table-actions">
                <button className="owner-action-btn" title="View details" onClick={() => setViewingService(service)}>👁️</button>
                <button className="owner-action-btn" title="Edit service" onClick={() => setEditingService(service)}>✏️</button>
                <button className="owner-action-btn" title="Delete service" onClick={() => setDeletingService(service)}>🗑️</button>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Staff Roster ────────────────── */}
      {/* ── Staff Roster ────────────────── */}
      <section className="panel" id="owner-staff">
        <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">Team</p>
            <h2>Staff Roster</h2>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowStaffModal(true)}>+ Add Staff</button>
        </div>
        <div className="owner-staff-grid">
          {staffMembers.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <span className="empty-state-icon">👥</span>
              <h3>No staff members yet</h3>
              <p>Add your first team member to get started.</p>
              <button className="btn btn-primary" onClick={() => setShowStaffModal(true)}>+ Add Staff Member</button>
            </div>
          ) : (
            staffMembers.map((staff) => (
              <div className="owner-staff-card" key={staff.id}>
                <div className="owner-staff-card-actions">
                  <button
                    className="owner-action-btn"
                    title="Edit staff member"
                    onClick={() => setEditingStaff(staff)}
                  >
                    ✏️
                  </button>
                  <button
                    className="owner-action-btn"
                    title="Remove staff member"
                    onClick={() => setDeletingStaff(staff)}
                  >
                    🗑️
                  </button>
                </div>
                <div className="owner-staff-avatar">{staff.image || staff.avatar}</div>
                <h3>{staff.name}</h3>
                <p className="owner-staff-role">{staff.role}</p>
                {staff.specialty && (
                  <p className="owner-staff-specialty">{staff.specialty}</p>
                )}
                <div className="owner-staff-stats">
                  <div>
                    <span className="owner-staff-stat-value">{staff.rating || '—'}</span>
                    <span className="owner-staff-stat-label">Rating</span>
                  </div>
                  <div>
                    <span className="owner-staff-stat-value">{staff.clients || '—'}</span>
                    <span className="owner-staff-stat-label">Clients</span>
                  </div>
                  <div>
                    <span className="owner-staff-stat-value">95%</span>
                    <span className="owner-staff-stat-label">Satisfaction</span>
                  </div>
                </div>
                {(staff.email || staff.phone) && (
                  <div className="owner-staff-contact">
                    {staff.email && (
                      <span className="owner-staff-contact-item">
                        <span className="owner-staff-contact-icon">✉️</span>
                        {staff.email}
                      </span>
                    )}
                    {staff.phone && (
                      <span className="owner-staff-contact-item">
                        <span className="owner-staff-contact-icon">📞</span>
                        {staff.phone}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
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
      {/* ── Notification ──────────────────── */}
      {notification && (
        <div className={`owner-notification owner-notification-${notification.type}`}>
          <span className="owner-notification-icon">
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="owner-notification-msg">{notification.message}</span>
          <button className="owner-notification-close" onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* ── Add Service Modal ────────────── */}
      {/* ── Add / Edit Service Modal ────── */}
      <AddServiceModal
        isOpen={showAddModal || !!editingService}
        onClose={() => {
          setShowAddModal(false);
          setEditingService(null);
        }}
        editService={editingService}
        onAdd={async (newService) => {
          try {
            const created = await createService(newService);
            setServices((prev) => [...prev, created]);
            setNotification({ type: 'success', message: `"${created.title}" has been added to your services.` });
          } catch (err) {
            setNotification({ type: 'error', message: err.message || 'Failed to add service.' });
          }
        }}
        onEdit={async (updatedService) => {
          try {
            const saved = await updateService(updatedService.id, updatedService);
            setServices((prev) =>
              prev.map((s) => (s.id === saved.id ? saved : s))
            );
            setNotification({ type: 'success', message: `"${saved.title}" has been updated.` });
          } catch (err) {
            setNotification({ type: 'error', message: err.message || 'Failed to update service.' });
          }
        }}
      />

      {/* ── Delete Confirmation ─────────── */}
      {deletingService && (
        <div className="modal-overlay" onClick={() => setDeletingService(null)}>
          <div
            className="modal-container confirm-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="modal-accent confirm-accent" />
            <div className="confirm-body">
              <span className="confirm-icon">🗑️</span>
              <h3 id="confirm-title" className="confirm-title">Delete Service?</h3>
              <p className="confirm-message">
                Are you sure you want to remove <strong>"{deletingService.title}"</strong>?
                This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn btn-ghost confirm-cancel"
                  onClick={() => setDeletingService(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn confirm-delete"
                  onClick={async () => {
                    const serviceToDelete = deletingService;
                    setDeletingService(null);
                    try {
                      await deleteService(serviceToDelete.id);
                      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
                      setNotification({ type: 'success', message: `"${serviceToDelete.title}" has been removed.` });
                    } catch (err) {
                      setNotification({ type: 'error', message: err.message || 'Failed to delete service.' });
                    }
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Service Detail Modal ────── */}
      {/* ── Staff Management Modal ────────── */}
      <StaffManagementModal
        isOpen={showStaffModal || !!editingStaff}
        onClose={() => {
          setShowStaffModal(false);
          setEditingStaff(null);
        }}
        editStaff={editingStaff}
        onAdd={async (newStaff) => {
          const created = await createStaff(newStaff);
          setStaffMembers((prev) => [...prev, created]);
          setNotification({ type: 'success', message: `"${created.name || newStaff.name}" has been added to your team.` });
        }}
        onEdit={async (updatedStaff) => {
          const saved = await updateStaff(updatedStaff.id, updatedStaff);
          setStaffMembers((prev) =>
            prev.map((s) => (s.id === saved.id ? saved : s))
          );
          setNotification({ type: 'success', message: `"${saved.name}" has been updated.` });
        }}
      />

      {/* ── Delete Staff Confirmation ───── */}
      {deletingStaff && (
        <div className="modal-overlay" onClick={() => setDeletingStaff(null)}>
          <div
            className="modal-container confirm-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-staff-title"
          >
            <div className="modal-accent confirm-accent" />
            <div className="confirm-body">
              <span className="confirm-icon">👋</span>
              <h3 id="confirm-staff-title" className="confirm-title">Remove Staff Member?</h3>
              <p className="confirm-message">
                Are you sure you want to remove <strong>"{deletingStaff.name}"</strong> from your team?
                This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn btn-ghost confirm-cancel"
                  onClick={() => setDeletingStaff(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn confirm-delete"
                  onClick={async () => {
                    const staffToDelete = deletingStaff;
                    setDeletingStaff(null);
                    try {
                      await deleteStaff(staffToDelete.id);
                      setStaffMembers((prev) => prev.filter((s) => s.id !== staffToDelete.id));
                      setNotification({ type: 'success', message: `"${staffToDelete.name}" has been removed from your team.` });
                    } catch (err) {
                      // Fallback — remove locally
                      setStaffMembers((prev) => prev.filter((s) => s.id !== staffToDelete.id));
                      setNotification({ type: 'success', message: `"${staffToDelete.name}" has been removed locally (API unavailable).` });
                    }
                  }}
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Service Detail Modal ────── */}
      <ServiceDetailModal
        isOpen={!!viewingService}
        onClose={() => setViewingService(null)}
        service={viewingService}
        onEdit={(service) => {
          setViewingService(null);
          // Wait for detail modal close animation before opening edit modal
          setTimeout(() => setEditingService(service), 300);
        }}
      />
    </div>
  );
}
