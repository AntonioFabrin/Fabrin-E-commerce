'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Stars, StarPicker } from '../../components/ui/Stars';

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

// ── Modal de avaliação ─────────────────────────────────────────────────────────
function ReviewModal({
  orderId,
  productId,
  productName,
  onClose,
  onSuccess,
}: {
  orderId: number;
  productId: number;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Selecione uma nota de 1 a 5 estrelas.'); return; }
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('@Ecommerce:token');
    try {
      await axios.post(
        'http://localhost:3333/api/reviews',
        { product_id: productId, order_id: orderId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao enviar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Avaliar Produto
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <p className="text-zinc-400 text-sm mb-6 line-clamp-1">
          <span className="text-zinc-300 font-semibold">{productName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Estrelas interativas */}
          <div className="flex flex-col items-center gap-1 py-4 bg-zinc-800/50 rounded-xl">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Sua nota</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comentário */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Como foi o produto? O que você achou?"
              maxLength={500}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none min-h-[100px]"
            />
            <p className="text-zinc-600 text-xs mt-1 text-right">{comment.length}/500</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" size="md" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success" size="md" className="flex-1" disabled={submitting || rating === 0}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Enviando...
                </span>
              ) : '⭐ Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    paid:     { label: 'Pago',      classes: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' },
    pending:  { label: 'Pendente',  classes: 'bg-amber-950/60 border-amber-800/60 text-amber-400' },
    approved: { label: 'Aprovado',  classes: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' },
    cancelled:{ label: 'Cancelado', classes: 'bg-rose-950/60 border-rose-800/60 text-rose-400' },
  };
  const cfg = map[status] || { label: status, classes: 'bg-zinc-800 border-zinc-700 text-zinc-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

// ── Card de pedido ─────────────────────────────────────────────────────────────
function OrderCard({
  order,
  isSeller = false,
  onReview,
  reviewedSet,
}: {
  order: Order;
  isSeller?: boolean;
  onReview?: (orderId: number, productId: number, productName: string) => void;
  reviewedSet?: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const items: OrderItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const isPaid = ['paid', 'approved'].includes(order.payment_status || order.status);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-800/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-600/30 rounded-xl flex items-center justify-center text-indigo-400 font-black text-sm">
            #{order.id}
          </div>
          <div>
            {isSeller && order.buyer_name && (
              <p className="text-xs text-zinc-500 mb-0.5">
                Comprador: <span className="text-zinc-300 font-semibold">{order.buyer_name}</span>
              </p>
            )}
            <p className="text-zinc-400 text-xs">
              {new Date(order.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">{items.length} item{items.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge status={order.payment_status || order.status} />
          <p className="font-black text-white text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
            R$ {Number(order.total).toFixed(2).replace('.', ',')}
          </p>
          <span className={`text-zinc-500 transition-transform duration-200 text-xs ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="border-t border-zinc-800 p-5 space-y-4">
          {items.map((item, idx) => {
            const reviewKey = `${order.id}-${item.product_id}`;
            const alreadyReviewed = reviewedSet?.has(reviewKey);

            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={`http://localhost:3333/${item.image_url}`} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">📦</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{item.product_name}</p>
                  <p className="text-zinc-500 text-xs">{item.quantity}x · R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                </div>

                {/* Botão de avaliação — só aparece para compradores em pedidos pagos */}
                {!isSeller && isPaid && onReview && (
                  alreadyReviewed ? (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-full">
                      ⭐ Avaliado
                    </span>
                  ) : (
                    <button
                      onClick={() => onReview(order.id, item.product_id, item.product_name)}
                      className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-amber-400 font-semibold border border-zinc-700 hover:border-amber-600/50 hover:bg-amber-950/20 px-3 py-1.5 rounded-full transition-all"
                    >
                      ☆ Avaliar
                    </button>
                  )
                )}
              </div>
            );
          })}

          <div className="border-t border-zinc-800 pt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
            {order.payment_method && <span>💳 {order.payment_method}</span>}
            {order.external_reference && <span className="font-mono">Ref: {order.external_reference}</span>}
            {isSeller && order.buyer_email && <span>✉️ {order.buyer_email}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tela de retorno do MP ─────────────────────────────────────────────────────
function PaymentReturn({ status }: { status: PageStatus }) {
  const configs = {
    sucesso: { icon: '✅', title: 'Pagamento Aprovado!', msg: 'Seu pagamento foi confirmado. Acompanhe seu pedido abaixo.', color: 'text-emerald-400', border: 'border-emerald-800/50' },
    pendente: { icon: '⏳', title: 'Pagamento Pendente', msg: 'Seu pagamento está sendo processado.', color: 'text-amber-400', border: 'border-amber-800/50' },
    erro:     { icon: '❌', title: 'Pagamento não Aprovado', msg: 'Houve um problema. Tente novamente.', color: 'text-rose-400', border: 'border-rose-800/50' },
  };
  const cfg = configs[status!];
  return (
    <div className={`bg-zinc-900 border ${cfg.border} rounded-2xl p-6 mb-8 flex items-center gap-5`}>
      <span className="text-5xl">{cfg.icon}</span>
      <div>
        <h2 className={`text-xl font-black ${cfg.color}`} style={{ fontFamily: "'Syne', sans-serif" }}>{cfg.title}</h2>
        <p className="text-zinc-500 text-sm mt-1">{cfg.msg}</p>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modal de avaliação
  const [reviewModal, setReviewModal] = useState<{
    orderId: number; productId: number; productName: string;
  } | null>(null);

  // Conjunto de avaliações já feitas (chave: "orderId-productId")
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }
    setIsLoggedIn(true);

    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [buyerRes, sellerRes] = await Promise.allSettled([
          axios.get('http://localhost:3333/api/orders/my', { headers }),
          axios.get('http://localhost:3333/api/orders/seller', { headers }),
        ]);
        if (buyerRes.status === 'fulfilled') setBuyerOrders(buyerRes.value.data || []);
        if (sellerRes.status === 'fulfilled') setSellerOrders(sellerRes.value.data || []);
      } catch { /* silencia */ } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  const handleReviewSuccess = (orderId: number, productId: number) => {
    setReviewedSet(prev => new Set(prev).add(`${orderId}-${productId}`));
    setReviewModal(null);
  };

  if (!isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const currentOrders = tab === 'comprador' ? buyerOrders : sellerOrders;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 md:px-6">

      {/* Modal de avaliação */}
      {reviewModal && (
        <ReviewModal
          orderId={reviewModal.orderId}
          productId={reviewModal.productId}
          productName={reviewModal.productName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => handleReviewSuccess(reviewModal.orderId, reviewModal.productId)}
        />
      )}

      {returnStatus && returnStatus !== 'erro' && <PaymentReturn status={returnStatus} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Pedidos</h1>
          <p className="text-zinc-500 text-sm mt-1">Acompanhe suas compras e vendas</p>
        </div>
        <Link href="/products">
          <Button variant="outline" size="sm" className="w-auto">← Voltar à Loja</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8 w-fit">
        {(['comprador', 'vendedor'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'comprador' ? '🛒 Minhas Compras' : '📦 Pedidos Recebidos'}
            {(t === 'comprador' ? buyerOrders : sellerOrders).length > 0 && (
              <span className="ml-2 bg-indigo-500/30 text-indigo-300 text-xs px-1.5 py-0.5 rounded-full">
                {(t === 'comprador' ? buyerOrders : sellerOrders).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {currentOrders.length > 0 ? (
        <div className="space-y-4">
          {currentOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isSeller={tab === 'vendedor'}
              onReview={(orderId, productId, productName) =>
                setReviewModal({ orderId, productId, productName })
              }
              reviewedSet={reviewedSet}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-700 rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4">{tab === 'comprador' ? '🛒' : '📦'}</p>
          <h3 className="text-lg font-bold text-white mb-2">
            {tab === 'comprador' ? 'Você ainda não fez nenhuma compra' : 'Nenhum pedido recebido ainda'}
          </h3>
          <p className="text-zinc-500 text-sm mb-6">
            {tab === 'comprador' ? 'Explore nossa loja!' : 'Quando clientes comprarem, os pedidos aparecerão aqui.'}
          </p>
          {tab === 'comprador' && (
            <Link href="/products">
              <Button variant="primary" className="w-auto px-8 mx-auto">Explorar Loja</Button>
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
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
