'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', { name, email, password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 136px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(160deg, var(--cream) 0%, var(--mist) 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 40px',
          boxShadow: '0 24px 80px rgba(45,20,87,0.12)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Comece a vender hoje mesmo</p>
          </div>

          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626',
              display: 'flex', gap: 8,
            }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="Nome completo" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />

            <div style={{ marginTop: 4 }}>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar minha conta →'}
              </Button>
            </div>
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
