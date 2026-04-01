'use client';

import React from 'react';

interface StarsProps {
  rating: number;       // ex: 4.3
  max?: number;         // padrão 5
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onSelect?: (rating: number) => void;
  hovered?: number;
  onHover?: (rating: number) => void;
  onLeave?: () => void;
}

export function Stars({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onSelect,
  hovered,
  onHover,
  onLeave,
}: StarsProps) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`} onMouseLeave={onLeave}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const active = hovered != null ? starValue <= hovered : starValue <= rating;
        const half = hovered == null && !Number.isInteger(rating) && starValue === Math.ceil(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelect?.(starValue)}
            onMouseEnter={() => interactive && onHover?.(starValue)}
            className={`
              leading-none transition-transform duration-100
              ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}
              ${active ? 'text-amber-400' : half ? 'text-amber-300' : 'text-zinc-700'}
            `}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

// Componente interativo para formulário de avaliação
export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = React.useState<number | undefined>(undefined);

  const labels = ['', 'Terrível', 'Ruim', 'Regular', 'Bom', 'Excelente'];

  return (
    <div className="flex flex-col items-center gap-2">
      <Stars
        rating={value}
        size="lg"
        interactive
        hovered={hovered}
        onSelect={onChange}
        onHover={setHovered}
        onLeave={() => setHovered(undefined)}
      />
      <p className={`text-sm font-semibold transition-colors ${
        hovered || value
          ? hovered ? 'text-amber-400' : 'text-amber-300'
          : 'text-zinc-600'
      }`}>
        {labels[hovered ?? value] || 'Selecione uma nota'}
      </p>
    </div>
  );
}
