import { instanceAxs } from '../lib/axios';
import type { Product, PaginatedResponse } from '../types/product';

export type SearchParams = Record<string, string | string[]>;

export const fetchProductsApi = async (page = 1): Promise<PaginatedResponse> => {
  const res = await instanceAxs.get<PaginatedResponse>('/listings', { params: { page, limit: 20 } });
  return res.data;
};

export const fetchProductApi = async (id: string): Promise<Product> => {
  const res = await instanceAxs.get<Product>('/listings/' + id);
  return res.data;
};

export const fetchMyProductsApi = async (): Promise<Product[]> => {
  const res = await instanceAxs.get<Product[]>('/listings/mine');
  return res.data;
};

export const searchProductsApi = async (params: SearchParams, page = 1): Promise<PaginatedResponse> => {
  const res = await instanceAxs.post<PaginatedResponse>('/listings/search', { ...params, page, limit: 20 });
  return res.data;
};
