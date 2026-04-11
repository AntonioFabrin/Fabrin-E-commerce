'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}

// ── Estilos por tipo ───────────────────────────────────────────────────────────
const styles: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', icon: '✓' },
  error:   { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: '✕' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: '⚠' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB', icon: 'ℹ' },
};

// ── Item de toast ──────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const s = styles[toast.type];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Anima entrada
    const t1 = setTimeout(() => setVisible(true), 10);
    // Anima saída antes de remover
    const t2 = setTimeout(() => setVisible(false), 3500);
    const t3 = setTimeout(() => onRemove(toast.id), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 16px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.color}`,
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        minWidth: 260, maxWidth: 360,
        fontSize: 13, color: '#1a0a2e',
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        cursor: 'default',
      }}
    >
      <span style={{
        flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
        background: s.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
      }}>
        {s.icon}
      </span>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          flexShrink: 0, background: 'none', border: 'none',
          cursor: 'pointer', color: '#aaa', fontSize: 14, lineHeight: 1,
          padding: '0 0 0 4px',
        }}
      >✕</button>
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────────────────────────
let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const value: ToastContextValue = {
    toast:   show,
    success: (m) => show(m, 'success'),
    error:   (m) => show(m, 'error'),
    warning: (m) => show(m, 'warning'),
    info:    (m) => show(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container fixo no canto inferior direito */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 9999, pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
