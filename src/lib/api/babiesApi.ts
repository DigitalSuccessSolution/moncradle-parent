import { apiClient } from "@/lib/apiClient";

// =====================
// BABIES API SERVICES
// =====================

export interface BabyProfile {
  _id?: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  diet: string;
  weight?: string | number;
  height?: string | number;
  medicalCondition?: string;
  ageInMonths?: number;
  bloodType?: string;
  prematureDays?: number;
  allergies?: string[];
  currentSymptoms?: string[];
  [key: string]: any;
}

/**
 * Create a new baby profile
 * POST /api/babies
 */
export async function createBaby(data: {
  name: string;
  dateOfBirth: string;
  gender: string;
  diet: string;
  ageInMonths?: number;
  allergies?: string[];
}) {
  const response = await apiClient.post("/babies", data);
  return response.data;
}

/**
 * Get all babies for the logged-in parent
 * GET /api/babies
 */
export async function getBabies() {
  const response = await apiClient.get(`/babies?t=${Date.now()}`);
  return response.data;
}

/**
 * Get a single baby by ID
 * GET /api/babies/:id
 */
export async function getBabyById(id: string) {
  const response = await apiClient.get(`/babies/${id}`);
  return response.data;
}

/**
 * Update a baby profile
 * PUT /api/babies/:id
 */
export async function updateBaby(id: string, data: Partial<BabyProfile> | FormData) {
  const response = await apiClient.put(`/babies/${id}`, data);
  return response.data;
}
