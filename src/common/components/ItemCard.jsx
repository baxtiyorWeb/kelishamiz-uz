"use client";

import { format } from "date-fns";
import {
  Calendar,
  Eye,
  Heart,
  LocateIcon,
  MapIcon,
  MapPinIcon,
} from "lucide-react";
import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const ItemCard = React.memo(({ item, index }) => {
  const formattedDate = useMemo(() => {
    if (item?.createdAt) {
      return format(new Date(item.createdAt), "dd MMM");
    }
    return "";
  }, [item?.createdAt]);

  const detailLink = useMemo(() => `/detail/${item?.id}?infoTab=1`, [item?.id]);

  // Find the main image from the images array
  const mainImage = useMemo(() => {
    if (item?.images && item.images.length > 0) {
      // Find the image where isMainImage is true
      const main = item.images.find((img) => img.isMainImage);
      // If found, return its URL, otherwise return the first image's URL
      return main ? main.url : item.images[0].url;
    }
    // Fallback to mainImage property or placeholder
    return item?.mainImage || "https://via.placeholder.com/150";
  }, [item?.images, item?.mainImage]);

  return (
    <div
      className={`group   flex-col   relative rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        index ? "animate-fade-in" : ""
      }`}
    >
      {/* TOP badge */}
      {item?.isTop && (
        <span className="absolute left-3 top-3 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 px-2 py-0.5 text-xs font-medium text-white rounded">
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
      <div className="px-4 py-2">
        {/* Title and description */}
        <div className="mb-1">
          <h3 className="text-lg font-medium line-clamp-2 text-gray-800 mb-1">
            {item?.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {item?.description}
          </p>
        </div>

        {/* Price */}
        <div>
          <div className="mb-1">
            <span className="text-lg font-semibold text-emerald-700">
              {item?.price}{" "}
              <span className="text-sm font-normal">
                {item?.currencyType || "so'm"}
              </span>
            </span>
            {item?.negotiable === true && (
              <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                Kelishiladi
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <MapPinIcon className="w-4 h-4 mr-1 text-emerald-600" />
              <span>{item?.location}</span>
            </div>
            {/* Date */}
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <Calendar className="w-4 h-4 mr-1 text-emerald-600" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-gray-500 text-sm">
              <Eye className="w-4  mr-1 text-emerald-600" />
              <span>{item?.viewCount || 0}</span>
            </div>

            <button className="flex items-center justify-center  rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <Heart className="w-5 h-5 text-emerald-600" />
            </button>
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
    viewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  index: PropTypes.number,
};

export default ItemCard;
