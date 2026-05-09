import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="toast-icon success" />,
    error: <AlertCircle className="toast-icon error" />,
    info: <Info className="toast-icon info" />
  };

  return (
    <div className={`toast toast-${type} glass-panel`}>
      {icons[type]}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
