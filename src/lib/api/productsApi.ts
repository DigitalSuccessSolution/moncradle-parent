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
export async function getProducts() {
  const response = await apiClient.get("/products");
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
