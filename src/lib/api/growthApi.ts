import { apiClient } from "@/lib/apiClient";

export interface GrowthRecord {
  _id?: string;
  babyId: string;
  weight: number;
  height: number;
  headCircumference?: number;
  notes?: string;
  recordedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getGrowthRecords(babyId: string): Promise<GrowthRecord[]> {
  const response = await apiClient.get(`/growth/${babyId}`);
  return response.data.data || [];
}

export async function addGrowthRecord(data: GrowthRecord): Promise<GrowthRecord> {
  const response = await apiClient.post(`/growth`, data);
  return response.data.data;
}

export async function updateGrowthRecord(id: string, data: Partial<GrowthRecord>): Promise<GrowthRecord> {
  const response = await apiClient.put(`/growth/${id}`, data);
  return response.data.data;
}

export async function deleteGrowthRecord(id: string): Promise<void> {
  await apiClient.delete(`/growth/${id}`);
}
