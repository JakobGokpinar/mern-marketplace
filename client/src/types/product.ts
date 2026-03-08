export interface ProductImage {
  url: string;
  description?: string;
}

export interface SpecialProp {
  title: string;
  value: string;
}

export interface PaginatedResponse {
  productArray: Product[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images?: Array<{ location: string; description?: string }>;
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

  createdAt: string;
  updatedAt: string;
}
