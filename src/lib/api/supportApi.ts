import { apiClient } from "@/lib/apiClient";

export interface SupportTicket {
  _id?: string;
  userId: string;
  orderId?: string;
  issueType: "delivery_issue" | "payment_issue" | "food_quality" | "other";
  description: string;
  status: "open" | "in_progress" | "resolved";
  replies?: {
    _id?: string;
    sender: "user" | "admin";
    message: string;
    createdAt?: string;
    isRead?: boolean;
    isDeleted?: boolean;
    isEdited?: boolean;
    quotedReplyId?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export async function getSupportTickets(page: number = 1, limit: number = 5): Promise<{ tickets: SupportTicket[], count: number }> {
  const response = await apiClient.get(`/support?page=${page}&limit=${limit}`);
  return { 
    tickets: response.data.data || [], 
    count: response.data.count || 0 
  };
}

export async function createSupportTicket(data: Partial<SupportTicket>): Promise<SupportTicket> {
  const response = await apiClient.post(`/support`, data);
  return response.data.data;
}

export async function replyToTicket(ticketId: string, message: string): Promise<SupportTicket> {
  const response = await apiClient.put(`/support/${ticketId}/reply`, { message });
  return response.data.data;
}

export async function markMessagesAsRead(ticketId: string): Promise<void> {
  await apiClient.put(`/support/${ticketId}/read`);
}
