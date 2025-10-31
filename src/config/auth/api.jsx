/* eslint-disable no-unsafe-optional-chaining */
import axios from "axios";
// https://kelishamiz-backend.vercel.app
// https://kelishamiz-backend.onrender.com
// http://localhost:3030
// http://45.92.173.136
// https://api.kelishamiz.uz/api/docs
const api = axios.create({
  baseURL: "https://api.kelishamiz.uz",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
//
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

const setAccessToken = (token) => localStorage.setItem("accessToken", token);
const setRefreshToken = (token) => localStorage.setItem("refreshToken", token);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    // Login yoki Register so‘rovlarida tokenni qo‘shish shart emas
    if (
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register")
    ) {
      delete config.headers["Authorization"];
      return config;
    }

    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 || error.response?.status === 403) {
      if (error.response.data.message === "Invalid refresh token") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth/login";
          return Promise.reject(new Error("No refresh token found."));
        }

        try {
          const response = await api.post(`/authority/refresh-token`, {
            refreshToken: refreshToken,
          });

          if (response.status === 200) {
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data?.data;

            setAccessToken(newAccessToken);
            if (newRefreshToken) {
              setRefreshToken(newRefreshToken);
            }

            processQueue(null, newAccessToken);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            return api(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
