'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function CreateProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('@Ecommerce:token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('category_id', categoryId);
      formData.append('seller_id', sellerId);
      if (imageFile) formData.append('image', imageFile);

      await axios.post('http://localhost:3333/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Erro ao criar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 md:px-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-zinc-300">Novo Produto</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Publicar Anúncio
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Preencha os dados do seu produto para publicá-lo na loja.</p>

      {error && (
        <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 text-sm flex items-start gap-3">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <Input
            label="Nome do Produto"
            placeholder="Ex: Teclado Mecânico RGB"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Descrição</label>
            <textarea
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 min-h-[110px] resize-none"
              placeholder="Descreva seu produto com detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço (R$)"
              type="number"
              placeholder="299.90"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Estoque"
              type="number"
              placeholder="50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID da Categoria"
              type="number"
              placeholder="1"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            />
            <Input
              label="Seu ID de Vendedor"
              type="number"
              placeholder="2"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              required
            />
          </div>

          {/* Upload de imagem */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-3">
              Foto do Produto
            </label>
            <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl p-8 cursor-pointer transition-all duration-200 hover:bg-indigo-950/20">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <div className="text-4xl mb-3 opacity-40">📷</div>
                  <p className="text-zinc-400 text-sm font-medium">Clique para escolher uma imagem</p>
                  <p className="text-zinc-600 text-xs mt-1">PNG ou JPEG</p>
                </>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
            </label>
            {imageFile && (
              <p className="text-zinc-500 text-xs mt-2 text-center">{imageFile.name}</p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Publicando...
                </span>
              ) : 'Publicar Produto'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
