import { instanceAxs } from '../lib/axios';
import type { Listing, SpecialProp } from '../types/listing';

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
  listing?: Listing;
}

export const uploadListingImagesApi = async (formData: FormData, listingId?: string): Promise<string[]> => {
  const url = listingId
    ? `/listings/images?listingId=${listingId}`
    : '/listings/images';
  const res = await instanceAxs.post<string[]>(url, formData);
  return res.data;
};

export const createListingApi = async (
  listingProperties: ListingProperties,
  imageLocations: string[],
  listingId: string
): Promise<CreateListingResponse> => {
  const res = await instanceAxs.post<CreateListingResponse>('/listings', {
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
  const res = await instanceAxs.put<CreateListingResponse>('/listings/' + listingId, {
    images,
    listingProperties,
  });
  return res.data;
};

export const removeListingImagesApi = async (listingId: string): Promise<void> => {
  await instanceAxs.delete('/listings/' + listingId + '/images');
};
