"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { requestForToken, setupMessageListener } from "@/lib/firebase";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface User {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  [key: string]: unknown; // Allow extra fields from API
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const pathname = usePathname();
  const router = useRouter();

  // List of routes that require authentication
  const protectedRoutes = [
    "/growth", 
    "/nutrition", 
    "/account", 
    "/address",
    "/appointments", 
    "/baby-profile", 
    "/health-records", 
    "/orders", 
    "/profile", 
    "/settings", 
    "/subscriptions", 
    "/notifications",
    "/shop/cart",
    "/shop/wishlist",
    "/doctor/book"
  ];

  // Global protection: Redirect unauthenticated users trying to access protected routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
      if (isProtected) {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const savedToken = Cookies.get("token") || localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      Cookies.set("token", savedToken, { expires: 7, path: '/' });
      setToken(savedToken);
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // Invalid JSON in storage, clear it
          localStorage.removeItem("user");
        }
      }

      // Fetch the latest user profile to ensure data like avatar is up to date
      import("@/lib/api/usersApi")
        .then(({ getUserProfile, updateUserProfile }) => {
          getUserProfile().then(latestUser => {
            const userData = latestUser.data || latestUser.user || latestUser;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          });
          // Prompt for notification permission automatically on load
          if ('Notification' in window) {
            requestForToken().then(fcmToken => {
              if (fcmToken) {
                const savedFcmToken = localStorage.getItem("syncedFcmToken");
                if (savedFcmToken !== fcmToken) {
                  updateUserProfile({ fcmToken }).then(() => {
                    localStorage.setItem("syncedFcmToken", fcmToken);
                  }).catch(console.error);
                }
              }
            }).catch(console.error);
          }
        })
        .catch(console.error);
    }
    setIsLoading(false);
  }, []);

  // Listen for foreground push notifications
  useEffect(() => {
    let unsubscribe: any;
    
    if (isAuthenticated) {
      setupMessageListener((payload) => {
        const title = payload.notification?.title || "New Notification";
        const options = {
          body: payload.notification?.body || "",
          icon: '/moncradle-icon.png',
        };
        
        // Show native browser notification even when app is open
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, options);
          
          notification.onclick = function() {
            window.focus();
            if (payload.data?.url) {
              router.push(payload.data.url);
            } else {
              router.push('/notifications');
            }
            this.close();
          };
        }
      }).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isAuthenticated, router]);

  const login = (newToken: string, newUser: User) => {
    Cookies.set("token", newToken, { expires: 7, path: '/' });
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    // Fetch the latest user profile immediately to ensure full data (name, avatar, etc.) is loaded
    import("@/lib/api/usersApi")
      .then(({ getUserProfile, updateUserProfile }) => {
        getUserProfile().then(latestUser => {
          const userData = latestUser.data || latestUser.user || latestUser;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        });
        
        // Prompt for notification permission automatically after login
        if ('Notification' in window) {
          requestForToken().then(fcmToken => {
            if (fcmToken) {
              const savedFcmToken = localStorage.getItem("syncedFcmToken");
              if (savedFcmToken !== fcmToken) {
                updateUserProfile({ fcmToken }).then(() => {
                  localStorage.setItem("syncedFcmToken", fcmToken);
                }).catch(console.error);
              }
            }
          }).catch(console.error);
        }
      })
      .catch(console.error);
  };

  const logout = () => {
    Cookies.remove("token", { path: '/' });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasSetBabyProfile");
    localStorage.removeItem("hasSetParentProfile");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
