'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { StarPicker } from '../../components/ui/Stars';

type PageStatus = 'sucesso' | 'pendente' | 'erro' | null;

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface Order {
  id: number;
  total: number;
  status: string;
  external_reference: string;
  created_at: string;
  items: OrderItem[];
  payment_method: string | null;
  payment_status: string | null;
  buyer_name?: string;
  buyer_email?: string;
}

// ── Spinner ────────────────────────────────────────────────────────────────────
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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 'var(--radius-pill)',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── Modal de avaliação ─────────────────────────────────────────────────────────
function ReviewModal({ orderId, productId, productName, onClose, onSuccess }: {
  orderId: number; productId: number; productName: string;
  onClose: () => void; onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Selecione uma nota de 1 a 5 estrelas.'); return; }
    setSubmitting(true); setError('');
    const token = localStorage.getItem('@Ecommerce:token');
    try {
      await axios.post('http://localhost:3333/api/reviews',
        { product_id: productId, order_id: orderId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao enviar avaliação.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,10,46,0.7)',
      backdropFilter: 'blur(8px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '40px 36px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 32px 80px rgba(45,20,87,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--royal)' }}>
            Avaliar Produto
          </h2>
          <button onClick={onClose} style={{
            background: 'var(--mist)', border: 'none', cursor: 'pointer',
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: 'var(--muted)', flexShrink: 0,
          }}>✕</button>
        </div>

        <p style={{
          fontSize: 13, color: 'var(--violet)', fontWeight: 600,
          marginBottom: 28, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{productName}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Estrelas */}
          <div style={{
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '24px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Sua nota
            </p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comentário */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 8 }}>
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Como foi o produto? O que você achou?"
              maxLength={500}
              rows={4}
              style={{
                width: '100%', padding: '12px 16px',
                background: '#F9F5FF', border: '1.5px solid var(--mist)',
                borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--ink)',
                outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical', transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--mist)'; e.target.style.background = '#F9F5FF'; e.target.style.boxShadow = 'none'; }}
            />
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{comment.length}/500</p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626' }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="button" variant="ghost" size="md" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              style={{
                flex: 1, padding: '10px 20px',
                background: submitting || rating === 0 ? 'var(--mist)' : '#059669',
                color: submitting || rating === 0 ? 'var(--muted)' : '#fff',
                border: 'none', borderRadius: 'var(--radius-pill)',
                fontSize: 13, fontWeight: 600, cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Enviando...' : '⭐ Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Card de pedido ─────────────────────────────────────────────────────────────
function OrderCard({ order, isSeller = false, onReview, reviewedSet }: {
  order: Order; isSeller?: boolean;
  onReview?: (orderId: number, productId: number, productName: string) => void;
  reviewedSet?: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const items: OrderItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const isPaid = ['paid', 'approved'].includes(order.payment_status || order.status);

  const date = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lilac)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header clicável */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '20px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
          background: open ? 'var(--cream)' : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        {/* Esquerda — ID + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--mist), #E9D5FF)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Pedido</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--violet)', lineHeight: 1 }}>#{order.id}</span>
          </div>

          <div>
            {isSeller && order.buyer_name && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>
                Comprador: <strong style={{ color: 'var(--royal)', fontWeight: 600 }}>{order.buyer_name}</strong>
              </p>
            )}
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--royal)', marginBottom: 2 }}>{date}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              {items.length} item{items.length > 1 ? 's' : ''} · {order.payment_method || 'Mercado Pago'}
            </p>
          </div>
        </div>

        {/* Direita — total + status + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <StatusBadge status={order.payment_status || order.status} />
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 1 }}>Total</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--royal)', lineHeight: 1 }}>
              R$ {Number(order.total).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: 'var(--muted)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s',
          }}>▼</div>
        </div>
      </div>

      {/* Preview dos itens — sempre visível, compacto */}
      {!open && (
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8 }}>
          {items.slice(0, 4).map((item, idx) => (
            <div key={idx} style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--mist)', overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--border)',
            }} title={item.product_name}>
              {item.image_url
                ? <img src={`http://localhost:3333/${item.image_url}`} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
              }
            </div>
          ))}
          {items.length > 4 && (
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'var(--mist)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--muted)',
            }}>+{items.length - 4}</div>
          )}
        </div>
      )}

      {/* Detalhes expandidos */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Itens */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, idx) => {
              const reviewKey = `${order.id}-${item.product_id}`;
              const alreadyReviewed = reviewedSet?.has(reviewKey);

              return (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', background: 'var(--cream)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                }}>
                  {/* Imagem */}
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--mist)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image_url
                      ? <img src={`http://localhost:3333/${item.image_url}`} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📦</div>
                    }
                  </div>

                  {/* Nome + qtd */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--royal)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product_name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {item.quantity}× · R$ {Number(item.price).toFixed(2).replace('.', ',')} cada
                    </p>
                  </div>

                  {/* Subtotal */}
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--royal)', flexShrink: 0 }}>
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>

                  {/* Botão avaliar */}
                  {!isSeller && isPaid && onReview && (
                    alreadyReviewed ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: '#D97706',
                        background: '#FFFBEB', border: '1px solid #FDE68A',
                        padding: '5px 12px', borderRadius: 'var(--radius-pill)',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>⭐ Avaliado</span>
                    ) : (
                      <button
                        onClick={() => onReview(order.id, item.product_id, item.product_name)}
                        style={{
                          fontSize: 12, fontWeight: 600, color: 'var(--muted)',
                          background: 'var(--white)', border: '1.5px solid var(--border)',
                          padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                        onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#D97706'; el.style.borderColor = '#FDE68A'; el.style.background = '#FFFBEB'; }}
                        onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--muted)'; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--white)'; }}
                      >☆ Avaliar</button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Rodapé do pedido */}
          <div style={{
            margin: '0 24px 20px', padding: '14px 20px',
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {order.payment_method && (
                <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  💳 <span style={{ color: 'var(--royal)', fontWeight: 500 }}>{order.payment_method}</span>
                </span>
              )}
              {isSeller && order.buyer_email && (
                <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  ✉️ <span style={{ color: 'var(--royal)', fontWeight: 500 }}>{order.buyer_email}</span>
                </span>
              )}
              {order.external_reference && (
                <span style={{ fontSize: 11, color: '#C4B5D4', fontFamily: 'monospace' }}>
                  {order.external_reference}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total pago</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--royal)' }}>
                R$ {Number(order.total).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Banner de retorno do MP ────────────────────────────────────────────────────
function PaymentReturn({ status }: { status: PageStatus }) {
  const cfgs = {
    sucesso: { icon: '✅', title: 'Pagamento Aprovado!', msg: 'Tudo certo! Acompanhe o status do seu pedido abaixo.', bg: '#ECFDF5', border: '#A7F3D0', color: '#059669' },
    pendente: { icon: '⏳', title: 'Aguardando Pagamento', msg: 'Se escolheu boleto ou Pix, realize o pagamento para confirmar.', bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
    erro:     { icon: '❌', title: 'Pagamento Recusado', msg: 'Houve um problema. Verifique os dados e tente novamente.', bg: '#FEF2F2', border: '#FECACA', color: '#DC2626' },
  };
  const c = cfgs[status!];
  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
    }}>
      <span style={{ fontSize: 36, flexShrink: 0 }}>{c.icon}</span>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: c.color, marginBottom: 3 }}>{c.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>{c.msg}</p>
      </div>
    </div>
  );
}

// ── Conteúdo principal ────────────────────────────────────────────────────────
function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnStatus = searchParams.get('status') as PageStatus;

  const [tab, setTab] = useState<'comprador' | 'vendedor'>('comprador');
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ orderId: number; productId: number; productName: string } | null>(null);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }

    Promise.allSettled([
      axios.get('http://localhost:3333/api/orders/my', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:3333/api/orders/seller', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([b, s]) => {
      if (b.status === 'fulfilled') setBuyerOrders(b.value.data || []);
      if (s.status === 'fulfilled') setSellerOrders(s.value.data || []);
    }).finally(() => setLoading(false));
  }, [router]);

  const handleReviewSuccess = (orderId: number, productId: number) => {
    setReviewedSet(prev => new Set(prev).add(`${orderId}-${productId}`));
    setReviewModal(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin />
      <p style={{ fontSize: 14, color: 'var(--muted)' }}>Carregando pedidos...</p>
    </div>
  );

  const currentOrders = tab === 'comprador' ? buyerOrders : sellerOrders;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

      {/* Modal */}
      {reviewModal && (
        <ReviewModal
          orderId={reviewModal.orderId}
          productId={reviewModal.productId}
          productName={reviewModal.productName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => handleReviewSuccess(reviewModal.orderId, reviewModal.productId)}
        />
      )}

      {/* Banner MP */}
      {returnStatus && <PaymentReturn status={returnStatus} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Histórico</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--royal)' }}>
            Meus Pedidos
          </h1>
        </div>
        <Link href="/products" style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm" style={{ width: 'auto' }}>← Voltar à Loja</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 4,
        width: 'fit-content', marginBottom: 28,
      }}>
        {(['comprador', 'vendedor'] as const).map(t => {
          const count = (t === 'comprador' ? buyerOrders : sellerOrders).length;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '9px 22px', borderRadius: 9,
                fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: active ? 'var(--violet)' : 'transparent',
                color: active ? '#F3E8FF' : 'var(--muted)',
                fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {t === 'comprador' ? '🛒 Minhas Compras' : '📦 Vendas'}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : 'var(--mist)',
                  color: active ? '#F3E8FF' : 'var(--violet)',
                  padding: '1px 7px', borderRadius: 999,
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {currentOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isSeller={tab === 'vendedor'}
              onReview={(oId, pId, pName) => setReviewModal({ orderId: oId, productId: pId, productName: pName })}
              reviewedSet={reviewedSet}
            />
          ))}
        </div>
      ) : (
        <div style={{
          border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '72px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 52, marginBottom: 16 }}>{tab === 'comprador' ? '🛍️' : '📦'}</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--royal)', marginBottom: 8 }}>
            {tab === 'comprador' ? 'Nenhuma compra ainda' : 'Nenhuma venda ainda'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
            {tab === 'comprador'
              ? 'Explore nossa loja e faça sua primeira compra!'
              : 'Quando alguém comprar seus produtos, os pedidos aparecerão aqui.'}
          </p>
          {tab === 'comprador' && (
            <Link href="/products" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button variant="primary" style={{ width: 'auto', padding: '12px 28px' }}>Explorar Loja →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, paddingTop: 80 }}>
        <Spin />
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Carregando...</p>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
