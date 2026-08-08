import { apiClient } from "@/lib/apiClient";

// =====================
// AUTH API SERVICES
// =====================

/**
 * Send OTP to a phone number
 * POST /api/auth/send-otp
 * Body: { phone, role: "parent" }
 */
export async function sendOTP(phone: string) {
  const response = await apiClient.post("/auth/send-otp", {
    phone,
    role: "parent",
  });
  return response.data;
}

/**
 * Verify OTP and login
 * POST /api/auth/verify-otp
 * Body: { phone, otp }
 * Returns: { token, user, ... }
 */
export async function verifyOTP(phone: string, otp: string) {
  const response = await apiClient.post("/auth/verify-otp", {
    phone,
    otp,
  });
  return response.data;
}
