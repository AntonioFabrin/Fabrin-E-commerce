'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--royal) 0%, var(--plum) 60%, #3B0764 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Círculos decorativos */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(168,85,247,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(196,160,255,0.12)', border: '1px solid rgba(196,160,255,0.25)',
            color: 'var(--lilac)', fontSize: 12, fontWeight: 600,
            padding: '5px 16px', borderRadius: 'var(--radius-pill)',
            letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 24,
          }}>✦ Marketplace Premium</div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 700,
            color: '#F3E8FF', lineHeight: 1.1, marginBottom: 16,
          }}>
            Sua loja,<br /><em style={{ color: 'var(--lavender)', fontStyle: 'italic' }}>seu estilo</em>
          </h1>

          <p style={{ fontSize: 16, color: '#8B6BA8', marginBottom: 36, lineHeight: 1.7 }}>
            Produtos selecionados com qualidade garantida.<br />
            Compre com segurança, pague com Pix, boleto ou cartão.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--violet)', color: '#F3E8FF',
                border: 'none', borderRadius: 'var(--radius-pill)',
                padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >Explorar produtos →</button>
            </Link>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'transparent', color: '#C4A0FF',
                border: '1.5px solid rgba(196,160,255,0.35)',
                borderRadius: 'var(--radius-pill)', padding: '14px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,160,255,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >Quero vender</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--plum)', padding: '24px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        }}>
          {[
            { val: '2.4k+', lbl: 'Produtos' },
            { val: '980', lbl: 'Vendedores' },
            { val: '4.9 ★', lbl: 'Avaliação média' },
            { val: '100%', lbl: 'Pagamento seguro' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 16px', borderRight: i < 3 ? '1px solid rgba(196,160,255,0.15)' : 'none' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#E8D5FF', marginBottom: 2 }}>{s.val}</p>
              <p style={{ fontSize: 11, color: '#9D7EC9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--royal)', marginBottom: 10 }}>
            Por que o FabrinMarket?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>Tecnologia moderna a serviço de quem vende e de quem compra.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { icon: '🔒', title: 'Pagamento seguro', desc: 'Integração com Mercado Pago. Pix, boleto e cartão.' },
            { icon: '⭐', title: 'Avaliações reais', desc: 'Só quem comprou pode avaliar. Transparência total.' },
            { icon: '🛒', title: 'Carrinho completo', desc: 'Compre de múltiplos vendedores em uma só compra.' },
            { icon: '📦', title: 'Painel do vendedor', desc: 'Gerencie produtos, pedidos e vendas com facilidade.' },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '28px 24px', textAlign: 'center',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--lilac)'; el.style.boxShadow = '0 8px 32px rgba(124,58,237,0.1)'; el.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--royal)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div style={{
        background: 'linear-gradient(135deg, var(--royal), var(--plum))',
        padding: '64px 24px', textAlign: 'center', margin: '0 24px 48px', borderRadius: 'var(--radius-xl)',
        maxWidth: 1100 - 48, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#F3E8FF', marginBottom: 12 }}>
          Pronto para começar?
        </h2>
        <p style={{ fontSize: 15, color: '#8B6BA8', marginBottom: 32 }}>Crie sua conta gratuitamente e comece a vender hoje.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'var(--violet)', color: '#F3E8FF', border: 'none', borderRadius: 'var(--radius-pill)', padding: '13px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Criar conta grátis →</button>
          </Link>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'transparent', color: '#C4A0FF', border: '1.5px solid rgba(196,160,255,0.3)', borderRadius: 'var(--radius-pill)', padding: '13px 32px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Ver produtos</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
