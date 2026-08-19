import { apiClient } from "@/lib/apiClient";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  orderId?: string;
  appointmentId?: string;
  createdAt: string;
}

export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await apiClient.delete(`/notifications/${id}`);
  return response.data;
};
