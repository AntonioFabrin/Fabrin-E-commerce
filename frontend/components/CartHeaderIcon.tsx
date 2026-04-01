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
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors group"
      title="Carrinho de compras"
    >
      <svg
        className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>

      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}
