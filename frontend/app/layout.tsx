import React from 'react';
import '../styles/globals.css';
import { CartProvider } from '../contexts/CartContext';
import { ToastProvider } from '../components/ui/Toast';
import Header from '../components/Header';

export const metadata = {
  title: 'Fabrin Market — Marketplace Premium',
  description: 'Produtos selecionados com qualidade garantida.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <ToastProvider>
          <Header />

          <main style={{ minHeight: 'calc(100vh - 64px - 72px)' }}>
            {children}
          </main>

          <footer style={{
            background: 'var(--royal)',
            borderTop: '1px solid rgba(196,160,255,0.1)',
          }}>
            <div style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#9D7EC9' }}>
                Fabrin<span style={{ color: 'var(--lavender)' }}>Market</span>
              </span>
              <span style={{ color: '#4A3566', fontSize: 12 }}>
                © 2026 · Desenvolvido por Antonio Dev
              </span>
            </div>
          </footer>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
