'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stars } from '../../../components/ui/Stars';
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../../contexts/CartContext';
import api, { API } from '../../../lib/api';
import type { SellerProfile, SellerStats, Product, Review } from '../../../types/api';

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spin = () => (
  <>
    <div style={{ width: 40, height: 40, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

// ── Iniciais do vendedor ───────────────────────────────────────────────────────
function SellerAvatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--violet), var(--lavender))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontSize: size * 0.35,
      fontWeight: 700, color: '#fff',
      boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
    }}>{initials}</div>
  );
}

// ── Card de produto do vendedor ────────────────────────────────────────────────
function SellerProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, stock: product.stock, seller_id: 0 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', transition: 'all 0.25s',
    }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--lilac)'; el.style.boxShadow = '0 8px 32px rgba(124,58,237,0.12)'; el.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}
    >
      {/* Imagem */}
      <div style={{ height: 180, background: 'var(--mist)', overflow: 'hidden', position: 'relative' }}>
        {product.image_url
          ? <img src={`${API}/${product.image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.3 }}>📦</div>
        }
        {isInCart(product.id) && !added && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{ background: '#059669', color: '#ECFDF5', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>✓ Carrinho</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--royal)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.description}
        </p>

        {/* Estrelas */}
        {product.review_count > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <Stars rating={Number(product.review_avg)} size="sm" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#D97706' }}>{Number(product.review_avg).toFixed(1)}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>({product.review_count})</span>
          </div>
        ) : (
          <p style={{ fontSize: 11, color: '#C4B5D4', marginBottom: 10 }}>Sem avaliações</p>
        )}

        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--royal)', marginBottom: 4 }}>
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{product.stock} em estoque</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleAdd}
              style={{
                width: '100%', padding: '9px',
                background: added ? '#059669' : 'var(--mist)',
                border: `1px solid ${added ? '#059669' : 'var(--border)'}`,
                borderRadius: 'var(--radius-pill)',
                color: added ? '#ECFDF5' : 'var(--muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}
            >
              {added ? '✓ Adicionado!' : '🛒 Adicionar ao carrinho'}
            </button>
            <button
              onClick={() => router.push(`/cart?produto=${product.id}`)}
              style={{
                width: '100%', padding: '9px',
                background: 'var(--violet)', border: 'none',
                borderRadius: 'var(--radius-pill)', color: '#F3E8FF',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--grape)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--violet)')}
            >Comprar agora →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card de avaliação recente ──────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const initials = review.buyer_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 22px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'var(--violet)',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--royal)', marginBottom: 1 }}>{review.buyer_name}</p>
          <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            sobre <span style={{ color: 'var(--violet)' }}>{review.product_name}</span>
          </p>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{date}</span>
      </div>

      <Stars rating={review.rating} size="sm" />

      {review.comment && (
        <p style={{ fontSize: 13, color: 'var(--royal)', marginTop: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

// ── Conteúdo da página ─────────────────────────────────────────────────────────
function SellerProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sellerId = searchParams.get('id');

  const [data, setData] = useState<{
    seller: SellerProfile;
    stats: SellerStats;
    products: Product[];
    recent_reviews: Review[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sellerId) { router.push('/products'); return; }
    api.get(`/api/sellers/${sellerId}/profile`)
      .then(r => setData(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sellerId, router]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin />
      <p style={{ fontSize: 14, color: 'var(--muted)' }}>Carregando perfil...</p>
    </div>
  );

  if (notFound || !data) return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <p style={{ fontSize: 56, marginBottom: 16 }}>🔍</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--royal)', marginBottom: 10 }}>Vendedor não encontrado</h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Este perfil não existe ou foi removido.</p>
      <Link href="/products" style={{ textDecoration: 'none', display: 'inline-block' }}>
        <Button variant="primary" style={{ width: 'auto', padding: '12px 28px' }}>← Voltar à Loja</Button>
      </Link>
    </div>
  );

  const { seller, stats, products, recent_reviews } = data;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>

      {/* ── Hero do vendedor ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--royal) 0%, var(--plum) 100%)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        padding: '48px 40px 40px',
        marginBottom: 40,
        display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
      }}>
        <SellerAvatar name={seller.name} size={88} />

        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 12, color: 'var(--lilac)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
            Perfil do Vendedor
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#F3E8FF', marginBottom: 6 }}>
            {seller.name}
          </h1>
          <p style={{ fontSize: 13, color: '#9D7EC9' }}>
            Membro desde {seller.member_since}
          </p>

          {/* Avaliação média em destaque */}
          {stats.avg_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Stars rating={stats.avg_rating} size="md" />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#F59E0B' }}>{stats.avg_rating.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: '#8B6BA8' }}>({stats.total_reviews} avaliações)</span>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {[
            { val: stats.total_products, lbl: 'Produtos' },
            { val: stats.total_sales,    lbl: 'Vendas' },
            { val: stats.total_reviews,  lbl: 'Avaliações' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '16px 24px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(196,160,255,0.15)' : 'none',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#E8D5FF', lineHeight: 1, marginBottom: 4 }}>
                {s.val}
              </p>
              <p style={{ fontSize: 11, color: '#9D7EC9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 36 }}>
        <Link href="/products" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Loja</Link>
        <span>/</span>
        <span>Vendedor: {seller.name}</span>
      </div>

      {/* ── Produtos ── */}
      <div style={{ marginBottom: 52 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--royal)', marginBottom: 4 }}>
              Produtos à venda
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{products.length} produto{products.length !== 1 ? 's' : ''} disponíve{products.length !== 1 ? 'is' : 'l'}</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {products.map(p => <SellerProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>📦</p>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Este vendedor ainda não tem produtos disponíveis.</p>
          </div>
        )}
      </div>

      {/* ── Avaliações recentes ── */}
      {recent_reviews.length > 0 && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--royal)', marginBottom: 4 }}>
              Avaliações recentes
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>O que os compradores estão dizendo</p>
          </div>

          {/* Barra de média */}
          {stats.avg_rating > 0 && (
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '24px 28px',
              display: 'flex', alignItems: 'center', gap: 32,
              marginBottom: 20, flexWrap: 'wrap',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 700, color: 'var(--royal)', lineHeight: 1 }}>
                  {stats.avg_rating.toFixed(1)}
                </p>
                <Stars rating={stats.avg_rating} size="md" />
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stats.total_reviews} avaliações</p>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7 }}>
                  {stats.avg_rating >= 4.5
                    ? '⭐ Vendedor altamente avaliado pelos compradores.'
                    : stats.avg_rating >= 3.5
                    ? '👍 Vendedor bem avaliado pela comunidade.'
                    : '📊 Avaliações variadas. Leia os comentários antes de comprar.'}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {recent_reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>
      )}

      {/* ── CTA final ── */}
      <div style={{
        marginTop: 52, background: 'linear-gradient(135deg, var(--royal), var(--plum))',
        borderRadius: 'var(--radius-xl)', padding: '36px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#F3E8FF', marginBottom: 4 }}>
            Gostou do que viu?
          </h3>
          <p style={{ fontSize: 13, color: '#8B6BA8' }}>Adicione produtos ao carrinho e finalize com segurança.</p>
        </div>
        <Link href="/cart" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <button style={{
            background: 'var(--violet)', color: '#F3E8FF', border: 'none',
            borderRadius: 'var(--radius-pill)', padding: '12px 28px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--grape)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--violet)')}
          >Ver carrinho →</button>
        </Link>
      </div>

    </div>
  );
}

export default function SellerProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, paddingTop: 80 }}>
        <Spin />
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Carregando...</p>
      </div>
    }>
      <SellerProfileContent />
    </Suspense>
  );
}
