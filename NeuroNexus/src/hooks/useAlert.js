import { useState } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = ({ type = 'success', title, message, duration = 3000 }) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      duration,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Convenience methods for different alert types
  const showSuccess = (title, message, duration) => {
    showAlert({ type: 'success', title, message, duration });
  };

  const showError = (title, message, duration) => {
    showAlert({ type: 'error', title, message, duration });
  };

  const showWarning = (title, message, duration) => {
    showAlert({ type: 'warning', title, message, duration });
  };

  const showInfo = (title, message, duration) => {
    showAlert({ type: 'info', title, message, duration });
  };

  return {
    alert,
    showAlert,
    closeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
