'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { useRequireAuth, logout } from '../../hooks/useAuth';
import api, { extractErrorMessage } from '../../lib/api';
import { useRouter } from 'next/navigation';

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent: string }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${accent}` }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--royal)', lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, title, desc, accent, highlight }: { href: string; icon: string; title: string; desc: string; accent: string; highlight?: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: highlight ? `${accent}08` : 'var(--white)', border: `1px solid ${highlight ? accent : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = accent; el.style.boxShadow = `0 8px 24px ${accent}20`; el.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = highlight ? accent : 'var(--border)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}
      >
        <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--royal)', marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</p>
        {highlight && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: accent, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Novo</span>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [productCount, setProductCount]   = useState(0);
  const [orderCount, setOrderCount]       = useState(0);
  const [revenueMonth, setRevenueMonth]   = useState('R$ 0,00');

  useEffect(() => {
    if (authLoading) return;
    // Customer não tem acesso ao dashboard de vendedor
    if (user?.role === 'customer') {
      router.replace('/products');
      return;
    }
    Promise.allSettled([
      api.get('/api/products/seller'),
      api.get('/api/orders/seller'),
      api.get('/api/sellers/analytics'),
    ]).then(([p, o, a]) => {
      if (p.status === 'fulfilled') setProductCount(Array.isArray(p.value.data) ? p.value.data.length : 0);
      if (o.status === 'fulfilled') setOrderCount(Array.isArray(o.value.data) ? o.value.data.length : 0);
      if (a.status === 'fulfilled') {
        const rev = a.value.data?.kpis?.revenue_month || 0;
        setRevenueMonth(`R$ ${Number(rev).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`);
      }
    }).finally(() => setDataLoading(false));
  }, [authLoading]);

  if (authLoading || dataLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando painel...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Painel do Vendedor</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--royal)' }}>
            Bem-vindo de volta 👋
          </h1>
        </div>
        <Button variant="outline" size="sm" style={{ width: 'auto' }} onClick={() => logout(router)}>
          Sair
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Produtos cadastrados" value={productCount} icon="📦" accent="#7C3AED" />
        <StatCard label="Pedidos recebidos"    value={orderCount}   icon="🛒" accent="#059669" />
        <StatCard label="Receita este mês"     value={revenueMonth} icon="💰" accent="#D97706" />
      </div>

      {/* Ações rápidas */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 20 }}>Ações Rápidas</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <QuickAction href="/products/create"          icon="➕" title="Novo Produto"      desc="Publicar anúncio"       accent="#7C3AED" />
          <QuickAction href="/products/seller-products" icon="📦" title="Meus Produtos"     desc="Gerenciar estoque"      accent="#059669" />
          <QuickAction href="/orders"                   icon="🧾" title="Pedidos"           desc="Compras e vendas"       accent="#D97706" />
          <QuickAction href="/dashboard/products"       icon="📊" title="Painel Financeiro" desc="Gráficos e métricas"    accent="#7C3AED" highlight />
          <QuickAction href="/products"                 icon="🏪" title="Ver Loja"          desc="Como os clientes veem" accent="#4C1D95" />
        </div>
      </div>

      {/* CTA vazio */}
      {productCount === 0 && (
        <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🚀</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--royal)', marginBottom: 8 }}>Sua loja está esperando!</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Crie seu primeiro produto e comece a vender hoje mesmo.</p>
          <Link href="/products/create" style={{ display: 'inline-block' }}>
            <Button variant="primary" style={{ width: 'auto', padding: '12px 32px' }}>Criar primeiro produto →</Button>
          </Link>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
