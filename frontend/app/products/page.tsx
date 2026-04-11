'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Stars } from '../../components/ui/Stars';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/ui/Toast';
import { useCurrentUser } from '../../hooks/useAuth';
import api, { API, extractErrorMessage } from '../../lib/api';
import type { Product, ReviewStat } from '../../types/api';

// ── Conteúdo real da página (usa useSearchParams → precisa de Suspense) ────────
function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasBlocked = searchParams.get('blocked') === '1';

  const { addItem, isInCart } = useCart();
  const { error: toastError, success: toastSuccess, warning: toastWarning } = useToast();
  const currentUser = useCurrentUser();

  const [stats, setStats]     = useState<Record<number, ReviewStat>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products?limit=50');
      const data = res.data.dados ?? res.data;
      const list: Product[] = Array.isArray(data) ? data : [];
      setProducts(list);
      if (list.length) {
        try {
          const sr = await api.post('/api/reviews/bulk-stats', { productIds: list.map(p => p.id) });
          const m: Record<number, ReviewStat> = {};
          for (const s of sr.data) m[s.product_id] = s;
          setStats(m);
        } catch { }
      }
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (wasBlocked) toastWarning('Essa área é exclusiva para vendedores.');
  }, [wasBlocked]);

  const canEdit = (p: Product) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'seller') return p.seller_id === currentUser.id;
    return false; // customer nunca edita
  };

  const handleAddToCart = (p: Product) => {
    addItem({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, stock: p.stock, seller_id: p.seller_id });
    setAddedMap(prev => ({ ...prev, [p.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [p.id]: false })), 1600);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Remover "${p.name}"?`)) return;
    try {
      await api.delete(`/api/products/${p.id}`);
      setProducts(prev => prev.filter(x => x.id !== p.id));
      toastSuccess('Produto removido com sucesso.');
    } catch (err) { toastError(extractErrorMessage(err, 'Erro ao remover.')); }
  };

  const filtered  = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const isAdmin   = currentUser?.role === 'admin';
  const isSeller  = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando produtos...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--royal) 0%, var(--plum) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '40px', marginBottom: 40,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(196,160,255,0.15)', border: '1px solid rgba(196,160,255,0.25)', color: 'var(--lilac)', fontSize: 11, fontWeight: 600, padding: '4px 14px', borderRadius: 'var(--radius-pill)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 14 }}>✦ Marketplace Premium</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: '#F3E8FF', marginBottom: 8, lineHeight: 1.2 }}>
            {products.length} produto{products.length !== 1 ? 's' : ''} disponíve{products.length !== 1 ? 'is' : 'l'}
          </h1>
          <p style={{ fontSize: 14, color: '#8B6BA8', margin: 0 }}>Compra segura · Pix, boleto e cartão · Entrega para todo o Brasil</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={fetchProducts} style={{ background: 'rgba(196,160,255,0.12)', border: '1px solid rgba(196,160,255,0.2)', color: '#C4A0FF', borderRadius: 'var(--radius-pill)', padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>↻ Atualizar</button>
          {/* Botão "Novo produto" — apenas seller/admin */}
          {isSeller && (
            <Link href="/products/create" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'var(--violet)', border: 'none', color: '#F3E8FF', borderRadius: 'var(--radius-pill)', padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Novo produto</button>
            </Link>
          )}
        </div>
      </div>

      {/* Faixa de modo — só para seller/admin */}
      {isSeller && (
        <div style={{ marginBottom: 24, padding: '14px 20px', background: isAdmin ? '#F5F3FF' : '#FFFBEB', border: `1px solid ${isAdmin ? 'var(--mist)' : '#FDE68A'}`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>{isAdmin ? '🛡️' : '🔧'}</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: isAdmin ? 'var(--violet)' : '#92400E', marginBottom: 2 }}>
              {isAdmin ? 'Modo Administrador' : 'Modo Vendedor'}
            </p>
            <p style={{ fontSize: 12, color: isAdmin ? 'var(--muted)' : '#B45309' }}>
              {isAdmin ? 'Você pode editar e remover qualquer produto.' : 'Você só pode editar e remover os seus próprios produtos.'}
            </p>
          </div>
        </div>
      )}

      {/* Busca */}
      {products.length > 0 && (
        <div style={{ position: 'relative', maxWidth: 440, marginBottom: 32 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>🔍</span>
          <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      )}

      {/* Grid de produtos */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {filtered.map(product => {
            const edit      = canEdit(product);
            const inCart    = isInCart(product.id);
            const justAdded = addedMap[product.id];
            const stat      = stats[product.id];

            return (
              <div key={product.id}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s', position: 'relative' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--lilac)'; el.style.boxShadow = '0 12px 40px rgba(124,58,237,0.12)'; el.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}
              >
                {/* Imagem */}
                <div style={{ height: 200, background: 'var(--mist)', position: 'relative', overflow: 'hidden' }}>
                  {product.image_url ? (
                    <img src={`${API}/${product.image_url}`} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.3 }}>📦</div>
                  )}

                  {product.stock === 0 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,46,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ background: 'rgba(26,10,46,0.8)', color: '#C4A0FF', fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(196,160,255,0.3)', textTransform: 'uppercase' }}>Esgotado</span>
                    </div>
                  )}

                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    {isSeller && !isAdmin && product.seller_id === currentUser?.id && (
                      <span style={{ background: 'var(--violet)', color: '#F3E8FF', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>Meu produto</span>
                    )}
                    {inCart && !edit && (
                      <span style={{ background: '#059669', color: '#ECFDF5', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>✓ Carrinho</span>
                    )}
                  </div>

                  {edit && (
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                      <button onClick={() => router.push(`/products/${product.id}`)} style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                      <button onClick={() => handleDelete(product)} style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.92)', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--royal)', marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>

                  {/* Estrelas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    {stat?.total > 0 ? (
                      <>
                        <Stars rating={Number(stat.average)} size="sm" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>{Number(stat.average).toFixed(1)}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>({stat.total})</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: '#C4B5D4' }}>Sem avaliações ainda</span>
                    )}
                  </div>

                  {/* Preço + Botões */}
                  <div style={{ marginTop: 'auto' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--royal)' }}>
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 12px' }}>{product.stock} em estoque</p>

                    {edit ? (
                      <button onClick={() => router.push(`/products/${product.id}`)}
                        style={{ width: '100%', padding: '10px', background: 'var(--mist)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', color: 'var(--violet)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        ✏️ Editar produto
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button disabled={product.stock === 0} onClick={() => product.stock > 0 && handleAddToCart(product)}
                          style={{
                            width: '100%', padding: '10px',
                            background: justAdded ? '#059669' : inCart ? '#F5F3FF' : 'var(--mist)',
                            border: `1px solid ${justAdded ? '#059669' : inCart ? 'var(--lilac)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-pill)',
                            color: justAdded ? '#ECFDF5' : inCart ? 'var(--violet)' : '#6B7280',
                            fontSize: 13, fontWeight: 600,
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            opacity: product.stock === 0 ? 0.4 : 1, transition: 'all 0.2s',
                          }}>
                          {justAdded ? '✓ Adicionado!' : inCart ? '+ Adicionar mais' : '🛒 Adicionar ao carrinho'}
                        </button>
                        <button disabled={product.stock === 0} onClick={() => product.stock > 0 && router.push(`/cart?produto=${product.id}`)}
                          style={{
                            width: '100%', padding: '10px',
                            background: product.stock === 0 ? 'var(--mist)' : 'var(--violet)',
                            border: 'none', borderRadius: 'var(--radius-pill)',
                            color: product.stock === 0 ? 'var(--muted)' : '#F3E8FF',
                            fontSize: 13, fontWeight: 600,
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            opacity: product.stock === 0 ? 0.5 : 1, transition: 'all 0.2s',
                          }}>
                          {product.stock > 0 ? 'Comprar agora →' : 'Indisponível'}
                        </button>

                        <Link href={`/products/seller-products?id=${product.seller_id}`}
                          style={{ display: 'block', textAlign: 'center', fontSize: 11, color: 'var(--muted)', textDecoration: 'none', padding: '4px 0', transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--violet)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                        >
                          🏪 Ver perfil do vendedor
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '80px 24px', textAlign: 'center' }}>
          {search ? (
            <>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--royal)', marginBottom: 8 }}>Nenhum resultado para "{search}"</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>Tente outro termo de busca.</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🏪</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--royal)', marginBottom: 8 }}>A loja está vazia</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Seja o primeiro a anunciar!</p>
              {isSeller && (
                <Link href="/products/create" style={{ display: 'inline-block' }}>
                  <Button variant="primary" style={{ width: 'auto', padding: '12px 28px' }}>Criar anúncio →</Button>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Wrapper com Suspense (necessário por causa do useSearchParams) ─────────────
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
