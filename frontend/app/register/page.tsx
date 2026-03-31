'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-900/50">
            <span className="text-white font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>F</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Crie sua conta
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Comece a vender hoje mesmo no Fabrin Market</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm flex items-start gap-3">
              <span className="text-rose-500 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="Mínimo 8 caracteres"
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
                    Criando conta...
                  </span>
                ) : 'Criar minha conta'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Ao se cadastrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
}
