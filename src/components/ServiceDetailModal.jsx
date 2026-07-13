import { useEffect, useRef } from 'react';
import { SERVICE_CATEGORIES } from '../data/constants';

export function ServiceDetailModal({ isOpen, onClose, service, onEdit }) {
  const modalRef = useRef(null);

  // Find category info
  const category = SERVICE_CATEGORIES.find(
    (c) => c.value === service?.category || c.icon === service?.icon
  ) || SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container detail-modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
      >
        <div className="modal-accent" />

        {/* Header with close */}
        <div className="detail-modal-header">
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Hero Section */}
        <div className="detail-hero">
          <div className="detail-hero-icon-wrapper">
            <span className="detail-hero-icon">{category.icon}</span>
          </div>
          <h2 id="detail-modal-title" className="detail-hero-title">{service.title}</h2>
          <div className="detail-hero-badges">
            <span className="detail-badge detail-badge-time">⏱ {service.time}</span>
            <span className="detail-badge detail-badge-price">{service.price}</span>
            <span className="detail-badge detail-badge-status">✓ Active</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="detail-body">
          <div className="detail-info-grid">
            <div className="detail-info-card">
              <span className="detail-info-icon">📂</span>
              <div className="detail-info-text">
                <span className="detail-info-label">Category</span>
                <span className="detail-info-value">{category.label}</span>
              </div>
            </div>

            <div className="detail-info-card">
              <span className="detail-info-icon">⏱️</span>
              <div className="detail-info-text">
                <span className="detail-info-label">Duration</span>
                <span className="detail-info-value">{service.time}</span>
              </div>
            </div>

            <div className="detail-info-card">
              <span className="detail-info-icon">💰</span>
              <div className="detail-info-text">
                <span className="detail-info-label">Price</span>
                <span className="detail-info-value">{service.price}</span>
              </div>
            </div>

            <div className="detail-info-card">
              <span className="detail-info-icon">📊</span>
              <div className="detail-info-text">
                <span className="detail-info-label">Status</span>
                <span className="detail-info-value detail-status-active">Active</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-description">
              {service.description || (
                <span className="detail-description-empty">
                  No description provided for this service.
                </span>
              )}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="detail-section">
            <h3 className="detail-section-title">Service Stats</h3>
            <div className="detail-stats-row">
              <div className="detail-stat-item">
                <span className="detail-stat-number">0</span>
                <span className="detail-stat-label">Bookings<br/>This Week</span>
              </div>
              <div className="detail-stat-item">
                <span className="detail-stat-number">0</span>
                <span className="detail-stat-label">Total<br/>Bookings</span>
              </div>
              <div className="detail-stat-item">
                <span className="detail-stat-number">—</span>
                <span className="detail-stat-label">Avg.<br/>Rating</span>
              </div>
              <div className="detail-stat-item">
                <span className="detail-stat-number">New</span>
                <span className="detail-stat-label">Est.<br/>Month Ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="detail-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(service);
            }}
          >
            ✏️ Edit Service
          </button>
        </div>
      </div>
    </div>
  );
}
