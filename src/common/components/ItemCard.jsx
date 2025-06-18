"use client";

import { format } from "date-fns";
import { Calendar, Eye, Heart, MapPinIcon } from "lucide-react";
import PropTypes from "prop-types";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useGetUser from "../../hooks/services/useGetUser";
import api from "../../config/auth/api";

const ItemCard = React.memo(({ item, index, authToken, refresh }) => {
  // Internal state for like status and count, initialized from item prop
  const [currentIsLiked, setCurrentIsLiked] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState();
  const user = useGetUser();
  const userId = user?.sub;

  // authToken ni localStorage dan olish agar prop sifatida kelmasa
  const getAuthToken = useCallback(() => {
    if (authToken) return authToken;
    return localStorage.getItem("accessToken");
  }, [authToken]);

  // Debug uchun
  console.log(
    "ItemCard render - userId:",
    userId,
    "authToken:",
    !!getAuthToken()
  );

  // Initialize state based on item prop and local storage on mount
  useEffect(() => {
    const token = getAuthToken();
    if (userId && token && item?.likes) {
      // Authenticated user: check if user has liked from backend data
      setCurrentIsLiked(item.likes.some((likeUser) => likeUser.id === userId));
    } else {
      // Unauthenticated user: check localStorage
      const likedProducts = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );
      setCurrentIsLiked(likedProducts.includes(item?.id));
    }
    setCurrentLikesCount(item?.likesCount || 0);
  }, [item, userId, getAuthToken]);

  // Sync localStorage likes with backend when user logs in
  useEffect(() => {
    const syncLocalLikes = async () => {
      const token = getAuthToken();
      if (userId && token) {
        try {
          const likedProducts = JSON.parse(
            localStorage.getItem("likedProducts") || "[]"
          );

          if (likedProducts.length > 0) {
            // Send localStorage IDs to backend for sync
            await api.get(`/products/liked?ids=${likedProducts.join(",")}`, {});

            // Clear localStorage after sync
            localStorage.removeItem("likedProducts");
          }
        } catch (error) {
          console.error("Error syncing likes:", error);
        }
      }
    };

    syncLocalLikes();
  }, [userId, getAuthToken]); // Run when user logs in

  const formattedDate = useMemo(() => {
    if (item?.createdAt) {
      return format(new Date(item.createdAt), "dd MMM");
    }
    return "";
  }, [item?.createdAt]);

  const detailLink = useMemo(() => `/detail/${item?.id}?infoTab=1`, [item?.id]);

  const mainImage = useMemo(() => {
    if (item?.images && item.images.length > 0) {
      const main = item.images.find((img) => img.isMainImage);
      return main ? main.url : item.images[0].url;
    }
    return item?.mainImage || "https://via.placeholder.com/150";
  }, [item?.images, item?.mainImage]);

  const handleLikeClick = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!item?.id) return;

      const token = getAuthToken();

      console.log("handleLikeClick - userId:", userId, "authToken:", !!token);

      try {
        let newIsLiked;
        let newLikesCount;

        if (userId && token) {
          console.log("Using API endpoint for authenticated user");
          // Authenticated user: Use API endpoint
          const response = await api.post(`/products/${item.id}/like`, {});
          newIsLiked = response.data?.content?.liked;
          newLikesCount = response.data?.content?.likesCount;

          refresh();
        } else {
          console.log(
            "Using localStorage for unauthenticated user or missing token"
          );
          // Unauthenticated user: Use localStorage only
          const likedProducts = JSON.parse(
            localStorage.getItem("likedProducts") || "[]"
          );
          const currentLikedSet = new Set(likedProducts);

          if (currentLikedSet.has(item.id)) {
            // Unlike
            currentLikedSet.delete(item.id);
            newIsLiked = false;
            newLikesCount = currentLikesCount > 0 ? currentLikesCount - 1 : 0;
          } else {
            // Like
            currentLikedSet.add(item.id);
            newIsLiked = true;
            newLikesCount = currentLikesCount + 1;
          }

          localStorage.setItem(
            "likedProducts",
            JSON.stringify(Array.from(currentLikedSet))
          );
        }

        setCurrentIsLiked(newIsLiked);
        setCurrentLikesCount(newLikesCount);
      } catch (error) {
        console.error("Error toggling like:", error);
        // Handle error appropriately
      }
    },
    [item?.id, userId, getAuthToken, currentLikesCount]
  );

  return (
    <div
      className={`group bg-white flex-col relative rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        index ? "animate-fade-in" : ""
      }`}
    >
      {/* TOP badge */}
      {item?.isTop && (
        <span className="absolute left-3 top-3 z-10 bg-gradient-to-r from-teal-500 to-teal-600 px-2 py-0.5 text-xs font-medium text-white rounded">
          TOP
        </span>
      )}

      {/* Image container */}
      <div className="relative w-full h-48 overflow-hidden">
        <Link to={detailLink} className="block w-full h-full">
          <img
            src={mainImage || "/placeholder.svg"}
            alt={item?.title || "Product image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content container */}
      <div className="px-4 py-3">
        {/* Title and description */}
        <div className="mb-2">
          <h3 className="text-lg font-medium line-clamp-2 text-gray-800 mb-1">
            {item?.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {item?.description}
          </p>
        </div>

        {/* Price */}
        <div>
          <div className="mb-2">
            <span className="text-xl font-bold text-teal-600">
              {item?.price}{" "}
              <span className="text-sm font-normal">
                {item?.currencyType || "so'm"}
              </span>
            </span>
            {item?.negotiable === true && (
              <span className="ml-2 text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                Kelishiladi
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-500 text-sm">
              <MapPinIcon className="w-4 h-4 mr-1 text-teal-600" />
              <span>{item?.location}</span>
            </div>
            {/* Date */}
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="w-4 h-4 mr-1 text-teal-600" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-500 text-sm">
              <Eye className="w-4 h-4 mr-1 text-teal-600" />
              <span>{item?.viewCount || 0}</span>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleLikeClick}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  currentIsLiked
                    ? "bg-teal-100 text-teal-600"
                    : "bg-gray-100 hover:bg-teal-50 hover:text-teal-600"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${currentIsLiked ? "fill-current" : ""}`}
                />
              </button>
              {item?.likesCount ||
                (currentLikesCount !== undefined && (
                  <span className="ml-1 text-gray-500 text-sm">
                    {item?.likesCount || currentLikesCount || 0}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ItemCard.displayName = "ItemCard";

ItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdAt: PropTypes.string,
    isTop: PropTypes.bool,
    mainImage: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        url: PropTypes.string,
        isMainImage: PropTypes.bool,
      })
    ),
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currencyType: PropTypes.string,
    negotiable: PropTypes.bool,
    location: PropTypes.string,
    viewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    likesCount: PropTypes.number,
    likes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  }).isRequired,
  index: PropTypes.number,
  authToken: PropTypes.string,
};

export default ItemCard;
