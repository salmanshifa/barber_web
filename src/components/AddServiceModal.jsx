import { useState, useEffect, useRef } from 'react';
import { SERVICE_CATEGORIES } from '../data/constants';

const DURATION_OPTIONS = [
  '15 min', '30 min', '45 min', '60 min',
  '75 min', '90 min', '105 min', '120 min',
];

const PRICE_PRESETS = ['$45', '$55', '$65', '$75', '$85', '$95', '$120', '$150', '$200'];

export function AddServiceModal({ isOpen, onClose, onAdd, onEdit, editService }) {
  const isEditMode = !!editService;

  const defaultForm = {
    title: '',
    time: '60 min',
    price: '$85',
    category: 'massage',
    description: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize form when opening in edit mode
  useEffect(() => {
    if (isOpen && editService) {
      // Map the service data to form fields
      const category = editService.category || 'other';
      const matchedCat = SERVICE_CATEGORIES.find(
        (c) => c.value === category || c.icon === editService.icon
      );
      setForm({
        title: editService.title || '',
        time: editService.time || '60 min',
        price: editService.price || '$85',
        category: matchedCat?.value || 'other',
        description: editService.description || '',
      });
    } else if (isOpen && !editService) {
      // Reset form for add mode
      setForm(defaultForm);
    }
    setErrors({});
  }, [isOpen, editService]);

  useEffect(() => {
    if (isOpen && nameRef.current) {
      const timer = setTimeout(() => nameRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Service name is required';
    } else if (form.title.trim().length < 3) {
      newErrors.title = 'Service name must be at least 3 characters';
    }
    if (!form.time) newErrors.time = 'Duration is required';
    if (!form.price) newErrors.price = 'Price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const category = SERVICE_CATEGORIES.find((c) => c.value === form.category);
    const serviceData = {
      title: form.title.trim(),
      time: form.time,
      price: form.price,
      category: form.category,
      icon: category?.icon || '🌟',
      description: form.description.trim(),
    };

    setTimeout(() => {
      if (isEditMode && onEdit) {
        onEdit({ ...serviceData, id: editService.id });
      } else if (onAdd) {
        onAdd(serviceData);
      }
      setForm(defaultForm);
      setErrors({});
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div
        className="modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-accent" />

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <span className="modal-header-icon">{isEditMode ? '✏️' : '📋'}</span>
            <div>
              <h2 id="modal-title">{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
              <p className="modal-header-subtitle">
                {isEditMode ? 'Update treatment details' : 'Expand your treatment menu'}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleCancel}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Service Name */}
          <div className={`modal-field ${errors.title ? 'modal-field-error' : ''}`}>
            <label htmlFor="service-name">
              Service Name <span className="modal-required">*</span>
            </label>
            <input
              ref={nameRef}
              id="service-name"
              type="text"
              placeholder="e.g. Deep Tissue Massage"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
            />
            {errors.title && <span className="modal-field-msg">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className="modal-field">
            <label>
              Category <span className="modal-required">*</span>
            </label>
            <div className="modal-category-grid">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`modal-category-chip ${form.category === cat.value ? 'active' : ''}`}
                  onClick={() => handleChange('category', cat.value)}
                  disabled={isSubmitting}
                >
                  <span className="modal-category-icon">{cat.icon}</span>
                  <span className="modal-category-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Price row */}
          <div className="modal-row">
            <div className={`modal-field ${errors.time ? 'modal-field-error' : ''}`}>
              <label htmlFor="service-duration">
                Duration <span className="modal-required">*</span>
              </label>
              <select
                id="service-duration"
                value={form.time}
                onChange={(e) => handleChange('time', e.target.value)}
                disabled={isSubmitting}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.time && <span className="modal-field-msg">{errors.time}</span>}
            </div>

            <div className={`modal-field ${errors.price ? 'modal-field-error' : ''}`}>
              <label htmlFor="service-price">
                Price <span className="modal-required">*</span>
              </label>
              <div className="modal-price-wrapper">
                <span className="modal-price-prefix">$</span>
                <select
                  id="service-price"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  disabled={isSubmitting}
                  className="modal-price-select"
                >
                  {PRICE_PRESETS.map((opt) => (
                    <option key={opt} value={opt}>{opt.replace('$', '')}</option>
                  ))}
                </select>
              </div>
              {errors.price && <span className="modal-field-msg">{errors.price}</span>}
            </div>
          </div>

          {/* Description (optional) */}
          <div className="modal-field">
            <label htmlFor="service-desc">
              Description <span className="modal-optional">(optional)</span>
            </label>
            <textarea
              id="service-desc"
              placeholder="Brief description of this treatment..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          {/* Preview */}
          {form.title.trim() && (
            <div className="modal-preview">
              <span className="modal-preview-label">Preview</span>
              <div className="modal-preview-card">
                <span className="modal-preview-icon">
                  {SERVICE_CATEGORIES.find((c) => c.value === form.category)?.icon || '🌟'}
                </span>
                <div className="modal-preview-info">
                  <strong>{form.title.trim()}</strong>
                  <span>{form.time} • {form.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost modal-btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary modal-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="modal-spinner" />
                  {isEditMode ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                <>{isEditMode ? '💾 Save Changes' : '➕ Add Service'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
