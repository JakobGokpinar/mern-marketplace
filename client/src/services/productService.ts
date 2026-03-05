import { instanceAxs } from '../lib/axios';
import type { Product } from '../types/product';

export type SearchParams = Record<string, string | string[]>;

export const fetchProductsApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<{ productArray: Product[] }>('/search');
  return res.data.productArray || [];
};

export const fetchProductApi = async (id: string): Promise<Product> => {
  const res = await instanceAxs.get<Product>('/product', { params: { id } });
  return res.data;
};

export const fetchMyProductsApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<Product[]>('/search/mine');
  return res.data;
};

export const searchProductsApi = async (params: SearchParams): Promise<Product[]> => {
  const res = await instanceAxs.post<{ productArray: Product[] }>('/searchproduct', params);
  return res.data.productArray || [];
};
