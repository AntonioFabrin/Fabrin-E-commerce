'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';

export default function CartHeaderIcon() {
  const { totalItems } = useCart();
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/cart')}
      title="Carrinho"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: totalItems > 0 ? 'rgba(124,58,237,0.25)' : 'rgba(196,160,255,0.1)',
        border: '1px solid rgba(196,160,255,0.2)',
        borderRadius: 'var(--radius-pill)',
        padding: '7px 16px',
        color: totalItems > 0 ? '#E8D5FF' : '#9D7EC9',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.35)';
        (e.currentTarget as HTMLElement).style.color = '#F3E8FF';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = totalItems > 0 ? 'rgba(124,58,237,0.25)' : 'rgba(196,160,255,0.1)';
        (e.currentTarget as HTMLElement).style.color = totalItems > 0 ? '#E8D5FF' : '#9D7EC9';
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      {totalItems > 0 ? `${totalItems} ite${totalItems > 1 ? 'ns' : 'm'}` : 'Carrinho'}
    </button>
  );
}
