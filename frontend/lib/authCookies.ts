const COOKIE_BASE = 'path=/; SameSite=Lax';

function getCookieAttributes(): string {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  return secure ? `${COOKIE_BASE}; Secure` : COOKIE_BASE;
}

export function setRouteAuthCookies(role: string): void {
  const attributes = getCookieAttributes();
  document.cookie = `@Ecommerce:logged=1; ${attributes}`;
  document.cookie = `@Ecommerce:role=${role}; ${attributes}`;
}

export function clearRouteAuthCookies(): void {
  const attributes = getCookieAttributes();
  document.cookie = `@Ecommerce:logged=; ${attributes}; max-age=0`;
  document.cookie = `@Ecommerce:role=; ${attributes}; max-age=0`;
}
