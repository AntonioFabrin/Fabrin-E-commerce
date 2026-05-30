'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../../contexts/CartContext';
import { useCurrentUser } from '../../../hooks/useAuth';
import api, { extractErrorMessage } from '../../../lib/api';
import { getImageUrl } from '../../../lib/images';
import type { Product } from '../../../types/api';

const Spin = () => (
  <>
    <div style={{ width: 36, height: 36, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const user = useCurrentUser();
  const { addItem, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
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
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/api/products/${productId}`)
      .then(r => {
        const p = r.data as Product;
        setProduct(p);
        setName(p.name ?? '');
        setDescription(p.description ?? '');
        setPrice(String(p.price ?? ''));
        setStock(String(p.stock ?? ''));
        if (p.image_url) setCurrentImage(getImageUrl(p.image_url));
      })
      .catch(() => setError('Produto nao encontrado.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const canEdit = !!product && !!user && (user.role === 'admin' || (user.role === 'seller' && product.seller_id === user.id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('name', name);
      payload.append('description', description);
      payload.append('price', String(Number(price)));
      payload.append('stock', String(Number(stock)));
      if (imageFile) payload.append('image', imageFile);

      await api.put(`/api/products/${productId}`, payload);
      router.push('/products');
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao atualizar produto.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
      seller_id: product.seller_id,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando produto...</p>
    </div>
  );

  if (error || !product) return (
    <div style={{ maxWidth: 520, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--royal)', marginBottom: 10 }}>Produto nao encontrado</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>{error || 'Esse anuncio nao esta disponivel.'}</p>
      <Button variant="outline" style={{ width: 'auto', padding: '10px 28px', margin: '0 auto' }} onClick={() => router.push('/products')}>Voltar para a loja</Button>
    </div>
  );

  if (!canEdit) {
    const inCart = isInCart(product.id);
    const imageUrl = getImageUrl(product.image_url);
    const unavailable = product.stock <= 0;

    return (
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 56px' }}>
        <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
          <Link href="/products" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Loja</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 0.9fr)', gap: 32, alignItems: 'start' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '1 / 1', background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 72, opacity: 0.35 }}>📦</span>
              )}
            </div>
          </div>

          <section style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 30 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: unavailable ? '#DC2626' : '#059669', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
              {unavailable ? 'Indisponivel' : `${product.stock} em estoque`}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 1.15, color: 'var(--royal)', marginBottom: 12 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 22 }}>
              {product.description || 'Produto disponivel no marketplace FabrinMarket.'}
            </p>

            <div style={{ borderTop: '1px solid var(--mist)', borderBottom: '1px solid var(--mist)', padding: '20px 0', marginBottom: 22 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Preco</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--royal)', lineHeight: 1.1 }}>
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Pix, boleto ou cartao via Mercado Pago</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                disabled={unavailable}
                onClick={handleBuyNow}
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  background: unavailable ? 'var(--mist)' : 'var(--violet)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  color: unavailable ? 'var(--muted)' : '#F3E8FF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: unavailable ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {unavailable ? 'Produto indisponivel' : 'Comprar agora'}
              </button>
              <button
                disabled={unavailable}
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: added ? '#059669' : inCart ? '#F5F3FF' : 'var(--mist)',
                  border: `1px solid ${added ? '#059669' : inCart ? 'var(--lilac)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-pill)',
                  color: added ? '#ECFDF5' : inCart ? 'var(--violet)' : 'var(--royal)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: unavailable ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  opacity: unavailable ? 0.5 : 1,
                }}
              >
                {added ? 'Adicionado ao carrinho' : inCart ? 'Adicionar mais um' : 'Adicionar ao carrinho'}
              </button>
            </div>

            <Link href={`/products/seller-products?id=${product.seller_id}`} style={{ display: 'block', textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 12, textDecoration: 'none' }}>
              Ver perfil do vendedor
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Dashboard</Link>
        <span>/</span>
        <Link href="/products" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Loja</Link>
        <span>/</span><span>Editar Produto</span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--royal)', marginBottom: 6 }}>Editar Produto</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Atualize as informacoes do seu anuncio.</p>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
          <span>!</span><span>{error}</span>
        </div>
      )}

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Nome do Produto" value={name} onChange={e => setName(e.target.value)} required />

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 6 }}>Descricao</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required
              style={{ width: '100%', padding: '11px 16px', background: '#F9F5FF', border: '1.5px solid var(--mist)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)', minHeight: 100, resize: 'vertical', transition: 'all 0.2s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--violet)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--mist)'; e.target.style.background = '#F9F5FF'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Preco (R$)" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
            <Input label="Estoque" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 10 }}>Imagem do Produto</label>
            {(imagePreview || currentImage) && (
              <div style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 180, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <img src={imagePreview ?? currentImage ?? ''} alt="Preview" style={{ maxHeight: 180, objectFit: 'contain' }} />
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', transition: 'all 0.2s' }}>
              <span>Foto</span>
              <span>{imageFile ? imageFile.name : 'Clique para trocar a imagem (opcional)'}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Deixe em branco para manter a imagem atual.</p>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <Button type="submit" variant="primary" size="lg" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alteracoes'}
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
