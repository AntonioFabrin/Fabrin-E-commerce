'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api, { extractErrorMessage } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('@Ecommerce:token', res.data.token);
        // Salva o nome para o useAuth poder exibir sem nova request
        if (res.data.user?.name) {
          localStorage.setItem('@Ecommerce:name', res.data.user.name);
        }
        // Cookies lidos pelo middleware.ts no servidor
        document.cookie = '@Ecommerce:logged=1; path=/';
        // Salva o role para o middleware poder bloquear rotas por role
        const role = res.data.user?.role ||
          JSON.parse(atob(res.data.token.split('.')[1]))?.role || 'customer';
        document.cookie = `@Ecommerce:role=${role}; path=/`;
        // Redireciona por role
        if (role === 'customer') {
          router.push('/account');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'E-mail ou senha inválidos.'));
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

        {/* Card */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 40px',
          boxShadow: '0 24px 80px rgba(45,20,87,0.12)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, var(--violet), var(--lavender))',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff' }}>F</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--royal)', marginBottom: 6 }}>
              Bem-vindo de volta
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Entre com suas credenciais para continuar</p>
          </div>

          {/* Erro */}
          {error && (
            <div style={{
              marginBottom: 20,
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              color: '#DC2626',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}>
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />

            <div style={{ marginTop: 4 }}>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Entrando...
                  </span>
                ) : 'Entrar no painel →'}
              </Button>
            </div>
          </form>

          <div style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: '1px solid var(--mist)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--muted)',
          }}>
            Não tem uma conta?{' '}
            <Link href="/register" style={{ color: 'var(--violet)', fontWeight: 600, textDecoration: 'none' }}>
              Cadastre-se grátis
            </Link>
          </div>
        </div>

        {/* Rodapé do card */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#C4B5D4', marginTop: 20 }}>
          Pagamentos seguros via Mercado Pago · SSL 256-bit
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
