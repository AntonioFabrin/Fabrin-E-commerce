'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Stars } from '../../components/ui/Stars';
import { useCart } from '../../contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  seller_id: number;
}

interface ReviewStat {
  product_id: number;
  total: number;
  average: number;
}

function decodeToken(token: string): { id: number; role: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return { id: decoded.id, role: decoded.role };
  } catch { return null; }
}

export default function ProductsPage() {
  const router = useRouter();
  const { addItem, isInCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<number, ReviewStat>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3333/api/products?limit=50');
      const data = response.data.dados ?? response.data;
      const list: Product[] = Array.isArray(data) ? data : [];
      setProducts(list);

      // Busca médias de avaliações em uma única chamada
      if (list.length > 0) {
        try {
          const statsRes = await axios.post('http://localhost:3333/api/reviews/bulk-stats', {
            productIds: list.map(p => p.id),
          });
          const statsMap: Record<number, ReviewStat> = {};
          for (const s of statsRes.data) statsMap[s.product_id] = s;
          setReviewStats(statsMap);
        } catch { /* silencia se não tiver reviews */ }
      }
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (token) setCurrentUser(decodeToken(token));
    fetchProducts();
  }, []);

  const canEditProduct = (product: Product) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return product.seller_id === currentUser.id;
  };

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, stock: product.stock, seller_id: product.seller_id });
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  const handleDelete = async (product: Product) => {
    if (!canEditProduct(product)) return;
    if (!confirm(`Remover "${product.name}"?`)) return;
    const token = localStorage.getItem('@Ecommerce:token');
    try {
      await axios.delete(`http://localhost:3333/api/products/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err: any) { alert(err.response?.data?.erro || 'Erro ao remover.'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] gap-4">
        <svg className="animate-spin w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-zinc-500 text-sm">Carregando a loja...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-6">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-2">Marketplace</p>
            <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Nossos Produtos</h1>
            <p className="text-zinc-500 text-sm mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} disponíve{products.length !== 1 ? 'is' : 'l'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchProducts} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
            {isLoggedIn && (
              <Link href="/products/create">
                <Button variant="primary" size="md" className="w-auto px-5">➕ Novo Produto</Button>
              </Link>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <div className={`mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border ${isAdmin ? 'bg-violet-950/40 border-violet-800/50' : 'bg-amber-950/40 border-amber-800/50'}`}>
            <span className="text-xl">{isAdmin ? '🛡️' : '🔧'}</span>
            <div>
              <p className={`text-xs font-semibold ${isAdmin ? 'text-violet-400' : 'text-amber-400'}`}>{isAdmin ? 'Modo Administrador' : 'Modo Vendedor'}</p>
              <p className={`text-xs ${isAdmin ? 'text-violet-600' : 'text-amber-600'}`}>{isAdmin ? 'Você pode editar e remover qualquer produto.' : 'Você pode editar e remover apenas os seus produtos.'}</p>
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-6 relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
            <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(product => {
            const canEdit = canEditProduct(product);
            const inCart = isInCart(product.id);
            const justAdded = addedMap[product.id];
            const stat = reviewStats[product.id];

            return (
              <div key={product.id} className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-300 flex flex-col">

                {/* Imagem */}
                <div className="h-52 bg-zinc-800 overflow-hidden relative">
                  {product.image_url ? (
                    <img src={`http://localhost:3333/${product.image_url}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-4xl">📦</div>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest border border-zinc-600 px-3 py-1 rounded-full">Esgotado</span>
                    </div>
                  )}

                  {canEdit && (
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => router.push(`/products/${product.id}`)} className="w-8 h-8 bg-zinc-900/90 hover:bg-indigo-600 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg flex items-center justify-center text-xs transition-all">✏️</button>
                      <button onClick={() => handleDelete(product)} className="w-8 h-8 bg-zinc-900/90 hover:bg-rose-600 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg flex items-center justify-center text-xs transition-all">🗑️</button>
                    </div>
                  )}

                  {isLoggedIn && !isAdmin && product.seller_id === currentUser?.id && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Meu produto</span>
                    </div>
                  )}
                  {inCart && !canEdit && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">✓ No carrinho</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-2">{product.description}</p>

                  {/* ⭐ Estrelas de avaliação */}
                  <div className="flex items-center gap-2 mb-3">
                    {stat && stat.total > 0 ? (
                      <>
                        <Stars rating={Number(stat.average)} size="sm" />
                        <span className="text-amber-400 text-xs font-bold">{Number(stat.average).toFixed(1)}</span>
                        <span className="text-zinc-600 text-xs">({stat.total})</span>
                      </>
                    ) : (
                      <span className="text-zinc-700 text-xs">Sem avaliações ainda</span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <span className="text-xl font-black text-indigo-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <p className="text-xs text-zinc-600 mt-0.5">{product.stock} em estoque</p>
                  </div>

                  {canEdit ? (
                    <button onClick={() => router.push(`/products/${product.id}`)} className="mt-4 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-all">
                      ✏️ Editar Produto
                    </button>
                  ) : (
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        disabled={product.stock === 0}
                        onClick={() => product.stock > 0 && handleAddToCart(product)}
                        className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all ${
                          justAdded ? 'bg-emerald-600 text-white'
                          : inCart ? 'bg-zinc-800 hover:bg-zinc-700 border border-indigo-600/50 text-indigo-400'
                          : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {justAdded ? '✓ Adicionado!' : inCart ? '+ Adicionar mais' : '🛒 Adicionar ao Carrinho'}
                      </button>
                      <button
                        disabled={product.stock === 0}
                        onClick={() => product.stock > 0 && router.push(`/cart?produto=${product.id}`)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        {product.stock > 0 ? 'Comprar Agora' : 'Indisponível'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-700 rounded-2xl p-20 text-center">
          {search ? (
            <>
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-lg font-bold text-white mb-2">Nenhum resultado para &quot;{search}&quot;</h3>
              <p className="text-zinc-500 text-sm">Tente outro termo de busca.</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-4">🏪</p>
              <h3 className="text-lg font-bold text-white mb-2">A loja está vazia</h3>
              <p className="text-zinc-500 text-sm mb-6">Seja o primeiro a anunciar!</p>
              <Link href="/products/create"><Button variant="primary" className="w-auto px-8 mx-auto">Criar anúncio</Button></Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
