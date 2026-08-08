import { apiClient } from "@/lib/apiClient";

// =====================
// USERS API SERVICES
// =====================

export interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
  [key: string]: unknown;
}

/**
 * Get logged in user profile
 * GET /api/users/profile
 */
export async function getUserProfile() {
  const response = await apiClient.get("/users/profile");
  return response.data;
}

/**
 * Update user profile
 * PUT /api/users/profile
 */
export async function updateUserProfile(data: Partial<UserProfile>) {
  const response = await apiClient.put("/users/profile", data);
  return response.data;
}
