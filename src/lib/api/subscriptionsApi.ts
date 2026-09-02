import { apiClient } from "@/lib/apiClient";

export interface SubscriptionPlan {
  _id?: string;
  title?: string;
  name?: string;
  description?: string;
  durationInDays?: number; // days
  price?: number;
  features?: string[];
  isActive?: boolean;
}

export interface Subscription {
  _id?: string;
  parentId: string;
  babyId: string;
  planId: string | SubscriptionPlan;
  totalAmount?: number;
  deliveryAddressId?: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  deliverySchedule?: {
    _id: string;
    date: string;
    status: "pending" | "skipped" | "ordered" | "delivered";
    mealId?: string | any;
    productId?: string | any;
    timeSlot?: string;
    customizations?: string[];
    specialInstructions?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export async function skipMeal(subscriptionId: string, scheduleId: string) {
  const response = await apiClient.patch(`/subscriptions/${subscriptionId}/skip/${scheduleId}`);
  return response.data.data;
}

export async function updateMealInstructions(subscriptionId: string, scheduleId: string, specialInstructions: string) {
  const response = await apiClient.patch(`/subscriptions/${subscriptionId}/instructions/${scheduleId}`, { specialInstructions });
  return response.data.data;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await apiClient.get(`/subscriptions`);
  return response.data.data || [];
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get(`/subscription-plans`);
  return response.data.data || [];
}

export async function createSubscription(data: Partial<Subscription>): Promise<Subscription> {
  const response = await apiClient.post(`/subscriptions`, data);
  return response.data.data;
}

export async function updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
  const response = await apiClient.patch(`/subscriptions/${id}`, data);
  return response.data.data;
}
