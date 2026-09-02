import { apiClient } from "@/lib/apiClient";

export async function initiatePayment(payload: { orderId?: string; subscriptionId?: string }) {
  const response = await apiClient.post("/payments/initiate", payload);
  return response.data;
}

export async function checkPaymentStatus(paymentId: string) {
  const response = await apiClient.get(`/payments/status/${paymentId}`);
  return response.data;
}
