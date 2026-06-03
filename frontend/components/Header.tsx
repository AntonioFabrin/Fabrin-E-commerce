'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CartHeaderIcon from './CartHeaderIcon';
import { useCurrentUser, logout } from '../hooks/useAuth';

export default function Header() {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const role = currentUser?.role;
  const isSeller = role === 'seller' || role === 'admin';
  const isCustomer = role === 'customer';
  const isLoggedIn = !!currentUser;
  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.email?.split('@')[0] || '';
  const initial = firstName.slice(0, 1).toUpperCase() || 'U';
  const accountHref = isSeller ? '/dashboard' : '/account';
  const roleLabel = role === 'admin' ? 'Admin' : role === 'seller' ? 'Vendedor' : 'Cliente';

  return (
    <header style={{
      background: 'var(--royal)',
      borderBottom: '1px solid rgba(196,160,255,0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="site-header-inner" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        minHeight: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
      }}>
        <Link href="/" className="site-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img
            src="/app-icon.svg"
            alt=""
            width={34}
            height={34}
            style={{ display: 'block', borderRadius: 10 }}
          />
          <span className="site-brand-text" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#E8D5FF', letterSpacing: '-0.5px' }}>
            Fabrin<span style={{ color: 'var(--lavender)' }}>Market</span>
          </span>
        </Link>

        <nav className="site-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
          <NavLink href="/products" label="Loja" active={pathname.startsWith('/products')} />

          {isLoggedIn && <NavLink href="/orders" label="Pedidos" active={pathname.startsWith('/orders')} />}
          {isCustomer && <NavLink href="/account" label="Minha Conta" active={pathname.startsWith('/account')} />}
          {isSeller && <NavLink href="/dashboard" label="Painel" active={pathname.startsWith('/dashboard')} />}
          {!isLoggedIn && <NavLink href="/register" label="Criar conta" active={pathname.startsWith('/register')} />}

          <div className="site-nav-divider" style={{ width: 1, height: 20, background: 'rgba(196,160,255,0.2)', margin: '0 8px' }} />

          <CartHeaderIcon />

          {isLoggedIn ? (
            <div className="site-user-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <Link
                href={accountHref}
                title={`Abrir ${isSeller ? 'painel' : 'minha conta'}`}
                className="site-user-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  minWidth: 0,
                  maxWidth: 220,
                  textDecoration: 'none',
                  background: 'rgba(196,160,255,0.12)',
                  border: '1px solid rgba(196,160,255,0.22)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '5px 10px 5px 5px',
                  color: '#E8D5FF',
                }}
              >
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--violet), var(--lavender))',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {initial}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {firstName}
                  </span>
                  <span style={{ fontSize: 10, color: '#9D7EC9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {roleLabel}
                  </span>
                </span>
              </Link>

              <button
                onClick={() => logout(router)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(196,160,255,0.35)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#C4A0FF',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196,160,255,0.1)';
                  (e.currentTarget as HTMLElement).style.color = '#F3E8FF';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#C4A0FF';
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className="site-login" style={{ textDecoration: 'none', marginLeft: 4 }}>
              <button
                style={{
                  background: 'var(--violet)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 17px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#F3E8FF',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
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

function NavLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Link
      href={href}
      className="site-nav-link"
      style={{
        color: active || hovered ? '#F3E8FF' : '#9D7EC9',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
        textDecoration: 'none',
        background: active ? 'rgba(124,58,237,0.22)' : hovered ? 'rgba(196,160,255,0.1)' : 'transparent',
        transition: 'all 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}
