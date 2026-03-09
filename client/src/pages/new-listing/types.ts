export interface ListingImage {
  id: string;
  name: string;
  data?: string;
  location?: string;
  description: string;
}

export interface SpecProp {
  title: string;
  value: string;
}

export interface SubCategoryItem {
  name: string;
  subsubcategories: string[];
}

export interface CategoryItem {
  maincategory: string;
  subcategories: SubCategoryItem[];
}

export interface ListingPropertyObject {
  _id?: string;
  title: string;
  price: string;
  pricePeriod: string;
  category: string;
  subCategory: string;
  subSubCategory?: string;
  description: string;
  status: string;
  postnumber: string;
  location: string;
  kommune?: string;
}
