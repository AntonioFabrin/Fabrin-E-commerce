import axios from 'axios';
import { getToken } from '../hooks/useAuth';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/** Extrai a mensagem de erro de qualquer resposta/exceção do axios de forma segura. */
export function extractErrorMessage(err: unknown, fallback = 'Erro inesperado. Tente novamente.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data?.erro === 'string') return data.erro;
    if (typeof data?.message === 'string') return data.message;
    if (err.code === 'ERR_NETWORK') return 'Servidor offline. Verifique a conexão.';
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Instância do axios já com baseURL e token injetados automaticamente. */
const api = axios.create({ baseURL: API });

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
