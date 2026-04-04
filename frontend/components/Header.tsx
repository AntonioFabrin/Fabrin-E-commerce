'use client';
import React from 'react';
import Link from 'next/link';
import CartHeaderIcon from './CartHeaderIcon';

const navLinks = [
  { label: 'Loja', href: '/products' },
  { label: 'Pedidos', href: '/orders' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Header() {
  return (
    <header style={{
      background: 'var(--royal)',
      borderBottom: '1px solid rgba(196,160,255,0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: '#E8D5FF',
            letterSpacing: '-0.5px',
          }}>
            Fabrin<span style={{ color: 'var(--lavender)' }}>Market</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}

          <div style={{ width: 1, height: 20, background: 'rgba(196,160,255,0.2)', margin: '0 8px' }} />

          <CartHeaderIcon />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Link
      href={href}
      style={{
        color: hovered ? '#E8D5FF' : '#9D7EC9',
        fontSize: 13,
        fontWeight: 500,
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
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
