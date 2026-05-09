import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
        {isDestructive && (
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(139, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
            <AlertTriangle size={30} />
          </div>
        )}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
          <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>{cancelText}</button>
          <button 
            className="btn-primary" 
            onClick={() => { onConfirm(); onClose(); }} 
            style={{ flex: 1, background: isDestructive ? 'var(--color-danger)' : 'var(--color-gold)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
