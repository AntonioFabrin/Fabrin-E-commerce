'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '../../../components/ui/Button';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

const Spin = () => (
  <>
    <div style={{ width: 36, height: 36, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }
    axios.get('http://localhost:3333/api/products/seller', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Não foi possível carregar os produtos.'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando produtos...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Dashboard</Link>
        <span>/</span><span>Meus Produtos</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--royal)', marginBottom: 4 }}>Meus Produtos</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            {products.length > 0 ? `${products.length} produto${products.length > 1 ? 's' : ''} cadastrado${products.length > 1 ? 's' : ''}` : 'Nenhum produto ainda'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" size="sm" style={{ width: 'auto' }} onClick={() => router.push('/dashboard')}>← Voltar</Button>
          <Button variant="primary" size="sm" style={{ width: 'auto' }} onClick={() => router.push('/products/create')}>+ Novo Produto</Button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      {products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total', value: products.length, color: 'var(--violet)' },
            { label: 'Em Estoque', value: products.filter(p => p.stock > 0).length, color: '#059669' },
            { label: 'Sem Estoque', value: products.filter(p => p.stock === 0).length, color: '#DC2626' },
            { label: 'Menor Preço', value: `R$ ${Math.min(...products.map(p => Number(p.price))).toFixed(2).replace('.', ',')}`, color: 'var(--violet)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabela */}
      {products.length > 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
                {['Produto', 'Preço', 'Estoque', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product.id} style={{ borderBottom: idx < products.length - 1 ? '1px solid var(--border)' : 'none', background: idx % 2 === 1 ? 'var(--cream)' : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F5F3FF')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 1 ? 'var(--cream)' : 'transparent')}
                >
                  {/* Produto */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--mist)', overflow: 'hidden', flexShrink: 0 }}>
                        {product.image_url
                          ? <img src={`http://localhost:3333/${product.image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--royal)', marginBottom: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</p>
                      </div>
                    </div>
                  </td>
                  {/* Preço */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--violet)' }}>
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  {/* Estoque */}
                  <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--royal)' }}>{product.stock} un.</td>
                  {/* Status */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: product.stock > 0 ? '#ECFDF5' : '#FEF2F2',
                      color: product.stock > 0 ? '#059669' : '#DC2626',
                      border: `1px solid ${product.stock > 0 ? '#A7F3D0' : '#FECACA'}`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {product.stock > 0 ? 'Ativo' : 'Sem estoque'}
                    </span>
                  </td>
                  {/* Ação */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      style={{ fontSize: 12, color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)' }}
                    >Editar →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📦</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--royal)', marginBottom: 8 }}>Nenhum produto ainda</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Adicione seu primeiro produto para começar a vender.</p>
          <Button variant="primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => router.push('/products/create')}>Criar primeiro produto →</Button>
        </div>
      )}
    </div>
  );
}
