import { instanceAxs } from '../lib/axios';
import type { Listing, PaginatedResponse } from '../types/listing';

export type SearchParams = Record<string, string | string[]>;

export const fetchListingsApi = async (page = 1): Promise<PaginatedResponse> => {
  const res = await instanceAxs.get<PaginatedResponse>('/listings', { params: { page, limit: 20 } });
  return res.data;
};

export const fetchListingApi = async (id: string): Promise<Listing> => {
  const res = await instanceAxs.get<Listing>('/listings/' + id);
  return res.data;
};

export const fetchMyListingsApi = async (): Promise<Listing[]> => {
  const res = await instanceAxs.get<{ productArray: Listing[] }>('/listings/mine');
  return res.data.productArray;
};

export const searchListingsApi = async (params: SearchParams, page = 1): Promise<PaginatedResponse> => {
  const res = await instanceAxs.post<PaginatedResponse>('/listings/search', { ...params, page, limit: 20 });
  return res.data;
};
