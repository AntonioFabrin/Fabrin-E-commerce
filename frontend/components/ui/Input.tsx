import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3
          bg-zinc-800 border border-zinc-700
          text-zinc-100 placeholder-zinc-500
          rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </div>
  );
}
