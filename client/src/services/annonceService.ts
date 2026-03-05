import { instanceAxs } from '../lib/axios';
import type { Product, SpecialProp } from '../types/product';

interface AnnonceProperties {
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

interface CreateAnnonceResponse {
  message: string;
  annonce?: Product;
}

export const uploadAnnonceImagesApi = async (formData: FormData, annonceId?: string): Promise<string[]> => {
  const url = annonceId
    ? `/newannonce/imageupload?annonceid=${annonceId}`
    : '/newannonce/imageupload';
  const res = await instanceAxs.post<string[]>(url, formData);
  return res.data;
};

export const createAnnonceApi = async (
  annonceproperties: AnnonceProperties,
  imagelocations: string[],
  annonceid: string
): Promise<CreateAnnonceResponse> => {
  const res = await instanceAxs.post<CreateAnnonceResponse>('/newannonce/create', {
    annonceproperties,
    imagelocations,
    annonceid,
  });
  return res.data;
};

export const updateAnnonceApi = async (
  annonceImages: string[],
  annonceproperties: AnnonceProperties,
  annonceId: string
): Promise<CreateAnnonceResponse> => {
  const res = await instanceAxs.post<CreateAnnonceResponse>('/newannonce/update', {
    annonceImages,
    annonceproperties,
    annonceId,
  });
  return res.data;
};

export const removeAnnonceImagesApi = async (annonceId: string): Promise<void> => {
  await instanceAxs.post('/newannonce/remove/annonceimages', { annonceId });
};
