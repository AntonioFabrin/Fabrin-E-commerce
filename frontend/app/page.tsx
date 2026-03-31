'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('@Ecommerce:token');
    
    // Se o cara já tem token, manda pro Dashboard. Se não, manda pro Login.
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 font-medium">Redirecionando...</p>
    </div>
  );
}