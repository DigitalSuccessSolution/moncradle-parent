import { apiClient } from "@/lib/apiClient";

export interface OrderItem {
  itemType: "product" | "meal";
  productId?: string;
  mealId?: string;
  quantity: number;
  priceAtAddition: number;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  specialInstructions?: string;
}

/** POST /api/orders — create a new order */
export async function createOrder(data: CreateOrderPayload) {
  const response = await apiClient.post("/orders", data);
  return response.data.data;
}

/** GET /api/orders — fetch user's orders */
export async function getOrders() {
  const response = await apiClient.get("/orders");
  return response.data;
}
