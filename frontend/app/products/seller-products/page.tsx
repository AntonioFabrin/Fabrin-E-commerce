'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '../../../components/ui/Button';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        // Usa a rota /seller — retorna array direto dos produtos do usuário logado
        const response = await axios.get('http://localhost:3333/api/products/seller', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(response.data) ? response.data : [];
        setProducts(data);
      } catch (err: any) {
        setError('Não foi possível carregar os produtos. Verifique se o backend está rodando.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-zinc-500 text-sm">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-zinc-300">Meus Produtos</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Meus Produtos
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {products.length > 0
              ? `${products.length} produto${products.length > 1 ? 's' : ''} cadastrado${products.length > 1 ? 's' : ''}`
              : 'Nenhum produto cadastrado ainda'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="w-auto" onClick={() => router.push('/dashboard')}>
            ← Voltar
          </Button>
          <Button variant="primary" size="sm" className="w-auto" onClick={() => router.push('/products/create')}>
            ➕ Novo Produto
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Cards de resumo */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {products.length}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Em Estoque</p>
            <p className="text-2xl font-black text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              {products.filter((p) => p.stock > 0).length}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Sem Estoque</p>
            <p className="text-2xl font-black text-rose-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              {products.filter((p) => p.stock === 0).length}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Menor Preço</p>
            <p className="text-xl font-black text-indigo-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              R$ {Math.min(...products.map((p) => Number(p.price))).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      )}

      {/* Tabela */}
      {products.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Produto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden md:table-cell">Preço</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden md:table-cell">Estoque</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr
                  key={product.id}
                  className={`border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-800/10'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={`http://localhost:3333/${product.image_url}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-lg">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm line-clamp-1">{product.name}</p>
                        <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-indigo-400 font-bold text-sm">
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-zinc-300 text-sm">{product.stock} un.</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-semibold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Sem estoque
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors font-medium"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-zinc-700 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="text-lg font-bold text-white mb-2">Nenhum produto ainda</h3>
          <p className="text-zinc-500 text-sm mb-8">Adicione seu primeiro produto para começar a vender.</p>
          <Button variant="primary" className="w-auto px-8 mx-auto" onClick={() => router.push('/products/create')}>
            Criar primeiro produto
          </Button>
        </div>
      )}
    </div>
  );
}
