export interface ProductImage {
  url: string;
  description?: string;
}

export interface SpecialProp {
  title: string;
  value: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: ProductImage[];
  annonceImages?: Array<{ location: string; description?: string }>;
  location: string;
  postNumber?: string;
  postnumber?: string;
  category: string;
  subCategory?: string;
  status: 'ny' | 'brukt' | 'nytt' | 'brukt';
  pricePeriod?: string;
  sellerId?: string;
  specialProps?: SpecialProp[];
  specialProperties?: SpecialProp[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}
