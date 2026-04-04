'use client';
import React from 'react';

interface StarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onSelect?: (rating: number) => void;
  hovered?: number;
  onHover?: (rating: number) => void;
  onLeave?: () => void;
}

export function Stars({ rating, max = 5, size = 'md', interactive = false, onSelect, hovered, onHover, onLeave }: StarsProps) {
  const px = { sm: 14, md: 18, lg: 26 }[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }} onMouseLeave={onLeave}>
      {Array.from({ length: max }).map((_, i) => {
        const val = i + 1;
        const active = hovered != null ? val <= hovered : val <= rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelect?.(val)}
            onMouseEnter={() => interactive && onHover?.(val)}
            style={{
              fontSize: px,
              lineHeight: 1,
              background: 'none',
              border: 'none',
              padding: '0 1px',
              cursor: interactive ? 'pointer' : 'default',
              color: active ? '#F59E0B' : '#D1C4E9',
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => { if (interactive) (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >★</button>
        );
      })}
    </div>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = React.useState<number | undefined>(undefined);
  const labels = ['', 'Terrível', 'Ruim', 'Regular', 'Bom', 'Excelente'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Stars
        rating={value} size="lg" interactive
        hovered={hovered}
        onSelect={onChange}
        onHover={setHovered}
        onLeave={() => setHovered(undefined)}
      />
      <p style={{
        fontSize: 13, fontWeight: 600,
        color: (hovered || value) ? '#D97706' : 'var(--muted)',
        minHeight: 20, transition: 'color 0.2s',
      }}>
        {labels[hovered ?? value] || 'Selecione uma nota'}
      </p>
    </div>
  );
}
