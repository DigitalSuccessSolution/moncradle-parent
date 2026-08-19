import { apiClient } from "@/lib/apiClient";

export const subscribeToNewsletter = async (email: string) => {
  try {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
