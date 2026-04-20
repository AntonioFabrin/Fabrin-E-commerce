export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#0f0a1e', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#E8D5FF' }}>
          <p style={{ fontSize: 64, margin: 0 }}>404</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '12px 0 8px' }}>Página não encontrada</h1>
          <p style={{ color: '#9D7EC9', marginBottom: 28 }}>O endereço que você acessou não existe.</p>
          <a href="/" style={{ background: '#7C3AED', color: '#F3E8FF', padding: '12px 28px', borderRadius: 999, textDecoration: 'none', fontWeight: 600 }}>
            Voltar ao início
          </a>
        </div>
      </body>
    </html>
  );
}
