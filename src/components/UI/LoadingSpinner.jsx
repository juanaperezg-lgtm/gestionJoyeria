import React from 'react';

const LoadingSpinner = ({ size = 40 }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '3px solid rgba(212, 175, 55, 0.2)',
          borderTopColor: 'var(--color-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
