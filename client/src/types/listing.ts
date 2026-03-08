export interface ListingImage {
  url: string;
  description?: string;
}

export interface SpecialProp {
  title: string;
  value: string;
}

export interface PaginatedResponse {
  productArray: Listing[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface Listing {
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
