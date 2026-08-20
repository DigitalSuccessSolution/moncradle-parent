import { apiClient } from "@/lib/apiClient";

export interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await apiClient.get('/banners');
    // Backend returns { success: true, count: X, data: [...] }
    if (response.data.success && Array.isArray(response.data.data)) {
      // Filter out inactive banners in case backend returns all
      return response.data.data.filter((b: Banner) => b.isActive);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return [];
  }
};
