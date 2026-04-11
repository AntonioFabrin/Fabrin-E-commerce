'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name?: string;
}

/** Decodifica o payload do JWT apenas para uso de UI (sem verificar assinatura).
 *  A validação real sempre acontece no backend via authMiddleware.
 *  Injeta o 'name' do localStorage (salvo no login), pois o JWT não o inclui. */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const savedName = typeof window !== 'undefined'
      ? localStorage.getItem('@Ecommerce:name') ?? undefined
      : undefined;
    return { ...payload, name: savedName };
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('@Ecommerce:token');
}

export function logout(router?: ReturnType<typeof useRouter>) {
  localStorage.removeItem('@Ecommerce:token');
  localStorage.removeItem('@Ecommerce:name');
  document.cookie = '@Ecommerce:logged=; path=/; max-age=0';
  document.cookie = '@Ecommerce:role=; path=/; max-age=0';
  if (router) router.push('/login');
}

/** Hook que lê o usuário logado sem forçar redirect.
 *  Útil em páginas onde login é opcional (ex: vitrine de produtos). */
export function useCurrentUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) setUser(decodeJwtPayload(token));
  }, []);

  return user;
}

/** Hook que exige login. Redireciona para /login se não houver token. */
export function useRequireAuth(): { user: AuthUser | null; token: string | null; loading: boolean } {
  const router = useRouter();
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    const decoded = decodeJwtPayload(token);
    if (!decoded) {
      logout(router);
      return;
    }
    setUser(decoded);
    setLoading(false);
  }, [router]);

  return { user, token: getToken(), loading };
}
