import { useState, useEffect, useRef } from 'react';
import { SERVICE_CATEGORIES } from '../data/constants';

const STAFF_ROLES = [
  { value: 'massage-therapist', label: 'Massage Therapist', icon: '💆' },
  { value: 'esthetician', label: 'Esthetician', icon: '✨' },
  { value: 'hairstylist', label: 'Hairstylist', icon: '💇' },
  { value: 'nail-technician', label: 'Nail Technician', icon: '💅' },
  { value: 'manager', label: 'Manager', icon: '👔' },
  { value: 'receptionist', label: 'Receptionist', icon: '📞' },
  { value: 'assistant', label: 'Assistant', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '🌟' },
];

const AVATAR_OPTIONS = ['👩', '👨', '🧑', '👩‍🦰', '👨‍🦱', '🧑‍🦳', '👩‍🦳', '👨‍🦲', '🧑‍🦱', '👩‍🦱'];

export function StaffManagementModal({ isOpen, onClose, onAdd, onEdit, editStaff }) {
  const isEditMode = !!editStaff;

  const defaultForm = {
    firstName: '',
    lastName: '',
    role: 'massage-therapist',
    email: '',
    phone: '',
    specialty: '',
    serviceCategories: [],
    avatar: '👩',
    username: '',
    password: '',
    confirmPassword: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentialPasswords, setShowCredentialPasswords] = useState({ password: false, confirm: false });
  const firstNameRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen && editStaff) {
      const matchedRole = STAFF_ROLES.find(
        (r) => r.label === editStaff.role || r.value === editStaff.role
      );
      const fullName = (editStaff.name || '').trim();
      const spaceIdx = fullName.indexOf(' ');
      const first = spaceIdx === -1 ? fullName : fullName.slice(0, spaceIdx);
      const last = spaceIdx === -1 ? '' : fullName.slice(spaceIdx + 1);
      setForm({
        firstName: first,
        lastName: last,
        role: matchedRole?.value || editStaff.role || 'other',
        email: editStaff.email || '',
        phone: editStaff.phone || '',
        specialty: editStaff.specialty || '',
        serviceCategories: editStaff.serviceCategories || [],
        avatar: editStaff.avatar || editStaff.image || '👩',
        username: editStaff.username || '',
        password: '',
        confirmPassword: '',
      });
    } else if (isOpen && !editStaff) {
      setForm(defaultForm);
    }
    setErrors({});
    setApiError(null);
  }, [isOpen, editStaff]);

  useEffect(() => {
    if (isOpen && firstNameRef.current) {
      const timer = setTimeout(() => firstNameRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Trap focus and handle Escape
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

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!form.role) {
      newErrors.role = 'Role is required';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (form.phone && !/^[\d\s\-().+]{7,20}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!isEditMode) {
      if (!form.username.trim()) {
        newErrors.username = 'Login username is required';
      } else if (form.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

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
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    const selectedRole = STAFF_ROLES.find((r) => r.value === form.role);
    const staffData = {
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      role: selectedRole?.label || form.role,
      roleValue: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      specialty: form.specialty.trim(),
      serviceCategories: form.serviceCategories,
      avatar: form.avatar,
      image: form.avatar,
      rating: editStaff?.rating || 0,
      clients: editStaff?.clients || 0,
      username: form.username.trim() || undefined,
      password: form.password || undefined,
    };

    try {
      if (isEditMode && onEdit) {
        await onEdit({ ...staffData, id: editStaff.id });
      } else if (onAdd) {
        await onAdd(staffData);
      }
      setForm(defaultForm);
      setErrors({});
      setApiError(null);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setForm(defaultForm);
    setErrors({});
    setApiError(null);
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
        aria-labelledby="staff-modal-title"
      >
        <div className="modal-accent" />

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <span className="modal-header-icon">{isEditMode ? '✏️' : '👥'}</span>
            <div>
              <h2 id="staff-modal-title">{isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <p className="modal-header-subtitle">
                {isEditMode ? 'Update team member details' : 'Add a new member to your team'}
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

          {/* API Error Banner */}
          {apiError && (
            <div className="modal-api-error" role="alert">
              <span className="modal-api-error-icon">❌</span>
              <div className="modal-api-error-body">
                <span className="modal-api-error-title">Failed to {isEditMode ? 'update' : 'add'} staff member</span>
                <span className="modal-api-error-msg">{apiError}</span>
              </div>
              <button
                type="button"
                className="modal-api-error-close"
                onClick={() => setApiError(null)}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Avatar Picker */}
          <div className="modal-field">
            <label>Avatar</label>
            <div className="staff-avatar-picker">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`staff-avatar-option ${form.avatar === emoji ? 'active' : ''}`}
                  onClick={() => handleChange('avatar', emoji)}
                  disabled={isSubmitting}
                  aria-label={`Select avatar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name — First & Last */}
          <div className="modal-row">
            <div className={`modal-field ${errors.firstName ? 'modal-field-error' : ''}`}>
              <label htmlFor="staff-first-name">
                First Name <span className="modal-required">*</span>
              </label>
              <input
                ref={firstNameRef}
                id="staff-first-name"
                type="text"
                placeholder="e.g. Sofia"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                disabled={isSubmitting}
                autoComplete="given-name"
              />
              {errors.firstName && <span className="modal-field-msg">{errors.firstName}</span>}
            </div>

            <div className={`modal-field ${errors.lastName ? 'modal-field-error' : ''}`}>
              <label htmlFor="staff-last-name">
                Last Name <span className="modal-required">*</span>
              </label>
              <input
                id="staff-last-name"
                type="text"
                placeholder="e.g. Martinez"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                disabled={isSubmitting}
                autoComplete="family-name"
              />
              {errors.lastName && <span className="modal-field-msg">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email & Phone row */}
          <div className="modal-row">
            <div className={`modal-field ${errors.email ? 'modal-field-error' : ''}`}>
              <label htmlFor="staff-email">
                Email <span className="modal-optional">(optional)</span>
              </label>
              <input
                id="staff-email"
                type="email"
                placeholder="sofia@serenity.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
                readOnly={isEditMode}
                autoComplete="email"
                className={isEditMode ? 'readonly-field' : ''}
              />
              {errors.email && <span className="modal-field-msg">{errors.email}</span>}
            </div>

            <div className={`modal-field ${errors.phone ? 'modal-field-error' : ''}`}>
              <label htmlFor="staff-phone">
                Phone <span className="modal-optional">(optional)</span>
              </label>
              <input
                id="staff-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isSubmitting}
                readOnly={isEditMode}
                autoComplete="tel"
                className={isEditMode ? 'readonly-field' : ''}
              />
              {errors.phone && <span className="modal-field-msg">{errors.phone}</span>}
            </div>
          </div>

          {/* Role */}
          <div className={`modal-field ${errors.role ? 'modal-field-error' : ''}`}>
            <label>
              Role <span className="modal-required">*</span>
            </label>
            <div className="staff-role-grid">
              {STAFF_ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`staff-role-chip ${form.role === role.value ? 'active' : ''}`}
                  onClick={() => handleChange('role', role.value)}
                  disabled={isSubmitting}
                >
                  <span className="staff-role-chip-icon">{role.icon}</span>
                  <span className="staff-role-chip-label">{role.label}</span>
                </button>
              ))}
            </div>
            {errors.role && <span className="modal-field-msg">{errors.role}</span>}
          </div>

          {/* Service Categories */}
          <div className="modal-field">
            <label>
              Service Categories <span className="modal-optional">(optional)</span>
            </label>
            <div className="modal-category-grid">
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = form.serviceCategories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    className={`modal-category-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      const updated = isSelected
                        ? form.serviceCategories.filter((v) => v !== cat.value)
                        : [...form.serviceCategories, cat.value];
                      handleChange('serviceCategories', updated);
                    }}
                    disabled={isSubmitting}
                  >
                    <span className="modal-category-icon">{cat.icon}</span>
                    <span className="modal-category-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specialty */}
          <div className="modal-field">
            <label htmlFor="staff-specialty">
              Specialty <span className="modal-optional">(optional)</span>
            </label>
            <input
              id="staff-specialty"
              type="text"
              placeholder="e.g. Deep tissue & sports massage"
              value={form.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          {/* ── Login Credentials ──────────────── */}
          {!isEditMode && (
            <>
              <div className="modal-divider">
                <span className="modal-divider-line" />
                <span className="modal-divider-label">Login Credentials</span>
                <span className="modal-divider-line" />
              </div>

              <div className={`modal-field ${errors.username ? 'modal-field-error' : ''}`}>
                <label htmlFor="staff-username">
                  Username <span className="modal-required">*</span>
                </label>
                <input
                  id="staff-username"
                  type="text"
                  placeholder="e.g. sofia.martinez"
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                {errors.username && <span className="modal-field-msg">{errors.username}</span>}
              </div>

              <div className="modal-row">
                <div className={`modal-field ${errors.password ? 'modal-field-error' : ''}`}>
                  <label htmlFor="staff-password">
                    Password <span className="modal-required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="staff-password"
                      type={showCredentialPasswords.password ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCredentialPasswords((prev) => ({ ...prev, password: !prev.password }))}
                      aria-label={showCredentialPasswords.password ? 'Hide password' : 'Show password'}
                    >
                      {showCredentialPasswords.password ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <span className="modal-field-msg">{errors.password}</span>}
                </div>

                <div className={`modal-field ${errors.confirmPassword ? 'modal-field-error' : ''}`}>
                  <label htmlFor="staff-confirm-password">
                    Confirm Password <span className="modal-required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="staff-confirm-password"
                      type={showCredentialPasswords.confirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCredentialPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      aria-label={showCredentialPasswords.confirm ? 'Hide password' : 'Show password'}
                    >
                      {showCredentialPasswords.confirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="modal-field-msg">{errors.confirmPassword}</span>}
                </div>
              </div>
            </>
          )}

          {/* Preview */}
          {(form.firstName.trim() || form.lastName.trim()) && (
            <div className="modal-preview">
              <span className="modal-preview-label">Preview</span>
              <div className="modal-preview-card staff-preview-card">
                <span className="staff-preview-avatar">{form.avatar}</span>
                <div className="modal-preview-info">
                  <strong>{`${form.firstName.trim()} ${form.lastName.trim()}`.trim()}</strong>
                  <span>{STAFF_ROLES.find((r) => r.value === form.role)?.label || form.role}</span>
                  {form.serviceCategories.length > 0 && (
                    <span className="staff-preview-categories">
                      {form.serviceCategories.map((v) =>
                        SERVICE_CATEGORIES.find((c) => c.value === v)?.icon
                      ).join(' ')}
                    </span>
                  )}
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
                <>{isEditMode ? '💾 Save Changes' : '➕ Add Member'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
