import { instanceAxs } from '../lib/axios';
import type { Product, SpecialProp } from '../types/product';

interface ListingProperties {
  title: string;
  description: string;
  price: number;
  location: string;
  postNumber?: string;
  category: string;
  subCategory?: string;
  status: 'ny' | 'brukt';
  specialProps?: SpecialProp[];
}

interface CreateListingResponse {
  message: string;
  listing?: Product;
}

export const uploadListingImagesApi = async (formData: FormData, listingId?: string): Promise<string[]> => {
  const url = listingId
    ? `/listing/imageupload?listingId=${listingId}`
    : '/listing/imageupload';
  const res = await instanceAxs.post<string[]>(url, formData);
  return res.data;
};

export const createListingApi = async (
  listingProperties: ListingProperties,
  imageLocations: string[],
  listingId: string
): Promise<CreateListingResponse> => {
  const res = await instanceAxs.post<CreateListingResponse>('/listing/create', {
    listingProperties,
    imageLocations,
    listingId,
  });
  return res.data;
};

export const updateListingApi = async (
  images: string[],
  listingProperties: ListingProperties,
  listingId: string
): Promise<CreateListingResponse> => {
  const res = await instanceAxs.post<CreateListingResponse>('/listing/update', {
    images,
    listingProperties,
    listingId,
  });
  return res.data;
};

export const removeListingImagesApi = async (listingId: string): Promise<void> => {
  await instanceAxs.post('/listing/remove/images', { listingId });
};
