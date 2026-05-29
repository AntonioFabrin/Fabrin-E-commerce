import { API } from './api';

export const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API}/${imageUrl.replace(/^\/+/, '')}`;
};
