import { instanceAxs } from '../lib/axios';
import type { User } from '../types/user';
import type { Product } from '../types/product';

interface FavoriteResponse {
  message: string;
  user?: User;
}

export const addToFavoritesApi = async (annonceId: string): Promise<FavoriteResponse> => {
  const res = await instanceAxs.post<FavoriteResponse>('/favorites/add', { id: annonceId });
  return res.data;
};

export const removeFromFavoritesApi = async (annonceId: string): Promise<FavoriteResponse> => {
  const res = await instanceAxs.post<FavoriteResponse>('/favorites/remove', { id: annonceId });
  return res.data;
};

export const getFavoritesApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<{ productArray: Product[] }>('/favorites/get');
  return res.data.productArray;
};
