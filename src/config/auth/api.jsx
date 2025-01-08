/* eslint-disable no-unsafe-optional-chaining */
import axios from "axios";

const api = axios.create({
  baseURL: "http://95.130.227.131:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

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
    if (
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register")
    ) {
      delete config.headers["Authorization"];
      return config;
    }

    const accessToken = getAccessToken();
    if (
      !config.url.includes("/auth/login") ||
      (!config.url.includes("/auth/register") && accessToken)
    ) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      throw new Error("No access token found in localStorage.");
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 || error.response?.status === 403) {
      if (error.response.data.message === "Invalid refresh token") {
        // window.location.href = '/auth/login';
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
        if (refreshToken) {
          try {
            const response = await api.post(`/authority/refresh-token`, {
              refreshToken: refreshToken,
            });
            if (response.status === 200) {
              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              } = response.data?.data;
              console.log(response.data.data);

              // Store new tokens
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
            // window.location.href = '/auth/login';
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        } else {
          // window.location.href = '/auth/login';
          return Promise.reject(new Error("No refresh token found."));
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
