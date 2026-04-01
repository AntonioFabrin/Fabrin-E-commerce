'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// ── Etapa 1: Itens do carrinho ─────────────────────────────────────────────────
function CartItems({ onNext }: { onNext: () => void }) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          Seu carrinho está vazio
        </h1>
        <p className="text-zinc-500 text-sm mb-8">Adicione produtos da loja para continuar.</p>
        <Link href="/products">
          <Button variant="primary" className="w-auto px-10 mx-auto">Explorar Loja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-6">

      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/products" className="hover:text-indigo-400 transition-colors">Loja</Link>
        <span>/</span>
        <span className="text-zinc-300">Carrinho</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Meu Carrinho
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {totalItems} item{totalItems > 1 ? 's' : ''} selecionado{totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { if (confirm('Limpar todo o carrinho?')) clearCart(); }}
          className="text-xs text-zinc-600 hover:text-rose-400 transition-colors"
        >
          🗑 Limpar tudo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Lista de itens */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-4">
              {/* Imagem */}
              <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img
                    src={`http://localhost:3333/${item.image_url}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{item.name}</h3>
                <p className="text-indigo-400 font-black text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                  R$ {Number(item.price).toFixed(2).replace('.', ',')}
                </p>
                <p className="text-zinc-600 text-xs mt-0.5">{item.stock} em estoque</p>
              </div>

              {/* Quantidade + remover */}
              <div className="flex flex-col items-end justify-between gap-3">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-rose-400 transition-colors text-sm"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.stock))}
                    disabled={item.quantity >= item.stock}
                    className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 rounded-lg text-zinc-300 text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                <p className="text-white font-bold text-sm">
                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Resumo do Pedido</h2>

            <div className="space-y-3 mb-5">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-500 line-clamp-1 flex-1 mr-2">
                    {item.name} <span className="text-zinc-600">×{item.quantity}</span>
                  </span>
                  <span className="text-zinc-300 flex-shrink-0">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-indigo-400 text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-zinc-600 text-xs mt-1">Frete a calcular</p>
            </div>

            <Button variant="primary" size="lg" onClick={onNext}>
              Continuar para Entrega →
            </Button>

            <Link href="/products" className="block text-center mt-4 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              ← Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Etapa 2: Endereço + Pagamento ──────────────────────────────────────────────
function CartCheckout({ onBack }: { onBack: () => void }) {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCepBlur = async () => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cleaned}/json/`);
      if (!res.data.erro) {
        setStreet(res.data.logradouro || '');
        setNeighborhood(res.data.bairro || '');
        setCity(res.data.localidade || '');
        setState(res.data.uf || '');
      }
    } catch { /* silencia */ } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('@Ecommerce:token');

      // Monta um item de preferência consolidado com todos os produtos
      // O MP aceita múltiplos items numa só preferência
      const mpItems = items.map(item => ({
        id: String(item.id),
        title: item.name,
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: parseFloat(Number(item.price).toFixed(2)),
      }));

      const response = await axios.post(
        'http://localhost:3333/api/payment/preference-cart',
        {
          items: mpItems,
          total: totalPrice,
          buyer: { name, email, phone, cep, street, number: houseNumber, neighborhood, city, state },
          cartItems: items, // para gravar no banco
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const url = response.data.sandbox_init_point || response.data.init_point;
      if (url) {
        clearCart(); // limpa o carrinho após redirecionar
        window.location.href = url;
      } else {
        setError('Não foi possível gerar o link de pagamento.');
      }
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao processar. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-6">

      {/* Breadcrumb + steps */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/products" className="hover:text-indigo-400 transition-colors">Loja</Link>
        <span>/</span>
        <button onClick={onBack} className="hover:text-indigo-400 transition-colors">Carrinho</button>
        <span>/</span>
        <span className="text-zinc-300">Dados de Entrega</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
        Dados de Entrega
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Preencha seus dados para finalizar o pedido.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm flex gap-3">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados pessoais */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">👤 Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Nome completo" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Telefone" type="tel" placeholder="(44) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">📦 Endereço de Entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Input
                    label={loadingCep ? 'Buscando...' : 'CEP'}
                    placeholder="00000-000"
                    value={cep}
                    onChange={e => setCep(e.target.value)}
                    onBlur={handleCepBlur}
                    maxLength={9}
                    required
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-9">
                      <svg className="animate-spin w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  )}
                  <p className="text-zinc-600 text-xs mt-1">Saia do campo para auto-preencher</p>
                </div>
                <div className="md:col-span-2">
                  <Input label="Rua" placeholder="Nome da rua" value={street} onChange={e => setStreet(e.target.value)} required />
                </div>
                <Input label="Número" placeholder="123" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} required />
                <Input label="Bairro" placeholder="Seu bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required />
                <Input label="Cidade" placeholder="Sua cidade" value={city} onChange={e => setCity(e.target.value)} required />
                <div className="md:col-span-3">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Estado</label>
                  <select
                    value={state} onChange={e => setState(e.target.value)} required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Selecione o estado</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" size="lg" className="flex-shrink-0 w-auto px-6" onClick={onBack}>
                ← Voltar
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Redirecionando para o Mercado Pago...
                  </span>
                ) : '🔒 Finalizar e Pagar'}
              </Button>
            </div>
            <p className="text-zinc-600 text-xs text-center">Pagamento seguro via Mercado Pago</p>
          </form>
        </div>

        {/* Resumo do carrinho */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">🛒 Resumo</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={`http://localhost:3333/${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-zinc-500 text-xs">×{item.quantity}</p>
                  </div>
                  <p className="text-zinc-300 text-xs flex-shrink-0">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-4">
              <div className="flex justify-between">
                <span className="font-bold text-white text-sm">Total</span>
                <span className="font-black text-indigo-400 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-zinc-800/60 rounded-xl text-center">
              <p className="text-zinc-600 text-xs">⚡ Pix &nbsp;·&nbsp; 📄 Boleto &nbsp;·&nbsp; 💳 Cartão</p>
              <p className="text-zinc-700 text-xs mt-1">🔒 Mercado Pago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal — gerencia etapas ────────────────────────────────────────
function CartPageContent() {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  return step === 'cart'
    ? <CartItems onNext={() => setStep('checkout')} />
    : <CartCheckout onBack={() => setStep('cart')} />;
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}
