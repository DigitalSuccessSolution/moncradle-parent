import { apiClient } from "@/lib/apiClient";

export interface Doctor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  specialization?: string;
  experienceYears?: number;
  clinicName?: string;
  clinicAddress?: string;
  rating?: number;
  reviewsCount?: number;
  isAvailable?: boolean;
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const response = await apiClient.get('/doctors');
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}
