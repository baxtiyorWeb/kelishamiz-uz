"use client";

import { useState, useEffect } from "react";
import api from "../../../config/auth/api";
import { useQuery } from "react-query";
import { isArray } from "lodash";
import { Link } from "react-router-dom";

// I'm assuming ItemCard is a component that displays the product.
// Since it's not provided, I'll create a simple placeholder.
const ItemCard = ({ item }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="relative pt-[75%]">
      <img
        src={item.imageUrl || "https://via.placeholder.com/400x300"}
        alt={item.title}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
    <div className="p-4">
      <h3 className="text-base font-semibold text-gray-800 truncate">
        {item.title}
      </h3>
      <p className="text-gray-500 text-sm mt-1">{item.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-bold text-teal-600">
          ${item.price?.toLocaleString()}
        </span>
        <button className="text-gray-400 hover:text-red-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const MessageTable = () => {
  const [activeTab, setActiveTab] = useState("Faollar");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(stored);
  }, []);

  const isProductLiked = (productId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return likedProducts.includes(productId);
    } else {
      return (
        data?.data?.some?.((item) => item.id === productId && item.isLiked) ||
        false
      );
    }
  };

  useEffect(() => {
    const syncLikesOnMount = async () => {
      const token = localStorage.getItem("accessToken");
      const storedLikes = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );

      if (token && storedLikes.length > 0) {
        try {
          for (const productId of storedLikes) {
            await api.post(`/products/${productId}/like`, {});
          }
          localStorage.removeItem("likedProducts");
          setLikedProducts([]);
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

  const { data: me_product_items, isLoading } = useQuery({
    queryKey: ["me_products", activeTab],
    queryFn: async () => await fetchData(),
  });

  const handleLike = async (productId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const currentLikes = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );
      const isCurrentlyLiked = currentLikes.includes(productId);
      const updatedLikes = isCurrentlyLiked
        ? currentLikes.filter((id) => id !== productId)
        : [...currentLikes, productId];
      localStorage.setItem("likedProducts", JSON.stringify(updatedLikes));
      setLikedProducts(updatedLikes);
    } else {
      try {
        await api.post(`/products/${productId}/like`, {});
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

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const mainTabs = ["Faollar", "Qoralamalar", "Harakat kutmoqda", "Arxiv"];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8 flex gap-6">
        {/* Left Sidebar */}
        <aside className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
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
                <h3 className="font-semibold">baxtliyorqurbonnazarov33</h3>
                <p className="text-sm text-gray-500">+998 99 258-48-80</p>
              </div>
            </div>
            <a href="#" className="block text-sm text-teal-600 hover:underline">
              Profilim qanday ko'rinadi?
            </a>
            <hr className="border-gray-200" />
            <div className="text-gray-500 flex items-center gap-2 text-sm font-medium">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.118a8.001 8.001 0 010 11.314L10.95 20.364l-1.414-1.414L10.95 18.05a6 6 0 008.485-8.485l-1.414-1.414z"
                />
              </svg>
              ID tasdiqlash
            </div>
            <hr className="border-gray-200" />
            {/* Navigation Links */}
            <nav className="space-y-2">
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  true
                    ? "bg-teal-100 text-teal-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 16h.01"
                    />
                  </svg>
                </span>
                Mening e'lonlarim
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </span>
                Sevimlilar
              </a>
              <Link
                to={"/chat"}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </span>
                Chat (kelishamiz.uz)
              </Link>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.28-8.455-3.545M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.28-8.455-3.545M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                    />
                  </svg>
                </span>
                BirBir biznes uchun
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="w-5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Platforma qoidalari
              </a>
            </nav>
            <hr className="border-gray-200" />
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
            >
              <span className="w-5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </span>
              Chiqish
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* My Ads Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Mening e'lonlarim</h2>
            {/* Main Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
              {mainTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content based on Active Tab */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="text-center py-10 text-gray-500">
                <p>E'lonlar yuklanishida xatolik yuz berdi.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === "Faollar" && (
                  <>
                    {me_product_items?.content?.products?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {me_product_items?.content?.products?.map((product) => (
                          <ItemCard
                            key={product.id}
                            item={product}
                            onLike={() => handleLike(product.id)}
                            isLiked={isProductLiked(product.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h.01M12 12h.01M15 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          E'lonlaringiz yo'q
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Bu yerda sizning e'lonlaringiz joylashadi
                        </p>
                        <div className="mt-6">
                          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            E'lon qo'yish
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {/* Other tabs can be implemented here similarly */}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessageTable;
