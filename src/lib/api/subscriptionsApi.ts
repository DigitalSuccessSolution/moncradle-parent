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
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
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
