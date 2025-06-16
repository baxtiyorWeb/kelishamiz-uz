"use client";

import { useState, useEffect, useCallback } from "react";
import api from "../../config/auth/api";

export const useLikeManager = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load liked products from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(stored);
  }, []);

  // Sync likes with backend when user logs in
  const syncLikes = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token || likedProducts.length === 0) return;

    setIsLoading(true);
    try {
      // Get current liked products from backend first
      const response = await api.get("/products/liked", {
        params: { ids: likedProducts.join(",") },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Clear localStorage after successful sync
      localStorage.removeItem("likedProducts");
      setLikedProducts([]);

      return response.data;
    } catch (error) {
      console.error("Like sync error:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [likedProducts]);

  // Toggle like for a product
  const toggleLike = useCallback(async (productId, onSuccess) => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Guest user - manage localStorage
      setLikedProducts((prev) => {
        const isLiked = prev.includes(productId);
        const updated = isLiked
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];

        localStorage.setItem("likedProducts", JSON.stringify(updated));
        return updated;
      });

      if (onSuccess) onSuccess();
    } else {
      // Logged in user - use POST API
      setIsLoading(true);
      try {
        await api.post(
          `/products/${productId}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Like toggle error:", error);

        if (error.response?.status === 401) {
          // Token expired, handle as guest
          localStorage.removeItem("token");
          await toggleLike(productId, onSuccess); // Retry as guest
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Check if product is liked (for guest users)
  const isLiked = useCallback(
    (productId) => {
      const token = localStorage.getItem("token");

      if (!token) {
        return likedProducts.includes(productId);
      }

      // For logged in users, this should come from API data
      return false;
    },
    [likedProducts]
  );

  // Get liked products for API call
  const getLikedProducts = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Return localStorage data for guest users
      return likedProducts.map((id) => ({ id }));
    }

    try {
      const localIds = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );

      const response = await api.get("/products/liked", {
        params: { ids: localIds.join(",") },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Get liked products error:", error);
      return [];
    }
  }, [likedProducts]);

  return {
    likedProducts,
    isLoading,
    toggleLike,
    isLiked,
    syncLikes,
    getLikedProducts,
  };
};
