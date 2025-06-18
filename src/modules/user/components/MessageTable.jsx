"use client";

import { useState, useEffect } from "react";
import ItemCard from "../../../common/components/ItemCard";
import api from "../../../config/auth/api";
import { useQuery } from "react-query";
import { isArray } from "lodash";

const MessageTable = () => {
  const [activeTab, setActiveTab] = useState("elonlar");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(stored);
  }, []);

  // Updated handleLike function

  const isProductLiked = (productId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // Guest user - check localStorage
      return likedProducts.includes(productId);
    } else {
      // Logged in user - check from API data (assuming the API returns liked status)
      return (
        data?.data?.some?.((item) => item.id === productId && item.isLiked) ||
        false
      );
    }
  };

  // Sync likes when user logs in
  useEffect(() => {
    const syncLikesOnMount = async () => {
      const token = localStorage.getItem("accessToken");
      const storedLikes = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );

      if (token && storedLikes.length > 0) {
        try {
          // Sync each liked product
          for (const productId of storedLikes) {
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
          }

          // Clear localStorage after syncing
          localStorage.removeItem("likedProducts");
          setLikedProducts([]);

          // Refresh data
          fetchData();
        } catch (err) {
          console.error("Initial like sync error:", err);
        }
      }
    };

    syncLikesOnMount();
  }, []);

  const fetchData = async () => {
    const response = await api.get(
      `/profiles/me/dashboard?filter=${activeTab}`
    );

    return response.data;
  };

  const {
    data: me_product_items,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me_products", activeTab],
    queryFn: async () => await fetchData(),
  });

  const handleLike = async (productId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // Guest user - store in localStorage
      const currentLikes = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );
      const isCurrentlyLiked = currentLikes.includes(productId);

      if (isCurrentlyLiked) {
        const updatedLikes = currentLikes.filter((id) => id !== productId);
        localStorage.setItem("likedProducts", JSON.stringify(updatedLikes));
        setLikedProducts(updatedLikes);
      } else {
        const updatedLikes = [...currentLikes, productId];
        localStorage.setItem("likedProducts", JSON.stringify(updatedLikes));
        setLikedProducts(updatedLikes);
      }
    } else {
      // Logged in user - make API call
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

        // Refresh data to get updated like status
        fetchData();
      } catch (err) {
        console.error("Like error:", err);
      }
    }
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    dateObj.setHours(dateObj.getHours() + 5);
    return dateObj.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SearchCard = ({ search }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-medium">{search?.query}</h4>
            <p className="text-sm text-gray-500">{search?.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {formatDate(search?.createdAt)}
          </p>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {search?.resultsCount} natija
          </span>
        </div>
      </div>
    </div>
  );

  const ProfileInfo = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Foydalanuvchi nomi</h2>
            <p className="text-gray-600">+998 90 123 45 67</p>
            <p className="text-gray-600">user@example.com</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg">
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-teal-100">Jami e'lonlar</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-lg">
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-teal-100">Ko'rishlar</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-teal-100">Saqlanganlar</div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    {
      key: "elonlar",
      label: "E'lonlar",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    {
      key: "xabarlarim",
      label: "Xabarlar",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    {
      key: "saqlanganlar",
      label: "Saqlangan",
      icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
    },
    {
      key: "qidiruvlar",
      label: "Qidiruvlar",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    },
    {
      key: "mening-hisobim",
      label: "Hisobim",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      key: "sozlamalar",
      label: "Sozlamalar",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Mening profilim</h1>
          <p className="text-teal-100">
            E'lonlaringizni boshqaring va hisobingizni sozlang
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-6 bg-white border border-teal-200 rounded-lg overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                    : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={tab.icon}
                  />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        {(activeTab === "elonlar" || activeTab === "saqlanganlar") && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Mahsulot izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* E'lonlar Tab */}
          {activeTab === "elonlar" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Mening e'lonlarim</h2>
                <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all">
                  Yangi e'lon qo'shish
                </button>
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {me_product_items?.content?.products?.map(
                    (product, index) => (
                      <ItemCard
                        key={product.id}
                        item={product}
                        index={index}
                        onLike={() => {
                          console.log(
                            "onLike prop called for product:",
                            product.id
                          ); // Debug
                          handleLike(product.id);
                        }}
                        isLiked={isProductLiked(product.id)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Xabarlar Tab */}
          {activeTab === "xabarlarim" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Xabarlarim</h2>
              <p className="text-gray-600">
                Xabarlar funksiyasi hali ishlab chiqilmoqda...
              </p>
            </div>
          )}

          {/* Saqlanganlar Tab */}
          {activeTab === "saqlanganlar" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Saqlangan e'lonlar</h2>

              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {me_product_items?.content?.products?.map(
                    (product, index) => (
                      <ItemCard
                        key={product.id}
                        item={product}
                        index={index}
                        onLike={() => {
                          console.log(
                            "onLike prop called for product:",
                            product.id
                          ); // Debug
                          handleLike(product.id);
                        }}
                        isLiked={isProductLiked(product.id)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Qidiruvlar Tab */}
          {activeTab === "qidiruvlar" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Qidiruv tarixi</h2>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.data?.map((search, index) => (
                    <SearchCard key={index} search={search} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hisobim Tab */}
          {activeTab === "mening-hisobim" && <ProfileInfo />}

          {/* Sozlamalar Tab */}
          {activeTab === "sozlamalar" && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Sozlamalar</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Profil sozlamalari
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ism
                        </label>
                        <input
                          type="text"
                          placeholder="Ismingizni kiriting"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Telefon raqam
                        </label>
                        <input
                          type="tel"
                          placeholder="+998 90 123 45 67"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Xavfsizlik</h3>
                    <div className="space-y-4">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Parolni o'zgartirish
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Ikki bosqichli autentifikatsiya
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all">
                      Saqlash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageTable;
