import React from 'react';

export function Card({
  children,
  className = '',
  style = {},
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        transition: hover ? 'all 0.25s' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--lilac)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.10)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hover ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      } : undefined}
    >
      {children}
    </div>
  );
}
