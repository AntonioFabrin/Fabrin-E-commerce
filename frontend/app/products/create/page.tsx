'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: 20 }}>
    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 20 }}>{title}</p>
    {children}
  </div>
);

export default function CreateProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }
    try {
      const fd = new FormData();
      fd.append('name', name); fd.append('description', description);
      fd.append('price', price); fd.append('stock', stock);
      fd.append('category_id', '1');
      if (imageFile) fd.append('image', imageFile);
      await axios.post('http://localhost:3333/api/products', fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao criar produto.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Dashboard</Link>
        <span>/</span><span>Novo Produto</span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--royal)', marginBottom: 6 }}>Publicar Anúncio</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Preencha os dados do produto para publicá-lo na loja.</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <SectionCard title="Informações do Produto">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Nome do produto" placeholder="Ex: Teclado Mecânico RGB" value={name} onChange={e => setName(e.target.value)} required />
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 6 }}>Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Descreva seu produto com detalhes..."
                style={{ width: '100%', padding: '11px 16px', background: '#F9F5FF', border: '1.5px solid var(--mist)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)', minHeight: 100, resize: 'vertical', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--mist)'; e.target.style.background = '#F9F5FF'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Preço (R$)" type="number" placeholder="299.90" value={price} onChange={e => setPrice(e.target.value)} required />
              <Input label="Estoque" type="number" placeholder="50" value={stock} onChange={e => setStock(e.target.value)} required />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Foto do Produto">
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', cursor: 'pointer', transition: 'all 0.2s', background: imagePreview ? 'transparent' : 'var(--cream)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLElement).style.background = '#F5F3FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = imagePreview ? 'transparent' : 'var(--cream)'; }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
            ) : (
              <>
                <span style={{ fontSize: 36, marginBottom: 10, opacity: 0.5 }}>📷</span>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>Clique para escolher uma imagem</p>
                <p style={{ fontSize: 12, color: '#C4B5D4' }}>PNG ou JPEG</p>
              </>
            )}
            <input type="file" accept="image/png,image/jpeg" onChange={handleFile} required style={{ display: 'none' }} />
          </label>
          {imageFile && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>{imageFile.name}</p>}
        </SectionCard>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" size="lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar produto →'}
          </Button>
          <Button type="button" variant="ghost" size="lg" style={{ flex: 1 }} onClick={() => router.push('/dashboard')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
