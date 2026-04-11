'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth, logout } from '../../hooks/useAuth';
import api, { API, extractErrorMessage } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import type { Order, OrderItem } from '../../types/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  `R$ ${Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const Spin = () => (
  <>
    <div style={{ width: 36, height: 36, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    paid:      { label: 'Pago',      bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
    approved:  { label: 'Aprovado',  bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
    pending:   { label: 'Pendente',  bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    cancelled: { label: 'Cancelado', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  };
  const c = map[status] || { label: status, bg: 'var(--mist)', color: 'var(--muted)', border: 'var(--border)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color }} />
      {c.label}
    </span>
  );
}

// ── Card de pedido resumido ────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const items: OrderItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'box-shadow 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lilac)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div onClick={() => setOpen(!open)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', background: open ? 'var(--cream)' : 'transparent', transition: 'background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--mist), #E9D5FF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Pedido</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--violet)', lineHeight: 1 }}>#{order.id}</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--royal)', marginBottom: 2 }}>{date}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{items.length} item{items.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusBadge status={order.payment_status || order.status} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--royal)' }}>{fmt(order.total)}</p>
          <span style={{ fontSize: 10, color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        </div>
      </div>

      {/* Itens expandidos */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--cream)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--mist)', overflow: 'hidden', flexShrink: 0 }}>
                {item.image_url
                  ? <img src={`${API}/${item.image_url}`} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--royal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{item.quantity}× · {fmt(item.price)} cada</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--royal)', flexShrink: 0 }}>{fmt(item.price * item.quantity)}</p>
            </div>
          ))}
          <Link href="/orders" style={{ textAlign: 'center', fontSize: 12, color: 'var(--violet)', textDecoration: 'none', padding: '6px', display: 'block' }}>
            Ver detalhes completos →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [orders, setOrders]       = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Edição de perfil
  const [editMode, setEditMode]   = useState(false);
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');

    api.get('/api/orders/my')
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [authLoading, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/${user!.id}`, { name, email });
      // Atualiza o nome no localStorage para o header refletir imediatamente
      localStorage.setItem('@Ecommerce:name', name);
      toastSuccess('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (err) {
      toastError(extractErrorMessage(err, 'Erro ao atualizar perfil.'));
    } finally { setSaving(false); }
  };

  const totalGasto   = orders.filter(o => ['paid', 'approved'].includes(o.payment_status || o.status)).reduce((s, o) => s + Number(o.total), 0);
  const pedidosPagos = orders.filter(o => ['paid', 'approved'].includes(o.payment_status || o.status)).length;
  const ultimosPedidos = orders.slice(0, 5);

  if (authLoading || dataLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando sua conta...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Área do Cliente</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--royal)' }}>
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <Button variant="outline" size="sm" style={{ width: 'auto' }} onClick={() => logout(router)}>
          Sair
        </Button>
      </div>

      {/* ── Stats rápidas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
        {[
          { icon: '🛒', label: 'Total de pedidos', value: String(orders.length) },
          { icon: '✅', label: 'Pedidos pagos',    value: String(pedidosPagos) },
          { icon: '💰', label: 'Total gasto',      value: fmt(totalGasto) },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--royal)', lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* ── Coluna esquerda — Pedidos recentes ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--royal)' }}>
              Pedidos Recentes
            </h2>
            {orders.length > 5 && (
              <Link href="/orders" style={{ fontSize: 12, color: 'var(--violet)', textDecoration: 'none', fontWeight: 600 }}>
                Ver todos ({orders.length}) →
              </Link>
            )}
          </div>

          {ultimosPedidos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ultimosPedidos.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 10 }}>🛍️</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--royal)', marginBottom: 8 }}>Nenhum pedido ainda</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Explore a loja e faça sua primeira compra!</p>
              <Link href="/products" style={{ textDecoration: 'none', display: 'inline-block' }}>
                <Button variant="primary" style={{ width: 'auto', padding: '10px 24px' }}>Explorar loja →</Button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Coluna direita — Perfil + Ações ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Card de perfil */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--violet), var(--lavender))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff',
                boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {!editMode && (
                <>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--royal)', marginBottom: 2 }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email}</p>
                  <span style={{ display: 'inline-block', marginTop: 8, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
                    Comprador
                  </span>
                </>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Nome</label>
                  <input value={name} onChange={e => setName(e.target.value)} required
                    style={{ width: '100%', padding: '10px 12px', background: '#F9F5FF', border: '1.5px solid var(--mist)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--mist)'; e.target.style.background = '#F9F5FF'; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: '10px 12px', background: '#F9F5FF', border: '1.5px solid var(--mist)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--mist)'; e.target.style.background = '#F9F5FF'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={saving}
                    style={{ flex: 1, padding: '9px', background: saving ? 'var(--mist)' : 'var(--violet)', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, color: saving ? 'var(--muted)' : '#F3E8FF', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}
                    style={{ flex: 1, padding: '9px', background: 'var(--mist)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setEditMode(true)}
                style={{ width: '100%', padding: '10px', background: 'var(--mist)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, color: 'var(--royal)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLElement).style.color = 'var(--violet)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--royal)'; }}
              >
                ✏️ Editar perfil
              </button>
            )}
          </div>

          {/* Ações rápidas */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Ações Rápidas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/products', icon: '🏪', label: 'Explorar a Loja' },
                { href: '/orders',   icon: '📦', label: 'Todos os Pedidos' },
                { href: '/cart',     icon: '🛒', label: 'Ver Carrinho' },
              ].map(item => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--royal)' }}>{item.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Info da conta */}
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              💡 Quer também <strong style={{ color: 'var(--violet)' }}>vender</strong> na plataforma? Entre em contato com o suporte para upgrade da sua conta para Vendedor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
