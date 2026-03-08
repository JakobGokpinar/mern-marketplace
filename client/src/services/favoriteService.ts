import { instanceAxs } from '../lib/axios';
import type { User } from '../types/user';
import type { Listing } from '../types/listing';

interface FavoriteResponse {
  message: string;
  user?: User;
}

export const addToFavoritesApi = async (listingId: string): Promise<FavoriteResponse> => {
  const res = await instanceAxs.post<FavoriteResponse>('/user/me/favorites', { id: listingId });
  return res.data;
};

export const removeFromFavoritesApi = async (listingId: string): Promise<FavoriteResponse> => {
  const res = await instanceAxs.delete<FavoriteResponse>('/user/me/favorites/' + listingId);
  return res.data;
};

export const getFavoritesApi = async (): Promise<Listing[]> => {
  const res = await instanceAxs.get<{ productArray: Listing[] }>('/user/me/favorites');
  return res.data.productArray;
};
