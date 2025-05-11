"use client";

import { useMemo } from "react";
import { get, isArray, isNull } from "lodash";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Heart,
  Phone,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Eye,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Share2,
  Info,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import useGetOneQuery from "../../../hooks/api/useGetOneQuery";
import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import InfiniteScroll from "react-infinite-scroll-component";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import ItemCard from "../../../common/components/ItemCard";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data, isLoading } = useGetOneQuery({
    key: `${KEYS.product_detail}/${id}`,
    url: `${URLS.product_detail}/${id}`,
    enabled: !!id,
  });

  const item = !isNull(get(data, "data.content"))
    ? get(data, "data.content", {})
    : {};


  const { data: smartDetailProducts, isLoading: smartLoading } = useGetAllQuery(
    {
      key: `/products/search-by-id-and-category/${id}?categoryId=${get(
        item,
        "categoryId"
      )}`,
      url: `/products/search-by-id-and-category/${id}?categoryId=${get(
        item,
        "categoryId"
      )}`,
      enabled: !!id && !!get(item, "categoryId"),
    }
  );

  

  const smartItems = !isNull(get(smartDetailProducts, "data.content.data"))
    ? get(smartDetailProducts, "data.content.data", [])
    : [];

  const processedImages = useMemo(() => {
    const images = get(item, "images", []);
    if (!isArray(images) || images.length === 0) {
      return [];
    }
    return images;
  }, [item]);

  useEffect(() => {
    if (processedImages.length > 0) {
      const initialIndex =
        item?.imageIndex !== undefined &&
        item?.imageIndex < processedImages.length
          ? item.imageIndex
          : 0;
      setSelectedImageIndex(initialIndex);
    }
  }, [processedImages, item?.imageIndex]);

  const selectedImageUrl = processedImages[selectedImageIndex]?.url || "";

  const defaultImage =
    "https://via.placeholder.com/600x400?text=No+Image+Available";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month}, ${year}. ${hours}:${minutes}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffMonth > 0) return `${diffMonth} oy oldin`;
    if (diffDay > 0) return `${diffDay} kun oldin`;
    if (diffHour > 0) return `${diffHour} soat oldin`;
    if (diffMin > 0) return `${diffMin} daqiqa oldin`;
    return "Hozirgina";
  };

  // Format price with currency
  const formatPrice = (price) => {
    if (!price) return "";
    const numPrice = Number.parseFloat(price);
    return new Intl.NumberFormat("uz-UZ").format(numPrice);
  };

  // Handle like button click
  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    // Here you would typically call an API to update the like status
  };

  // Navigate to previous image
  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-teal-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Hech qanday mahsulot topilmadi
      </h3>
      <p className="text-gray-500 max-w-md">
        Hozircha bu toifada mahsulotlar mavjud emas. Iltimos, keyinroq qayta
        tekshiring yoki boshqa toifani tanlang.
      </p>
    </div>
  );

  // Loading skeleton for initial load
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-sm overflow-hidden bg-white"
        >
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="md:col-span-1 lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-[300px] md:h-[400px] bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="flex space-x-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 w-1/3 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="md:col-span-1 lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 w-3/4 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 w-1/2 rounded animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex space-x-3">
                  <div className="h-12 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-16">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button
              className="p-2 -ml-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-medium truncate max-w-[200px]">
              {item?.title}
            </h1>
            <div className="flex items-center">
              <button
                className="p-2 relative hover:bg-teal-50 rounded-full transition-colors"
                onClick={handleLikeClick}
              >
                <Heart
                  size={20}
                  className={
                    isLiked ? "fill-red-500 text-red-500" : "text-teal-600"
                  }
                />
                {item?.likesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.likesCount}
                  </span>
                )}
              </button>
              <button className="p-2 relative ml-1 text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Breadcrumbs - Desktop only */}
        <div className="hidden md:flex items-center text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-teal-600 transition-colors">
            Bosh sahifa
          </a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-teal-600 transition-colors">
            Mahsulotlar
          </a>
          {item?.categoryId && (
            <>
              <span className="mx-2">/</span>
              <a
                href={`/category/${item.categoryId}`}
                className="hover:text-teal-600 transition-colors"
              >
                {item?.category?.name || "Kategoriya"}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-700 truncate max-w-[200px]">
            {item?.title}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Left Column - Images and Properties */}
          <div className="md:col-span-1 lg:col-span-3 space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-[300px] md:h-[450px] w-full bg-gray-100 flex items-center justify-center">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                )}

                {processedImages.length > 0 ? (
                  <>
                    <img
                      src={selectedImageUrl || defaultImage}
                      alt={item?.title}
                      className={`h-full w-full object-contain transition-opacity duration-300 ${
                        isImageLoading ? "opacity-0" : "opacity-100"
                      }`}
                      onLoad={handleImageLoad}
                    />

                    {/* Image navigation buttons */}
                    {processedImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-teal-600 p-2 rounded-full shadow-md transition-all hover:scale-110"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-teal-600 p-2 rounded-full shadow-md transition-all hover:scale-110"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${defaultImage})` }}
                  ></div>
                )}

                {/* Like Button - Overlay */}
                <button
                  onClick={handleLikeClick}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                >
                  <Heart
                    size={20}
                    className={
                      isLiked ? "fill-red-500 text-red-500" : "text-teal-600"
                    }
                  />
                </button>

                {/* Image Counter - Mobile only */}
                {processedImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {selectedImageIndex + 1} / {processedImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {processedImages.length > 1 && (
                <div className="p-4 overflow-x-auto">
                  <div className="flex space-x-3">
                    {processedImages.map((image, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg w-16 h-16 md:w-20 md:h-20 min-w-[4rem] md:min-w-[5rem] bg-gray-100 cursor-pointer transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "ring-2 ring-teal-500 scale-105"
                            : "hover:ring-1 hover:ring-gray-300"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Properties - Moved below image */}
            <div className="space-y-6 bg-white rounded-xl shadow-sm p-4">
              {/* Tabs for mobile */}
              <div className="md:hidden flex border-b border-gray-200">
                <button
                  className={`flex-1 py-2 text-sm font-medium ${
                    activeTab === "description"
                      ? "text-teal-600 border-b-2 border-teal-500"
                      : "text-gray-500 hover:text-teal-600"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Tavsif
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium ${
                    activeTab === "properties"
                      ? "text-teal-600 border-b-2 border-teal-500"
                      : "text-gray-500 hover:text-teal-600"
                  }`}
                  onClick={() => setActiveTab("properties")}
                >
                  Xususiyatlar
                </button>
              </div>

              {/* Description */}
              <div
                className={`space-y-1 ${
                  isMobile && activeTab !== "description" ? "hidden" : ""
                }`}
              >
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Info size={18} className="mr-2 text-teal-500" />
                  Qisqacha ma'lumot
                </h2>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {item?.description || "Mahsulot haqida ma'lumot mavjud emas."}
                </p>
              </div>

              {/* Properties */}
              <div
                className={`${
                  isMobile && activeTab !== "properties" ? "hidden" : ""
                }`}
              >
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Tag size={18} className="mr-2 text-teal-500" />
                  Xususiyatlar
                </h2>
                <div className="space-y-1">
                  {isArray(item?.propertyValues) &&
                  item?.propertyValues.length > 0 ? (
                    item.propertyValues.map((property, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                      >
                        <p className="text-gray-600 font-medium">
                          {property?.value?.key}
                        </p>
                        <div className="flex-1 mx-4 border-t border-dashed border-gray-200 hidden md:block"></div>
                        <p className="text-gray-900 font-medium">
                          {property?.value?.value}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      Xususiyatlar haqida ma'lumot mavjud emas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="md:col-span-1 lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 md:sticky md:top-4 space-y-6">
              {/* Location and Date */}
              <div className="flex items-center text-xs md:text-sm text-gray-500 mb-1 flex-wrap">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1 text-teal-500" />
                  <span>
                    {item?.location || (
                      <>
                        {item?.region?.name}{" "}
                        {item?.district?.name && `, ${item?.district?.name}`}
                      </>
                    )}
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full mx-2"></div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 text-teal-500" />
                  <span>{getTimeAgo(item?.createdAt)}</span>
                </div>
              </div>

              {/* Title - Desktop only */}
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                {item?.title}
              </h1>

              {/* Price */}
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl">
                <div className="flex items-baseline flex-wrap">
                  <span className="text-2xl md:text-3xl font-bold text-teal-700">
                    {formatPrice(item?.price)} {item?.currencyType}
                  </span>
                  {item?.negotiable && (
                    <span className="ml-2 text-sm text-teal-600 font-medium bg-white px-2 py-0.5 rounded-full border border-teal-200">
                      Narxi kelishiladi
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-teal-700">
                  <span className="font-medium flex items-center">
                    <Tag size={14} className="mr-1" />
                    {item?.paymentType || "To'lov turi ko'rsatilmagan"}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-1 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <User size={18} className="mr-2 text-teal-500" />
                  Sotuvchi bilan bog'lanish
                </h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    {item?.profile?.fullName?.charAt(0) || "S"}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">
                      {item?.profile?.fullName || "Sotuvchi"}
                    </p>
                    <p className="text-sm font-medium text-teal-600">
                      {item?.profile?.phoneNumber ||
                        "Telefon raqam ko'rsatilmagan"}
                    </p>
                    {item?.profile?.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.profile.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button className="text-sm flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium p-1 rounded-xl transition-colors flex items-center justify-center shadow-sm">
                    <Phone size={16} className="mr-1" />
                    Qo'ng'iroq qilish
                  </button>
                  <button className="flex-1 text-sm bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-700 font-medium p-1 rounded-xl transition-colors flex items-center justify-center border border-teal-200">
                    <MessageCircle size={16} className="mr-1" />
                    Xabar yozish
                  </button>
                </div>
              </div>

              {/* Social Stats with Like Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    isLiked
                      ? "bg-red-50 text-red-500 border border-red-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"
                  }`}
                >
                  <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
                  <span>{item?.likesCount || 0}</span>
                </button>
                <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <Eye size={18} className="mr-2 text-teal-500" />
                  <span>Ko'rishlar: {item?.viewCount || 0}</span>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors bg-gray-50 text-gray-600 border border-gray-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 ml-auto">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {/* Date Added */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Calendar size={16} className="mr-2 text-teal-500" />
                    Qo'shilgan sana:
                  </span>
                  <span className="font-medium">
                    {formatDate(item?.createdAt)}
                  </span>
                </div>

                {/* Location */}
                {(item?.location ||
                  item?.region?.name ||
                  item?.district?.name) && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center">
                      <MapPin size={16} className="mr-2 text-teal-500" />
                      Joylashuv:
                    </span>
                    <span className="font-medium">
                      {item?.location || (
                        <>
                          {item?.region?.name}{" "}
                          {item?.district?.name && `, ${item?.district?.name}`}
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* ID */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Tag size={16} className="mr-2 text-teal-500" />
                    E'lon ID:
                  </span>
                  <span className="font-medium">{item?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-10xl border w-">
        {smartLoading ? (
          renderSkeletons()
        ) : smartItems?.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {smartItems?.map((item, index) => (
              <ItemCard key={item?.id || index} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
      {/* Sticky Footer - Mobile only */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-1 flex space-x-3 z-20">
          <button className="flex-1 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 text-teal-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center">
            <Phone size={16} className="mr-2" />
            Qo'ng'iroq qilish
          </button>
          <button className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center shadow-sm">
            <MessageCircle size={16} className="mr-2" />
            Xabar yozish
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
