import { instanceAxs } from '../lib/axios';
import type { Product, PaginatedResponse } from '../types/product';

export type SearchParams = Record<string, string | string[]>;

export const fetchProductsApi = async (page = 1): Promise<PaginatedResponse> => {
  const res = await instanceAxs.get<PaginatedResponse>('/search', { params: { page, limit: 20 } });
  return res.data;
};

export const fetchProductApi = async (id: string): Promise<Product> => {
  const res = await instanceAxs.get<Product>('/product', { params: { id } });
  return res.data;
};

export const fetchMyProductsApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<Product[]>('/search/mine');
  return res.data;
};

export const searchProductsApi = async (params: SearchParams, page = 1): Promise<PaginatedResponse> => {
  const res = await instanceAxs.post<PaginatedResponse>('/search', { ...params, page, limit: 20 });
  return res.data;
};
