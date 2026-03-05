import { instanceAxs } from '../lib/axios';
import type { Product } from '../types/product';

interface SearchParams {
  q?: string;
  fylke?: string;
  kommune?: string[];
  category?: string;
  subcategory?: string;
  min_price?: string;
  max_price?: string;
  date?: string;
  status?: string;
}

export const fetchProductsApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<Product[]>('/search');
  return res.data;
};

export const fetchProductApi = async (id: string): Promise<Product> => {
  const res = await instanceAxs.get<Product>(`/product?id=${id}`);
  return res.data;
};

export const fetchMyProductsApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<Product[]>('/search/mine');
  return res.data;
};

export const searchProductsApi = async (params: SearchParams): Promise<Product[]> => {
  const res = await instanceAxs.post<Product[]>('/searchproduct', params);
  return res.data;
};
