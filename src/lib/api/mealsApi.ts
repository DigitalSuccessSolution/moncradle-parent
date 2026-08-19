import { apiClient } from "@/lib/apiClient";

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  _id: string;
  name: string;
  description: string;
  suitableForAgeGroup: "0-6 months" | "6-12 months" | "1-3 years" | "3+ years";
  category?: string;
  ingredients: string[];
  nutritionalInfo?: NutritionalInfo;
  imageUrl?: string;
  images?: string[];
  price: number;
  discountedPrice?: number;
  isActive: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getMeals(params: Record<string, string | number> = {}): Promise<any> {
  const query = new URLSearchParams({ limit: "12", ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, String(v)])) }).toString();
  const response = await apiClient.get(`/meals?${query}`);
  return response.data;
}

export async function getMealFilters(): Promise<any> {
  const response = await apiClient.get('/meals/filters');
  return response.data;
}

export async function getMealById(id: string): Promise<Meal> {
  const response = await apiClient.get(`/meals/${id}`);
  return response.data.data;
}
