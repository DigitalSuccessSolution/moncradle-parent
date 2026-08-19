import { apiClient } from "@/lib/apiClient";
import { Meal } from "./mealsApi";

export interface NutritionPlan {
  _id: string;
  babyId: any;
  assignedBy: any;
  weeklySchedule: {
    day: string;
    mealId: Meal;
    _id?: string;
    eaten?: boolean;
    eatenAt?: string;
  }[];
  guidelines: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get nutrition plan for a baby
 * GET /api/nutrition-plans/:babyId
 */
export async function getNutritionPlan(babyId: string): Promise<NutritionPlan | null> {
  try {
    const response = await apiClient.get(`/nutrition-plans/${babyId}`);
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch nutrition plan:", error);
    return null;
  }
}

export async function addMealToSchedule(babyId: string, day: string, mealId: string): Promise<NutritionPlan | null> {
  try {
    const response = await apiClient.post(`/nutrition-plans/baby/${babyId}/schedule`, { day, mealId });
    return response.data.data;
  } catch (error) {
    console.error("Failed to add meal to schedule:", error);
    return null;
  }
}

export async function removeMealFromSchedule(babyId: string, day: string, mealId: string): Promise<NutritionPlan | null> {
  try {
    const response = await apiClient.delete(`/nutrition-plans/baby/${babyId}/schedule`, { data: { day, mealId } });
    return response.data.data;
  } catch (error) {
    console.error("Failed to remove meal from schedule:", error);
    return null;
  }
}

export async function toggleMealEaten(babyId: string, entryId: string): Promise<NutritionPlan | null> {
  try {
    const response = await apiClient.patch(`/nutrition-plans/baby/${babyId}/schedule/${entryId}/eaten`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to toggle meal eaten status:", error);
    return null;
  }
}
