import React from 'react';

const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px',
      textAlign: 'center',
      border: '1px dashed rgba(255,255,255,0.1)',
      borderRadius: '8px',
      background: 'rgba(0,0,0,0.2)'
    }}>
      {Icon && <Icon size={48} style={{ color: 'var(--color-gold)', opacity: 0.5, marginBottom: '16px' }} />}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: actionText ? '24px' : '0', maxWidth: '400px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
