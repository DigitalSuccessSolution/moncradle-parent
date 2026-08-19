import { apiClient } from "@/lib/apiClient";

// =====================
// PRODUCTS API SERVICES
// =====================

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl: string;
  images: string[];
  brand: string;
  discountedPrice: number;
  sku: string;
  ageGroup: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Get all products
 * GET /api/products
 */
export async function getProducts(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams({ limit: "100", ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, String(v)])) }).toString();
  const response = await apiClient.get(`/products?${query}`);
  return response.data;
}

/**
 * Get dynamic product filters (categories, ageGroups)
 * GET /api/products/filters
 */
export async function getProductFilters() {
  const response = await apiClient.get('/products/filters');
  return response.data;
}

/**
 * Get product by ID
 * GET /api/products/:id
 */
export async function getProductById(id: string) {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}
