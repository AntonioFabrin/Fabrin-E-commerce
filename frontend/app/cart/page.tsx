'use client';
import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // mantido apenas para o ViaCEP (API externa)
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api, { API, extractErrorMessage } from '../../lib/api';

const Spin = () => (
  <>
    <div style={{ width: 36, height: 36, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

function CartItems({ onNext }: { onNext: () => void }) {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  if (!items.length) return (
    <div style={{ maxWidth: 560, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <p style={{ fontSize: 56, marginBottom: 16 }}>🛒</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--royal)', marginBottom: 10 }}>Carrinho vazio</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>Adicione produtos da loja para continuar.</p>
      <Link href="/products" style={{ display: 'inline-block' }}>
        <Button variant="primary" style={{ width: 'auto', padding: '12px 32px' }}>Explorar loja →</Button>
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        <Link href="/products" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Loja</Link>
        <span>/</span><span>Carrinho</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--royal)' }}>
          Meu Carrinho <span style={{ fontSize: 18, color: 'var(--muted)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>({items.length} iten{items.length > 1 ? 's' : ''})</span>
        </h1>
        <button onClick={() => confirm('Limpar carrinho?') && clearCart()} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Limpar tudo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--mist)', overflow: 'hidden', flexShrink: 0 }}>
                {item.image_url
                  ? <img src={`${API}/${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, opacity: 0.4 }}>📦</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: 'var(--royal)', fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--violet)' }}>R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--mist)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--royal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--royal)', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.stock))} disabled={item.quantity >= item.stock} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--mist)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--royal)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.quantity >= item.stock ? 0.4 : 1 }}>+</button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--royal)', fontSize: 16 }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                <button onClick={() => removeItem(item.id)} style={{ fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>remover</button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'sticky', top: 88 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Resumo do pedido</p>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{item.name} ×{item.quantity}</span>
              <span style={{ color: 'var(--royal)', fontWeight: 500, flexShrink: 0 }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--royal)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--royal)' }}>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 20 }}>Frete a calcular</p>
            <Button variant="primary" size="lg" onClick={onNext}>Continuar para entrega →</Button>
            <Link href="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>← Continuar comprando</Link>
          </div>
          <div style={{ marginTop: 20, padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>⚡ Pix · 📄 Boleto · 💳 Cartão</p>
            <p style={{ fontSize: 11, color: '#C4B5D4', marginTop: 2 }}>🔒 Mercado Pago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartCheckout({ onBack }: { onBack: () => void }) {
  const { items, totalPrice, clearCart } = useCart();
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [cep, setCep]                 = useState('');
  const [street, setStreet]           = useState('');
  const [num, setNum]                 = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity]               = useState('');
  const [state, setState]             = useState('');
  const [loadingCep, setLoadingCep]   = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  const handleCepBlur = async () => {
    const c = cep.replace(/\D/g, '');
    if (c.length !== 8) return;
    setLoadingCep(true);
    try {
      // ViaCEP é uma API pública externa — usa axios direto (sem token)
      const r = await axios.get(`https://viacep.com.br/ws/${c}/json/`);
      if (!r.data.erro) {
        setStreet(r.data.logradouro || '');
        setNeighborhood(r.data.bairro || '');
        setCity(r.data.localidade || '');
        setState(r.data.uf || '');
      }
    } catch { } finally { setLoadingCep(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await api.post('/api/payment/preference-cart', {
        items: items.map(i => ({
          id: String(i.id),
          title: i.name,
          quantity: i.quantity,
          currency_id: 'BRL',
          unit_price: parseFloat(Number(i.price).toFixed(2)),
        })),
        total: totalPrice,
        buyer: { name, email, phone, cep, street, number: num, neighborhood, city, state },
        cartItems: items,
      });
      const url = res.data.sandbox_init_point || res.data.init_point;
      if (url) { clearCart(); window.location.href = url; }
      else setError('Não foi possível gerar o link de pagamento.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao processar. Tente novamente.'));
    } finally { setSubmitting(false); }
  };

  const SField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px',
    background: '#F9F5FF', border: '1.5px solid var(--mist)',
    borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--ink)',
    outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        <Link href="/products" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Loja</Link>
        <span>/</span>
        <button onClick={onBack} style={{ color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0 }}>Carrinho</button>
        <span>/</span><span>Entrega</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--royal)', marginBottom: 6 }}>Dados de Entrega</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 32 }}>Preencha seus dados para finalizar o pedido.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 20 }}>👤 Dados Pessoais</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Nome completo" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Telefone" type="tel" placeholder="(44) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 20 }}>📦 Endereço de Entrega</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
              <Input label={loadingCep ? 'Buscando...' : 'CEP'} placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} onBlur={handleCepBlur} maxLength={9} required />
              <Input label="Rua" placeholder="Nome da rua" value={street} onChange={e => setStreet(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12, marginBottom: 12 }}>
              <Input label="Número" placeholder="123" value={num} onChange={e => setNum(e.target.value)} required />
              <Input label="Bairro" placeholder="Seu bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required />
              <Input label="Cidade" placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} required />
            </div>
            <SField label="Estado">
              <select value={state} onChange={e => setState(e.target.value)} required style={inputStyle}>
                <option value="">Selecione</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf}>{uf}</option>)}
              </select>
            </SField>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="button" variant="ghost" size="lg" style={{ width: 'auto', padding: '13px 24px', flexShrink: 0 }} onClick={onBack}>← Voltar</Button>
            <Button type="submit" variant="primary" size="lg" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Redirecionando...' : '🔒 Finalizar e Pagar'}
            </Button>
          </div>
        </form>

        {/* Resumo lateral */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'sticky', top: 88 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Resumo</p>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--mist)', overflow: 'hidden', flexShrink: 0 }}>
                {item.image_url
                  ? <img src={`${API}/${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--royal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>×{item.quantity}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--royal)', flexShrink: 0 }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600, color: 'var(--royal)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--royal)' }}>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageContent() {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  return step === 'cart'
    ? <CartItems onNext={() => setStep('checkout')} />
    : <CartCheckout onBack={() => setStep('cart')} />;
}

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin /></div>}>
      <CartPageContent />
    </Suspense>
  );
}
