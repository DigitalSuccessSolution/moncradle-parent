import { apiClient } from "@/lib/apiClient";

// =====================
// CART API SERVICES
// =====================

export interface CartItem {
  _id: string;
  itemType: "product" | "meal";
  productId?: {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
    stockQuantity: number;
  };
  mealId?: {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  priceAtAddition: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

/** GET /api/cart — fetch current user's cart */
export async function getCart(): Promise<Cart> {
  const response = await apiClient.get("/cart");
  return response.data.data;
}

/** POST /api/cart — add item to cart */
export async function addToCart(itemId: string, itemType: "product" | "meal" = "product", quantity = 1): Promise<Cart> {
  const response = await apiClient.post("/cart", { itemId, itemType, quantity });
  return response.data.data;
}

/** DELETE /api/cart/:itemId — remove single item */
export async function removeFromCart(itemId: string): Promise<Cart> {
  const response = await apiClient.delete(`/cart/${itemId}`);
  return response.data.data;
}

/** PATCH /api/cart/:itemId — update quantity */
export async function updateCartQuantity(itemId: string, quantity: number): Promise<Cart> {
  const response = await apiClient.patch(`/cart/${itemId}`, { quantity });
  return response.data.data;
}

/** DELETE /api/cart — clear entire cart */
export async function clearCart(): Promise<Cart> {
  const response = await apiClient.delete("/cart");
  return response.data.data;
}
