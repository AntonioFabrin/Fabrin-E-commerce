import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-900/30',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-900/30',
    danger:
      'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-lg shadow-rose-900/30',
    outline:
      'border border-zinc-600 text-zinc-300 hover:border-indigo-500 hover:text-indigo-400 bg-transparent',
    ghost:
      'text-zinc-400 hover:text-white hover:bg-zinc-800 bg-transparent',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg
        transition-all duration-200
        w-full disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    />
  );
}
