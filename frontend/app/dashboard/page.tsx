'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '../../components/ui/Button';

interface StatCardProps {
  label: string;
  value: string | number;
  accent: string;
  icon: string;
}

function StatCard({ label, value, accent, icon }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
        <span className="text-3xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [sellerOrderCount, setSellerOrderCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [productsRes, ordersRes] = await Promise.allSettled([
          axios.get('http://localhost:3333/api/products/seller', { headers }),
          axios.get('http://localhost:3333/api/orders/seller', { headers }),
        ]);

        if (productsRes.status === 'fulfilled') {
          const products = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
          setProductCount(products.length);
        }
        if (ordersRes.status === 'fulfilled') {
          const orders = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
          setSellerOrderCount(orders.length);
        }
      } catch { /* silencia */ } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('@Ecommerce:token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-zinc-500 text-sm">Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <p className="text-zinc-500 text-sm mb-1">Bem-vindo de volta 👋</p>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Painel do Vendedor
          </h1>
        </div>
        <Button variant="outline" size="sm" className="w-auto" onClick={handleLogout}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Sair
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <StatCard label="Total de Produtos" value={productCount} accent="bg-indigo-500" icon="📦" />
        <StatCard label="Pedidos Recebidos" value={sellerOrderCount} accent="bg-emerald-500" icon="🛒" />
        <StatCard label="Vendas do mês" value="R$ 0,00" accent="bg-violet-500" icon="💰" />
      </div>

      {/* Ações rápidas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-5">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/products/create" className="block">
            <div className="border border-zinc-700 hover:border-indigo-500 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:bg-indigo-950/30">
              <div className="text-2xl mb-3">➕</div>
              <p className="font-semibold text-white text-sm">Novo Produto</p>
              <p className="text-zinc-500 text-xs mt-1">Publicar um novo anúncio</p>
            </div>
          </Link>
          <Link href="/products/seller-products" className="block">
            <div className="border border-zinc-700 hover:border-emerald-500 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:bg-emerald-950/30">
              <div className="text-2xl mb-3">📦</div>
              <p className="font-semibold text-white text-sm">Meus Produtos</p>
              <p className="text-zinc-500 text-xs mt-1">Gerenciar estoque e preços</p>
            </div>
          </Link>
          <Link href="/orders" className="block">
            <div className="border border-zinc-700 hover:border-amber-500 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:bg-amber-950/30 relative">
              <div className="text-2xl mb-3">🧾</div>
              <p className="font-semibold text-white text-sm">Pedidos</p>
              <p className="text-zinc-500 text-xs mt-1">Compras e vendas recebidas</p>
              {sellerOrderCount > 0 && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {sellerOrderCount}
                </span>
              )}
            </div>
          </Link>
          <Link href="/products" className="block">
            <div className="border border-zinc-700 hover:border-violet-500 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:bg-violet-950/30">
              <div className="text-2xl mb-3">🏪</div>
              <p className="font-semibold text-white text-sm">Ver Loja</p>
              <p className="text-zinc-500 text-xs mt-1">Como os clientes te veem</p>
            </div>
          </Link>
        </div>
      </div>

      {productCount === 0 && (
        <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
          <p className="text-4xl mb-4">🚀</p>
          <h3 className="text-lg font-bold text-white mb-2">Sua loja está vazia</h3>
          <p className="text-zinc-500 text-sm mb-6">Crie seu primeiro produto e comece a vender hoje!</p>
          <Link href="/products/create">
            <Button variant="primary" className="w-auto px-8 mx-auto">Criar primeiro produto</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
