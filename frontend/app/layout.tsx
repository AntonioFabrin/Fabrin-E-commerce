import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Fabrin Marketplace',
  description: 'A melhor loja de periféricos e tecnologia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-950 min-h-screen flex flex-col antialiased text-zinc-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
              <span className="font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Fabrin<span className="text-indigo-400">Market</span>
              </span>
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest hidden md:block">
              Painel do Vendedor
            </span>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-zinc-800/60 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <span className="text-zinc-600 text-sm">
              © 2026 <span className="text-zinc-400 font-semibold">Fabrin Marketplace</span>
            </span>
            <span className="text-zinc-700 text-xs">Desenvolvido por Antonio Dev</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
