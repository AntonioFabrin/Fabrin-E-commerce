'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
      const response = await axios.post('http://127.0.0.1:3333/api/login', { email, password });
      const token = response.data.token;
      if (token) {
        localStorage.setItem('@Ecommerce:token', token);
        router.push('/dashboard');
      } else {
        setError('Falha na autenticação. Tente novamente.');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setError('Servidor offline. Verifique se o backend está rodando na porta 3333.');
      } else {
        setError(err.response?.data?.erro || 'E-mail ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-900/50">
            <span className="text-white font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>F</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Bem-vindo de volta
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Entre na sua conta para gerenciar sua loja</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm flex items-start gap-3">
              <span className="text-rose-500 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Entrando...
                  </span>
                ) : 'Acessar Painel'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
