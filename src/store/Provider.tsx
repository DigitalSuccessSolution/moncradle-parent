"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { fetchCartAsync } from "./slices/cartSlice";
import { fetchWishlistAsync } from "./slices/wishlistSlice";
import { fetchNotificationsCountAsync } from "./slices/notificationsSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only fetch data if we have a token to prevent 401 infinite loop
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        store.dispatch(fetchCartAsync());
        store.dispatch(fetchWishlistAsync());
        store.dispatch(fetchNotificationsCountAsync());
      }
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
