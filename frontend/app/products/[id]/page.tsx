'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

function decodeToken(token: string): { id: number; role: string } | null {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

const Spin = () => (
  <>
    <div style={{ width: 36, height: 36, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }
    const user = decodeToken(token);
    if (!user) { router.push('/login'); return; }

    axios.get(`http://localhost:3333/api/products/${productId}`)
      .then(r => {
        const p = r.data;
        if (user.role !== 'admin' && p.seller_id !== user.id) { setForbidden(true); return; }
        setName(p.name ?? '');
        setDescription(p.description ?? '');
        setPrice(String(p.price ?? ''));
        setStock(String(p.stock ?? ''));
        if (p.image_url) setCurrentImage(`http://localhost:3333/${p.image_url}`);
      })
      .catch(() => setError('Produto não encontrado.'))
      .finally(() => setLoading(false));
  }, [productId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }
    try {
      await axios.put(`http://localhost:3333/api/products/${productId}`,
        { name, description, price: Number(price), stock: Number(stock) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/products');
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao atualizar produto.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando produto...</p>
    </div>
  );

  if (forbidden) return (
    <div style={{ maxWidth: 440, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <p style={{ fontSize: 56, marginBottom: 16 }}>🔒</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--royal)', marginBottom: 10 }}>Acesso Negado</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Você não pode editar produtos de outros vendedores.</p>
      <Button variant="outline" style={{ width: 'auto', padding: '10px 28px', margin: '0 auto' }} onClick={() => router.push('/products')}>← Voltar para a Loja</Button>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Dashboard</Link>
        <span>/</span>
        <Link href="/products" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Loja</Link>
        <span>/</span><span>Editar Produto</span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--royal)', marginBottom: 6 }}>Editar Produto</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Atualize as informações do seu anúncio.</p>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Nome do Produto" value={name} onChange={e => setName(e.target.value)} required />

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 6 }}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required
              style={{ width: '100%', padding: '11px 16px', background: '#F9F5FF', border: '1.5px solid var(--mist)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)', minHeight: 100, resize: 'vertical', transition: 'all 0.2s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--mist)'; e.target.style.background = '#F9F5FF'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Preço (R$)" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
            <Input label="Estoque" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
          </div>

          {/* Imagem */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 10 }}>Imagem do Produto</label>
            {(imagePreview || currentImage) && (
              <div style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 180, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <img src={imagePreview ?? currentImage ?? ''} alt="Preview" style={{ maxHeight: 180, objectFit: 'contain' }} />
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLElement).style.background = '#F5F3FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span>📷</span>
              <span>{imageFile ? imageFile.name : 'Clique para trocar a imagem (opcional)'}</span>
              <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Deixe em branco para manter a imagem atual.</p>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <Button type="submit" variant="primary" size="lg" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar Alterações'}
            </Button>
            <Button type="button" variant="ghost" size="lg" style={{ flex: 1 }} onClick={() => router.push('/products')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
