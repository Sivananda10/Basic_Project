import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 400); // +400 for exit animation
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — top right */}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 350);
  };

  const icon = toast.type === 'success' ? 'bi-check-circle-fill'
    : toast.type === 'error' ? 'bi-x-circle-fill'
    : 'bi-info-circle-fill';

  const accentColor = toast.type === 'success' ? '#06d6a0'
    : toast.type === 'error' ? '#f72585'
    : '#4361ee';

  return (
    <div className={`toast-item ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-body">
        <div className="toast-icon" style={{ color: accentColor }}>
          <i className={`bi ${icon}`} />
        </div>
        <span className="toast-msg">{toast.message}</span>
        <button className="toast-close" onClick={handleClose}>
          <i className="bi bi-x" />
        </button>
      </div>
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{
            background: accentColor,
            animationDuration: `${toast.duration}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
