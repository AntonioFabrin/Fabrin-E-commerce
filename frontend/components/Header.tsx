'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartHeaderIcon from './CartHeaderIcon';
import { useCurrentUser, logout } from '../hooks/useAuth';

export default function Header() {
  const currentUser = useCurrentUser();
  const router      = useRouter();
  const role        = currentUser?.role;
  const isSeller    = role === 'seller' || role === 'admin';
  const isCustomer  = role === 'customer';
  const isLoggedIn  = !!currentUser;

  return (
    <header style={{
      background: 'var(--royal)',
      borderBottom: '1px solid rgba(196,160,255,0.12)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#E8D5FF', letterSpacing: '-0.5px' }}>
            Fabrin<span style={{ color: 'var(--lavender)' }}>Market</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

          {/* Loja — todos */}
          <NavLink href="/products" label="Loja" />

          {/* Pedidos — todos logados */}
          {isLoggedIn && <NavLink href="/orders" label="Pedidos" />}

          {/* Minha Conta — apenas customer */}
          {isCustomer && <NavLink href="/account" label="Minha Conta" />}

          {/* Dashboard — apenas seller/admin */}
          {isSeller && <NavLink href="/dashboard" label="Dashboard" />}

          <div style={{ width: 1, height: 20, background: 'rgba(196,160,255,0.2)', margin: '0 8px' }} />

          {/* Carrinho */}
          <CartHeaderIcon />

          {/* Sair / Entrar */}
          {isLoggedIn ? (
            <button
              onClick={() => logout(router)}
              style={{
                marginLeft: 4,
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 'var(--radius-pill)',
                padding: '6px 14px',
                fontSize: 12, fontWeight: 600, color: '#FCA5A5',
                cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.15)'; }}
            >
              Sair
            </button>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none', marginLeft: 4 }}>
              <button style={{
                background: 'var(--violet)', border: 'none',
                borderRadius: 'var(--radius-pill)', padding: '6px 16px',
                fontSize: 12, fontWeight: 600, color: '#F3E8FF',
                cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--grape)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--violet)'; }}
              >
                Entrar
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Link href={href} style={{
      color: hovered ? '#E8D5FF' : '#9D7EC9',
      fontSize: 13, fontWeight: 500,
      padding: '6px 14px', borderRadius: 'var(--radius-pill)',
      textDecoration: 'none',
      background: hovered ? 'rgba(196,160,255,0.1)' : 'transparent',
      transition: 'all 0.2s',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}
