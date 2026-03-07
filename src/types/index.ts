export interface ProductQuery {
  page?: string;
  pageSize?: string;
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sortBy?: string;
  sortOrder?: string;
}
