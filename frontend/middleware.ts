import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que exigem apenas login (qualquer role)
const REQUIRES_LOGIN = ['/orders', '/account'];

// Rotas que exigem login E role seller ou admin
const REQUIRES_SELLER = ['/dashboard', '/products/create', '/products/seller-products'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsLogin  = REQUIRES_LOGIN.some(r => pathname.startsWith(r));
  const needsSeller = REQUIRES_SELLER.some(r => pathname.startsWith(r));

  if (!needsLogin && !needsSeller) return NextResponse.next();

  const logged = request.cookies.get('@Ecommerce:logged');

  // Não logado → manda para login
  if (!logged) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logado mas tentando acessar rota de vendedor sendo customer
  if (needsSeller) {
    const role = request.cookies.get('@Ecommerce:role')?.value || 'customer';
    if (role === 'customer') {
      // Redireciona para a loja com mensagem
      const productsUrl = new URL('/products', request.url);
      productsUrl.searchParams.set('blocked', '1');
      return NextResponse.redirect(productsUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/account/:path*',
    '/products/create/:path*',
    '/products/seller-products/:path*',
  ],
};
