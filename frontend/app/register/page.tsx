'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api, { extractErrorMessage } from '../../lib/api';

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'customer' | 'seller'>('customer');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/register', { name, email, password, role });
      router.push('/login?registered=true');
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao criar conta. Tente novamente.'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 136px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(160deg, var(--cream) 0%, var(--mist) 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 40px',
          boxShadow: '0 24px 80px rgba(45,20,87,0.12)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 60, height: 60,
              background: 'linear-gradient(135deg, var(--violet), var(--lavender))',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff' }}>F</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--royal)', marginBottom: 6 }}>
              Criar sua conta
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Escolha como deseja usar o FabrinMarket</p>
          </div>

          {/* Seletor de role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
            {([
              { value: 'customer', icon: '🛍️', title: 'Comprador', desc: 'Quero comprar produtos' },
              { value: 'seller',   icon: '🏪', title: 'Vendedor',  desc: 'Quero vender produtos' },
            ] as const).map(opt => {
              const active = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  style={{
                    padding: '16px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    border: `2px solid ${active ? 'var(--violet)' : 'var(--border)'}`,
                    background: active ? '#F5F3FF' : 'var(--white)',
                    textAlign: 'center', transition: 'all 0.2s',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{opt.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--violet)' : 'var(--royal)', marginBottom: 2 }}>{opt.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{opt.desc}</p>
                  {active && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 0' }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="Nome completo" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />

            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? 'Criando conta...' : `Criar conta como ${role === 'customer' ? 'Comprador' : 'Vendedor'} →`}
            </Button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--mist)', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--violet)', fontWeight: 600, textDecoration: 'none' }}>Faça login</Link>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#C4B5D4', marginTop: 20 }}>
          Ao se cadastrar você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}
