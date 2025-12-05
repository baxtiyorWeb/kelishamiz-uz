"use client";

import { format } from "date-fns";
import { Calendar, Eye, Heart, MapPinIcon } from "lucide-react";
import PropTypes from "prop-types";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useGetUser from "../../hooks/services/useGetUser";
import api from "../../config/auth/api";

const ItemCard = React.memo(({ item, index, authToken, refresh , viewMode}) => {
  
  const [currentIsLiked, setCurrentIsLiked] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState();
  const user = useGetUser();
  const userId = user?.sub;

  const getAuthToken = useCallback(() => {
    if (authToken) return authToken;
    return localStorage.getItem("accessToken");
  }, [authToken]);

 

  useEffect(() => {
    const token = getAuthToken();
    if (userId && token && item?.likes) {
      setCurrentIsLiked(item.likes.some((likeUser) => likeUser.id === userId));
    } else {
      const likedProducts = JSON.parse(
        localStorage.getItem("likedProducts") || "[]"
      );
      setCurrentIsLiked(likedProducts.includes(item?.id));
    }
    setCurrentLikesCount(item?.likesCount || 0);
  }, [item, userId, getAuthToken]);

  useEffect(() => {
    const syncLocalLikes = async () => {
      const token = getAuthToken();
      if (userId && token) {
        try {
          const likedProducts = JSON.parse(
            localStorage.getItem("likedProducts") || "[]"
          );

          if (likedProducts.length > 0) {
            await api.get(`/products/liked?ids=${likedProducts.join(",")}`, {});

            localStorage.removeItem("likedProducts");
          }
        } catch (error) {
          console.error("Error syncing likes:", error);
        }
      }
    };

    syncLocalLikes();
  }, [userId, getAuthToken]);

  const formattedDate = useMemo(() => {
    if (item?.createdAt) {
      return format(new Date(item.createdAt), "dd MMM");
    }
    return "";
  }, [item?.createdAt]);

  const detailLink = useMemo(() => `/detail/${item?.id}?infoTab=1`, [item?.id]);



  const handleLikeClick = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!item?.id) return;

      const token = getAuthToken();


      try {
        let newIsLiked;
        let newLikesCount;

        if (userId && token) {
          
          const response = await api.post(`/products/${item.id}/like`, {});
          newIsLiked = response.data?.content?.liked;
          newLikesCount = response.data?.content?.likesCount;

        } else {
         
          const likedProducts = JSON.parse(
            localStorage.getItem("likedProducts") || "[]"
          );
          const currentLikedSet = new Set(likedProducts);

          if (currentLikedSet.has(item.id)) {
            currentLikedSet.delete(item.id);
            newIsLiked = false;
            newLikesCount = currentLikesCount > 0 ? currentLikesCount - 1 : 0;
          } else {
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
      }
    },
    [item?.id, userId, getAuthToken, currentLikesCount]
  );

  return (
    <div
      className={`group  bg-white flex-col relative rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        index ? "animate-fade-in" : ""
      }`}
    >
      {item?.isTop && (
        <span className="absolute left-3 top-3 z-10 bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-0.5 text-[10px] font-medium text-white rounded">
          TOP
        </span>
      )}

      <div className="relative w-full overflow-hidden aspect-[4/3]">
        <Link to={detailLink} className="absolute inset-0 block">
          <img
            src={item?.images?.[item?.imageIndex]?.url || "/placeholder.svg"}
            alt={item?.title || "Product image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-1">
          {item?.title}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-purple-600">
            {item?.price}
            <span className="text-xs font-normal ml-1">
              {item?.currencyType || "so'm"}
            </span>
          </span>
          {item?.negotiable && (
            <span className="text-[10px] absolute right-1 top-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              Kelishiladi
            </span>
          )}
        </div>

        <div className="flex items-start justify-center space-y-1 flex-col text-gray-500 text-xs mb-2">
          <div className="flex items-center">
            <MapPinIcon className="w-3.5 h-3.5 mr-1 text-purple-600" />
            <span className="truncate max-w-[70px]">{item?.district?.name}</span>
          </div>
          <div className="flex items-center text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            <Calendar className="w-3.5 h-3.5 mr-1 text-purple-600" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-xs">
            <Eye className="w-4 h-4 mr-1 text-purple-600" />
            <span>{item?.viewCount || 0}</span>
          </div>

          <button
            onClick={handleLikeClick}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
              currentIsLiked
                ? "bg-purple-100 text-purple-600"
                : "bg-gray-100 hover:bg-purple-50 hover:text-purple-600"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${currentIsLiked ? "fill-current" : ""}`}
            />
          </button>
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
  refresh: PropTypes.func,
};

export default ItemCard;
