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
  X,
  ZoomIn,
  Store,
  BadgeCheck,
} from "lucide-react";
import useGetOneQuery from "../../../hooks/api/useGetOneQuery";
import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import ItemCard from "../../../common/components/ItemCard";
import useGetUser from "../../../hooks/services/useGetUser";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const user = useGetUser();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scroll({ top: 0, behavior: "smooth" });
  }, [id]);

  const { data, isLoading } = useGetOneQuery({
    key: `${KEYS.product_detail}/${id}`,
    url: `${URLS.product_detail}/${id}`,
    enabled: !!id,
  });

  const item = !isNull(get(data, "data.content"))
    ? get(data, "data.content", {})
    : {};

  const encodedTitle = encodeURIComponent(get(item, "title"));
  const categoryId = get(item, "categoryId");

  const { data: smartDetailProducts, isLoading: smartLoading } = useGetAllQuery(
    {
      key: `/products/search-by-id-and-category/${encodedTitle}?categoryId=${categoryId}`,
      url: `/products/search-by-id-and-category/${encodedTitle}?categoryId=${categoryId}`,
      enabled: !!encodedTitle && !!categoryId,
    }
  );

  const smartItems = !isNull(get(smartDetailProducts, "data.content"))
    ? get(smartDetailProducts, "data.content", [])
    : [];

  const processedImages = useMemo(() => {
    const images = get(item, "images", []);
    if (!isArray(images) || images.length === 0) {
      return [];
    }
    return images.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [item]);

  useEffect(() => {
    if (processedImages.length > 0) {
      const initialIndex =
        item?.imageIndex !== undefined &&
        item?.imageIndex >= 0 &&
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

  const formatPrice = (price) => {
    if (!price) return "";
    const numPrice = Number.parseFloat(price);
    return new Intl.NumberFormat("uz-UZ").format(numPrice);
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevModalImage = (e) => {
    e.stopPropagation();
    setModalImageIndex((prev) =>
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  const nextModalImage = (e) => {
    e.stopPropagation();
    setModalImageIndex((prev) =>
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  const openModal = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  async function getCurrentUserId() {
    return new Promise((resolve) => {
      if (user?.sub !== undefined) {
        return resolve(user?.sub);
      }

      const interval = setInterval(() => {
        if (user?.sub !== undefined) {
          clearInterval(interval);
          resolve(user?.sub);
        }
      }, 100);
    });
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Store size={48} className="text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">
        Mahsulotlar topilmadi
      </h3>
      <p className="text-gray-500 max-w-md text-lg">
        Hozircha bu toifada mahsulotlar mavjud emas. Iltimos, keyinroq qayta tekshiring.
      </p>
    </div>
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="rounded-2xl shadow-lg overflow-hidden bg-white"
        >
          <div className="w-full h-56 bg-gradient-to-br from-purple-100 to-purple-200 animate-pulse"></div>
          <div className="p-5">
            <div className="h-6 bg-purple-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 bg-purple-100 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 bg-purple-100 rounded-lg animate-pulse mb-3 w-2/3"></div>
            <div className="h-8 bg-gradient-to-r from-purple-200 to-purple-300 rounded-xl animate-pulse mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-10 bg-purple-200 rounded-xl animate-pulse w-2/5"></div>
              <div className="h-10 bg-purple-200 rounded-full animate-pulse w-10"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="h-[400px] md:h-[500px] bg-gradient-to-br from-purple-100 to-purple-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="flex space-x-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 md:w-24 md:h-24 bg-purple-200 rounded-2xl animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
                <div className="h-8 bg-purple-200 w-1/3 rounded-xl animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-purple-100 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-purple-100 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-purple-100 rounded-lg animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                <div className="h-8 bg-purple-200 w-3/4 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gradient-to-r from-purple-200 to-purple-300 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-purple-100 rounded-2xl animate-pulse"></div>
                <div className="flex space-x-4">
                  <div className="h-14 bg-purple-200 rounded-2xl flex-1 animate-pulse"></div>
                  <div className="h-14 bg-purple-200 rounded-2xl flex-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen pb-24 md:pb-16">
      {/* Modern Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-lg border-b border-purple-100">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button
              className="p-2.5 -ml-2 text-purple-600 hover:bg-purple-100 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <h1 className="text-lg font-bold truncate max-w-[180px] text-gray-800">
              {item?.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 relative hover:bg-purple-100 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={handleLikeClick}
              >
                <Heart
                  size={22}
                  strokeWidth={2.5}
                  className={
                    isLiked ? "fill-red-500 text-red-500" : "text-purple-600"
                  }
                />
                {item?.likesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                    {item.likesCount}
                  </span>
                )}
              </button>
              <button className="p-2.5 text-purple-600 hover:bg-purple-100 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95">
                <Share2 size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        {/* Modern Breadcrumbs */}
        <div className="hidden md:flex items-center text-sm mb-8 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-purple-100">
          <a href="/" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
            Bosh sahifa
          </a>
          <ChevronRight size={16} className="mx-2 text-purple-400" />
          <a href="/products" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
            Mahsulotlar
          </a>
          {item?.categoryId && (
            <>
              <ChevronRight size={16} className="mx-2 text-purple-400" />
              <a
                href={`/category/${item.categoryId}`}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {item?.category?.name || "Kategoriya"}
              </a>
            </>
          )}
          <ChevronRight size={16} className="mx-2 text-purple-400" />
          <span className="text-gray-700 font-semibold truncate max-w-[200px]">
            {item?.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image Gallery */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
              <div
                className="relative h-[350px] md:h-[500px] w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center cursor-zoom-in group"
                onClick={() => openModal(selectedImageIndex)}
              >
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent shadow-lg"></div>
                  </div>
                )}

                {processedImages.length > 0 ? (
                  <>
                    <img
                      src={selectedImageUrl || defaultImage}
                      alt={item?.title}
                      className={`h-full w-full object-contain transition-all duration-500 ${
                        isImageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                      } group-hover:scale-105`}
                      onLoad={handleImageLoad}
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                          <ZoomIn size={32} className="text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {processedImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-purple-600 p-3 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border border-purple-200"
                        >
                          <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-purple-600 p-3 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border border-purple-200"
                        >
                          <ChevronRight size={24} strokeWidth={2.5} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Store size={64} className="mb-4" />
                    <p className="text-lg font-medium">Rasm mavjud emas</p>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeClick();
                  }}
                  className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-2xl hover:bg-white transition-all hover:scale-110 active:scale-95 border border-purple-200 z-10"
                >
                  <Heart
                    size={24}
                    strokeWidth={2.5}
                    className={
                      isLiked ? "fill-red-500 text-red-500" : "text-purple-600"
                    }
                  />
                </button>

                {processedImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                    {selectedImageIndex + 1} / {processedImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {processedImages.length > 1 && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
                    {processedImages.map((image, index) => (
                      <div
                        key={index}
                        className={`border-2 rounded-2xl min-w-[80px] w-20 h-20 md:min-w-[100px] md:w-24 md:h-24 bg-white cursor-pointer transition-all duration-300 ${
                          selectedImageIndex === index
                            ? "ring-4 ring-purple-500 scale-110 shadow-2xl border-purple-500"
                            : "hover:ring-2 hover:ring-purple-300 hover:scale-105 border-purple-200 shadow-lg"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Properties */}
            <div className="space-y-6 bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-purple-100">
              <div className="md:hidden flex border-b-2 border-purple-100">
                <button
                  className={`flex-1 py-3 text-sm font-bold transition-all duration-300 ${
                    activeTab === "description"
                      ? "text-purple-600 border-b-4 border-purple-600 scale-105"
                      : "text-gray-500 hover:text-purple-600"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Tavsif
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-bold transition-all duration-300 ${
                    activeTab === "properties"
                      ? "text-purple-600 border-b-4 border-purple-600 scale-105"
                      : "text-gray-500 hover:text-purple-600"
                  }`}
                  onClick={() => setActiveTab("properties")}
                >
                  Xususiyatlar
                </button>
              </div>

              <div
                className={`space-y-4 ${
                  isMobile && activeTab !== "description" ? "hidden" : ""
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl mr-3 shadow-lg">
                    <Info size={24} className="text-white" />
                  </div>
                  Qisqacha ma'lumot
                </h2>
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-100">
                  <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                    {item?.description || "Mahsulot haqida ma'lumot mavjud emas."}
                  </p>
                </div>
              </div>

              <div
                className={`${
                  isMobile && activeTab !== "properties" ? "hidden" : ""
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl mr-3 shadow-lg">
                    <Tag size={24} className="text-white" />
                  </div>
                  Xususiyatlar
                </h2>
                <div className="space-y-3">
                  {isArray(item?.propertyValues) &&
                  item?.propertyValues.length > 0 ? (
                    item.propertyValues.map((property, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <p className="text-gray-600 font-semibold">
                          {property?.value?.key}
                        </p>
                        <p className="text-gray-900 font-bold text-lg">
                          {property?.value?.value}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic bg-purple-50 rounded-2xl">
                      Xususiyatlar haqida ma'lumot mavjud emas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 md:sticky md:top-4 space-y-6 border border-purple-100">
              <div className="flex items-center text-sm text-gray-600 mb-2 flex-wrap gap-3">
                <div className="flex items-center bg-purple-100 px-3 py-2 rounded-xl">
                  <MapPin size={16} className="mr-2 text-purple-600" strokeWidth={2.5} />
                  <span className="font-medium">
                    {item?.location || (
                      <>
                        {item?.region?.name}
                        {item?.district?.name && `, ${item?.district?.name}`}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center bg-purple-100 px-3 py-2 rounded-xl">
                  <Clock size={16} className="mr-2 text-purple-600" strokeWidth={2.5} />
                  <span className="font-medium">{getTimeAgo(item?.createdAt)}</span>
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {item?.title}
              </h1>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-3xl shadow-2xl">
                <div className="flex items-baseline flex-wrap gap-2 mb-3">
                  <span className="text-3xl md:text-4xl font-black text-white">
                    {formatPrice(item?.price)}
                  </span>
                  <span className="text-xl font-bold text-purple-100">
                    {item?.currencyType}
                  </span>
                </div>
                {item?.negotiable && (
                  <span className="inline-flex items-center text-sm font-bold text-purple-900 bg-white px-4 py-2 rounded-full shadow-lg">
                    <BadgeCheck size={16} className="mr-2" />
                    Narxi kelishiladi
                  </span>
                )}
                <div className="mt-4 pt-4 border-t border-purple-400">
                  <span className="text-white font-semibold flex items-center">
                    <Tag size={18} className="mr-2" />
                    {item?.paymentType || "To'lov turi ko'rsatilmagan"}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border-2 border-purple-200 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl mr-3">
                    <User size={20} className="text-white" />
                  </div>
                  Sotuvchi
                </h3>
                <div className="flex items-center mb-4">
                  {(item?.profile?.avatar !== null && (
                    <img
                      className="w-16 h-16 rounded-2xl shadow-lg border-2 border-purple-300"
                      src={item?.profile?.avatar}
                      alt="avatar"
                    />
                  )) || (
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-purple-300">
                      {item?.profile?.fullName?.charAt(0) || "S"}
                    </div>
                  )}
                  <div className="ml-4">
                    <p className="font-bold text-lg text-gray-800">
                      {item?.profile?.fullName || "Sotuvchi"}
                    </p>
                    <p className="text-base font-semibold text-purple-600">
                      {item?.profile?.phoneNumber ||
                        "Telefon raqam ko'rsatilmagan"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95">
                    <Phone size={18} className="mr-2" strokeWidth={2.5} />
                    Qo'ng'iroq
                  </button>
                  <button
                    onClick={async () => {
                      const currentUserId = await getCurrentUserId();
                      if (currentUserId !== item?.profile?.user?.id) {
                        window.location.href = `/chat?userId=${item?.profile?.user?.id}&productId=${item?.id}`;
                      }
                    }}
                    className="flex-1 bg-white hover:bg-purple-50 text-purple-600 font-bold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center border-2 border-purple-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <MessageCircle size={18} className="mr-2" strokeWidth={2.5} />
                    Xabar
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                    isLiked
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                      : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 hover:from-purple-200 hover:to-purple-300 border-2 border-purple-300"
                  }`}
                  onClick={handleLikeClick}
                >
                  <Heart size={20} strokeWidth={2.5} className={isLiked ? "fill-white" : ""} />
                  <span className="font-bold">{item?.likesCount || 0}</span>
                </button>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-200 px-5 py-3 rounded-2xl border-2 border-purple-300 shadow-lg">
                  <Eye size={20} className="text-purple-600" strokeWidth={2.5} />
                  <span className="font-bold text-purple-600">{item?.viewCount || 0}</span>
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 hover:from-purple-200 hover:to-purple-300 border-2 border-purple-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                  <Share2 size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="border-t-2 border-purple-100 pt-6 space-y-4">
                <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl">
                  <span className="text-gray-600 font-semibold flex items-center">
                    <Calendar size={18} className="mr-2 text-purple-500" strokeWidth={2.5} />
                    Qo'shilgan:
                  </span>
                  <span className="font-bold text-gray-800">
                    {formatDate(item?.createdAt)}
                  </span>
                </div>

                {(item?.location ||
                  item?.region?.name ||
                  item?.district?.name) && (
                  <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl">
                    <span className="text-gray-600 font-semibold flex items-center">
                      <MapPin size={18} className="mr-2 text-purple-500" strokeWidth={2.5} />
                      Joylashuv:
                    </span>
                    <span className="font-bold text-gray-800">
                      {item?.location || (
                        <>
                          {item?.region?.name}
                          {item?.district?.name && `, ${item?.district?.name}`}
                        </>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl">
                  <span className="text-gray-600 font-semibold flex items-center">
                    <Tag size={18} className="mr-2 text-purple-500" strokeWidth={2.5} />
                    E'lon ID:
                  </span>
                  <span className="font-bold text-gray-800">{item?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-black text-gray-800 mb-8 flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl mr-4 shadow-xl">
              <Store size={28} className="text-white" />
            </div>
            O'xshash mahsulotlar
          </h2>
          {smartLoading ? (
            renderSkeletons()
          ) : smartItems?.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {smartItems?.map((item, index) => (
                <ItemCard key={item?.id || index} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-14 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 flex items-center gap-3 z-30 border-t-2 border-purple-100">
          <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95">
            <Phone size={20} className="mr-2" strokeWidth={2.5} />
            Qo'ng'iroq
          </button>
          <button
            onClick={async () => {
              const currentUserId = await getCurrentUserId();
              if (currentUserId !== item?.profile?.user?.id) {
                window.location.href = `/chat?userId=${item?.profile?.user?.id}&productId=${item?.id}`;
              }
            }}
            className="flex-1 bg-white text-purple-600 font-bold py-4 px-4 rounded-2xl flex items-center justify-center border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
          >
            <MessageCircle size={20} className="mr-2" strokeWidth={2.5} />
            Xabar
          </button>
        </div>
      )}

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 animate-in fade-in"
          onClick={closeModal}
        >
          <div
            className="relative max-w-7xl w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={processedImages[modalImageIndex]?.url || defaultImage}
              alt={item?.title}
              className="max-h-[90vh] w-auto object-contain rounded-3xl shadow-2xl"
            />
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm hover:bg-white text-purple-600 p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95"
            >
              <X size={28} strokeWidth={2.5} />
            </button>
            {processedImages.length > 1 && (
              <>
                <button
                  onClick={prevModalImage}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-purple-600 p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <button
                  onClick={nextModalImage}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-purple-600 p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronRight size={32} strokeWidth={2.5} />
                </button>
              </>
            )}
            {processedImages.length > 1 && (
              <div className="absolute bottom-6 bg-black/70 backdrop-blur-sm text-white text-lg font-bold px-6 py-3 rounded-full shadow-2xl">
                {modalImageIndex + 1} / {processedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;