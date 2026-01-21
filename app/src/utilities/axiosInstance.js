import axios from "axios";

const env = import.meta.env.VITE_ENV || 'dev';
const appenv = import.meta.env.VITE_APP_ENV || 'quality';

const baseUrl = {
    dev: {
        quality: import.meta.env.VITE_API_URL_DEVQ,
        production: import.meta.env.VITE_API_URL_DEVP,
    },
    live: {
        quality: import.meta.env.VITE_API_URL_QAS,
        production: import.meta.env.VITE_API_URL_PRD,
    }
};

const axiosInstance = axios.create({
    baseURL: baseUrl[env][appenv],
    // withCredentials: true, // ✅ crucial for cookies
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.method !== "options") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR
================================ */

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log(error)
    if(error.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      console.log(refreshToken)
      if(refreshToken){
          try {
              const response = await axiosInstance.post("/users/refresh-token", { refreshToken });
              console.log(response)
              const { accessToken } = response.data;
              localStorage.setItem("accessToken", accessToken);
              originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
              return axiosInstance(originalRequest);
          } catch (err) {
              console.error("Refresh token is invalid", err);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
          }
      } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
      }

        

    }

    
    
  }
);

export default axiosInstance;
