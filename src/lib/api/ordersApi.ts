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
  couponCode?: string;
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

/** GET /api/orders?search=:id — fetch a single order by ID */
export async function getOrderById(orderId: string) {
  // Use the backend's built-in search capability to fetch by ID
  const response = await apiClient.get(`/orders?search=${orderId}`);
  if (response.data.data && response.data.data.length > 0) {
    return response.data.data[0];
  }
  throw new Error("Order not found");
}

/** PATCH /api/orders/:id/status — cancel an order */
export async function cancelOrder(orderId: string, reason?: string) {
  const response = await apiClient.patch(`/orders/${orderId}/status`, {
    status: 'cancelled',
    cancellationReason: reason || 'Cancelled by user'
  });
  return response.data;
}
