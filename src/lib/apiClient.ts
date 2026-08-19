import axios from "axios";

// Create a global Axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Request Interceptor: Attach Auth Token if available
apiClient.interceptors.request.use(
  (config) => {
    // Check if we are running in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the token is invalid or expired
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Clear auth state and reload or redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
