'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

// Decodifica o payload do JWT sem biblioteca externa
function decodeToken(token: string): { id: number; role: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return { id: decoded.id, role: decoded.role };
  } catch {
    return null;
  }
}

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
  const [forbidden, setForbidden] = useState(false); // true = produto de outro vendedor

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }

    const user = decodeToken(token);
    if (!user) { router.push('/login'); return; }

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3333/api/products/${productId}`);
        const p = response.data;

        // Bloqueia no frontend se não for o dono e não for admin
        if (user.role !== 'admin' && p.seller_id !== user.id) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        setName(p.name ?? '');
        setDescription(p.description ?? '');
        setPrice(String(p.price ?? ''));
        setStock(String(p.stock ?? ''));
        if (p.image_url) setCurrentImage(`http://localhost:3333/${p.image_url}`);
      } catch {
        setError('Produto não encontrado.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) { router.push('/login'); return; }

    try {
      await axios.put(
        `http://localhost:3333/api/products/${productId}`,
        { name, description, price: Number(price), stock: Number(stock) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/products');
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao atualizar produto.');
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-zinc-500 text-sm">Carregando produto...</span>
        </div>
      </div>
    );
  }

  // Acesso negado — produto de outro vendedor
  if (forbidden) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          Acesso Negado
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Você não pode editar produtos de outros vendedores. Apenas o dono do produto ou um administrador pode fazer isso.
        </p>
        <Button variant="outline" className="w-auto px-8 mx-auto" onClick={() => router.push('/products')}>
          ← Voltar para a Loja
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 md:px-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-400 transition-colors">Loja</Link>
        <span>/</span>
        <span className="text-zinc-300">Editar Produto</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Editar Produto
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Atualize as informações do seu anúncio.</p>

      {error && (
        <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm flex items-start gap-3">
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <Input
            label="Nome do Produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Descrição</label>
            <textarea
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 min-h-[110px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço (R$)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Estoque"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          {/* Imagem */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-3">
              Imagem do Produto
            </label>
            {(imagePreview || currentImage) && (
              <div className="mb-3 rounded-xl overflow-hidden border border-zinc-700 h-44 bg-zinc-800 flex items-center justify-center">
                <img src={imagePreview ?? currentImage ?? ''} alt="Preview" className="max-h-44 object-contain" />
              </div>
            )}
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl cursor-pointer transition-all hover:bg-indigo-950/20 text-sm text-zinc-400 hover:text-zinc-200">
              <span>📷</span>
              <span>{imageFile ? imageFile.name : 'Clique para trocar a imagem (opcional)'}</span>
              <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-zinc-600 text-xs mt-1.5 ml-1">Deixe em branco para manter a imagem atual.</p>
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </span>
              ) : '💾 Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => router.push('/products')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
