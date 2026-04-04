import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, style = {}, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '11px 16px',
          background: '#F9F5FF',
          border: `1.5px solid ${error ? '#FECACA' : 'var(--mist)'}`,
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          color: 'var(--ink)',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          transition: 'all 0.2s',
          ...style,
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--violet)';
          e.target.style.background = '#FFFFFF';
          e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#FECACA' : 'var(--mist)';
          e.target.style.background = '#F9F5FF';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#DC2626' }}>{error}</span>}
    </div>
  );
}
