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
  images?: Array<{ name?: string; location: string; description?: string }>;
  location: string;
  postnumber?: string;
  kommune?: string;
  category: string;
  subCategory: string;
  subSubCategory?: string;
  status: 'nytt' | 'brukt';
  pricePeriod?: string;
  sellerId?: string;
  specialProperties?: SpecialProp[];

  createdAt: string;
  updatedAt: string;
}
