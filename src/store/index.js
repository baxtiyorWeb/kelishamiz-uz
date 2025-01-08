import { get } from "lodash";
import { create } from "zustand";
import api from "../config/auth/api";

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"), // Sahifa yangilanganda tokenni tekshirish

  login: async (credentials) => {
    try {
      const response = await api.post("/authority/sign-in", credentials);
      const { accessToken, refreshToken } = get(response, "data.data");

      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      window.location.href = "/";
    } catch (error) {
      console.error("Login failed", error);
    }
  },

  // Foydalanuvchini tizimdan chiqarish
  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    console.log("Logged out");
  },

  // Access tokenni yangilash
  refreshAccessToken: async () => {
    try {
      const { refreshToken } = useAuthStore.getState();
      const response = await api.post("/authority/refresh-token", {
        refreshToken,
      });

      set({ accessToken: response.data.accessToken });
      console.log("Access token refreshed");
    } catch (error) {
      console.error("Failed to refresh access token", error);
    }
  },
}));
export default useAuthStore;
