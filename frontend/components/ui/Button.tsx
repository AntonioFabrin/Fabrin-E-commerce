import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    whiteSpace: 'nowrap' as const,
  },
  primary: {
    background: 'var(--violet)',
    color: '#F3E8FF',
  },
  secondary: {
    background: 'var(--plum)',
    color: '#E8D5FF',
  },
  outline: {
    background: 'transparent',
    color: 'var(--violet)',
    border: '1.5px solid var(--violet)',
  },
  ghost: {
    background: 'var(--mist)',
    color: 'var(--violet)',
  },
  danger: {
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1.5px solid #FECACA',
  },
  sm: { padding: '7px 18px', fontSize: 12 },
  md: { padding: '10px 24px', fontSize: 13 },
  lg: { padding: '13px 32px', fontSize: 14 },
  disabled: { opacity: 0.45, cursor: 'not-allowed' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  style = {},
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
      onMouseEnter={e => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'primary') el.style.background = 'var(--grape)';
        if (variant === 'secondary') el.style.background = '#1A0A2E';
        if (variant === 'outline') { el.style.background = 'var(--mist)'; }
        if (variant === 'ghost') el.style.background = '#E5DBFF';
        if (variant === 'danger') el.style.background = '#FEE2E2';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'primary') el.style.background = 'var(--violet)';
        if (variant === 'secondary') el.style.background = 'var(--plum)';
        if (variant === 'outline') el.style.background = 'transparent';
        if (variant === 'ghost') el.style.background = 'var(--mist)';
        if (variant === 'danger') el.style.background = '#FEF2F2';
        el.style.transform = 'translateY(0)';
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      {...props}
    />
  );
}
