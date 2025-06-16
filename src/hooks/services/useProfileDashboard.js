"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export const useProfileApi = (filter) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/profile/dashboard`, {
        params: { filter },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filter) {
      fetchData();
    }
  }, [filter]);

  const refetch = () => {
    if (filter) {
      fetchData();
    }
  };

  return { data, isLoading, error, refetch };
};
