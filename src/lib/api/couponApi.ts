import { apiClient } from "@/lib/apiClient";

/** POST /api/coupons/apply — validate and calculate discount */
export async function applyCoupon(code: string, cartTotal: number) {
  try {
    const response = await apiClient.post("/coupons/apply", { code, cartTotal });
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to apply coupon");
    }
    throw new Error("Failed to apply coupon");
  }
}
