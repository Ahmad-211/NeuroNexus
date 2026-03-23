import { useEffect } from 'react';
import './Alert.css';

function Alert({ 
  type = 'success', 
  title = 'Success!', 
  message = '', 
  isOpen = false, 
  onClose,
  autoClose = true,
  duration = 3000 
}) {
  
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'i';
      default:
        return '✓';
    }
  };

  const getTypeClass = () => {
    return `alert-${type}`;
  };

  return (
    <>
      <div className="alert-overlay" onClick={onClose}></div>
      <div className={`alert-container ${getTypeClass()}`}>
        <div className="alert-icon">
          <span>{getIcon()}</span>
        </div>
        <h2 className="alert-title">{title}</h2>
        {message && <p className="alert-message">{message}</p>}
        {onClose && !autoClose && (
          <button className="alert-close-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </>
  );
}

export default Alert;
