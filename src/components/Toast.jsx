import { useState, useEffect, useCallback } from 'react';

const TOAST_ICONS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    setToast({ message, type, duration });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}

export function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      // Small delay so the CSS transition kicks in
      const showTimer = setTimeout(() => setVisible(true), 10);
      const hideTimer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          onDismiss();
          setVisible(false);
          setExiting(false);
        }, 300);
      }, toast.duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`toast toast-${toast.type} ${visible ? 'toast-visible' : ''} ${exiting ? 'toast-exiting' : ''}`}
      role="alert"
    >
      <span className="toast-icon">{TOAST_ICONS[toast.type] || TOAST_ICONS.info}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => {
        setExiting(true);
        setTimeout(() => {
          onDismiss();
          setVisible(false);
          setExiting(false);
        }, 300);
      }} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
