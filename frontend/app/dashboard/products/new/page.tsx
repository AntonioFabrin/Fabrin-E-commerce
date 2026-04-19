'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redireciona para a página canônica de criação de produto
export default function NewProductRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/products/create');
  }, [router]);
  return null;
}
