'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearRouteAuthCookies } from '../lib/authCookies';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name?: string;
}

export const AUTH_CHANGED_EVENT = 'fabrin:auth-changed';

/** Decodifica o payload do JWT apenas para uso de UI (sem verificar assinatura).
 *  A validação real sempre acontece no backend via authMiddleware.
 *  Injeta o 'name' do localStorage (salvo no login), pois o JWT não o inclui. */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
      return null;
    }
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

export function notifyAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function logout(router?: ReturnType<typeof useRouter>) {
  localStorage.removeItem('@Ecommerce:token');
  localStorage.removeItem('@Ecommerce:name');
  clearRouteAuthCookies();
  notifyAuthChanged();
  if (router) router.push('/login');
}

/** Hook que lê o usuário logado sem forçar redirect.
 *  Útil em páginas onde login é opcional (ex: vitrine de produtos). */
export function useCurrentUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const token = getToken();
      setUser(token ? decodeJwtPayload(token) : null);
    };

    syncUser();
    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);
    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser);
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
    };
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
