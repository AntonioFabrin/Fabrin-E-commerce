import React from 'react';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}
