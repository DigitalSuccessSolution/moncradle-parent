import { apiClient } from "@/lib/apiClient";

export interface Milestone {
  _id?: string;
  babyId: string;
  title: string;
  dateAchieved: string; // YYYY-MM-DD
  category?: string;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getMilestones(babyId: string): Promise<Milestone[]> {
  const response = await apiClient.get(`/milestones/${babyId}`);
  return response.data.data || [];
}

export async function addMilestone(data: Milestone): Promise<Milestone> {
  const response = await apiClient.post(`/milestones`, data);
  return response.data.data;
}

export async function updateMilestone(id: string, data: Partial<Milestone>): Promise<Milestone> {
  const response = await apiClient.put(`/milestones/${id}`, data);
  return response.data.data;
}

export async function deleteMilestone(id: string): Promise<void> {
  await apiClient.delete(`/milestones/${id}`);
}
