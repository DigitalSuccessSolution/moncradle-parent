import { apiClient } from "@/lib/apiClient";

export type ReviewTargetType = "meal" | "product" | "doctor" | "deliveryPartner";

export interface SubmitReviewPayload {
  targetType: ReviewTargetType;
  rating: number;
  comment?: string;
  // meal / product
  mealId?: string;
  productId?: string;
  orderId?: string;
  // doctor
  doctorId?: string;
  appointmentId?: string;
  // delivery partner
  deliveryPartnerId?: string;
}

/** Submit a new review */
export const submitReview = async (payload: SubmitReviewPayload) => {
  const res = await apiClient.post("/reviews", payload);
  return res.data;
};

/** Check if the parent already reviewed a specific target */
export const checkHasReviewed = async (
  params: Partial<SubmitReviewPayload>
): Promise<any | null> => {
  const res = await apiClient.get("/reviews/has-reviewed", { params });
  return res.data?.data?.hasReviewed || null;
};

/** Get reviews for a meal */
export const getMealReviews = async (mealId: string) => {
  const res = await apiClient.get(`/reviews/meal/${mealId}`);
  return res.data?.data ?? [];
};

/** Get reviews for a doctor */
export const getDoctorReviews = async (doctorId: string) => {
  const res = await apiClient.get(`/reviews/doctor/${doctorId}`);
  return res.data?.data ?? [];
};

/** Get reviews for a product */
export const getProductReviews = async (productId: string) => {
  const res = await apiClient.get(`/reviews/product/${productId}`);
  return res.data?.data ?? [];
};

/** Get reviews for a delivery partner */
export const getDeliveryPartnerReviews = async (partnerId: string) => {
  const res = await apiClient.get(`/reviews/delivery-partner/${partnerId}`);
  return res.data?.data ?? [];
};
