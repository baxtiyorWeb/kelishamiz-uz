import React, { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Eye,
  Shield,
  Phone,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react"; // lucide-icons o'rniga lucide-react ishlatilgan bo'lishi mumkin, lekin avvalgisi ishlamasa shuni tekshiring
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate qo'shildi
import api from "./../../../config/auth/api";
import Container from "../../../common/components/Container";

const ProductDetail = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate(); // useNavigate hook'i qo'shildi

  // --- Utility Functions ---

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${diffDays} days ago`;
  };

  const formatPrice = (price, currency) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "N/A";

    if (currency === "UZS") {
      // O'zbekistonda odatda so'm o'rniga "sum" ishlatilishi mumkin, shunga qarab o'zgartiring
      return `${numPrice.toLocaleString("uz-UZ")} so'm`;
    }
    // Dollarni to'g'ri formatlash
    return `${numPrice.toLocaleString("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    })}`;
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // --- Data Fetching ---

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // api.get o'rniga axios.get ishlatish, agar api.js ichida to'g'ri konfiguratsiya bo'lmasa
        const response = await api.get(`/products/by-id/${id}`);
        if (response.data.success && response.data.content) {
          setProduct(response.data.content);
          // Agar liked_ids bo'lsa va unda element bo'lsa, isFavorite true bo'ladi
          setIsFavorite(response.data.content.liked_ids?.length > 0);
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        // Agar xato bo'lsa, uning xabarini ko'rsatamiz
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch product data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // --- Derived Data ---

  const images =
    product?.images?.sort((a, b) => a.order - b.order).map((img) => img.url) ||
    [];

  const specifications = product
    ? [
        { label: "Category", value: product.category?.name || "N/A" },
        { label: "Payment", value: product.paymentType || "N/A" },
        { label: "Currency", value: product.currencyType || "N/A" },
        { label: "Negotiable", value: product.negotiable ? "Yes" : "No" },
        { label: "Region", value: product.region?.name || "N/A" },
        { label: "District", value: product.district?.name || "N/A" },
      ]
    : [];

  const propertyFeatures =
    product?.propertyValues?.map((prop) => prop.value) || [];

  // --- Loading/Error States ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-xl font-semibold text-red-600 mb-2">
            Error loading product
          </p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  // --- Component JSX ---

  return (
    <Container>
      {/* 1. Header (Sticky for mobile/desktop) */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)} // Or another back navigation logic
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              Product Details
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "bg-red-50 text-red-500"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              aria-label="Share product"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Layout */}
      <div className="max-w-[100dvw] sm:px-6 py-6 lg:py-8 border">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column (Main Content) - Mobile first: Full width, then 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <section className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative group max-w-[100dvw]">
                {/* Main Image Container */}
                <div className="aspect-[4/3] h-[50dvh]  w-full">
                  {images.length > 0 ? (
                    <img
                      src={images[currentImage]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Image Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md transition-opacity duration-300 hover:bg-white lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md transition-opacity duration-300 hover:bg-white lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentImage + 1} / {images.length}
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.isTop && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                      style={{ backgroundColor: "#A64AC9" }}
                    >
                      Featured
                    </span>
                  )}
                  {product.isPublish && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-md">
                      Published
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImage === idx
                        ? "shadow-lg scale-100"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: currentImage === idx ? "#A64AC9" : "#e5e7eb",
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price (Mobile/Tablet View - as a main block) */}
            <div className="bg-white rounded-xl p-5 shadow-sm lg:hidden">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-baseline gap-2 mb-4">
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#A64AC9" }}
                >
                  {formatPrice(product.price, product.currencyType)}
                </span>
                {product.negotiable && (
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    Negotiable
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {product.region?.name}, {product.district?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                Description
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description || "No description available."}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-3 border-t">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.viewCount || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{product.likesCount || 0} likes</span>
                </div>
              </div>
            </section>

            {/* Specifications */}
            <section className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Specifications
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                {specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border-b border-gray-100 pb-2"
                  >
                    <span className="text-xs font-medium text-gray-500">
                      {spec.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            {propertyFeatures.length > 0 && (
              <section className="bg-white rounded-xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Key Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyFeatures.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg"
                    >
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#E0AAFF" }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: "#A64AC9" }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Purchase Info/Seller) - Sticky on large screens */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Price Card (Desktop/Tablet View) */}
              <div className="bg-white rounded-xl p-5 shadow-lg hidden lg:block">
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: "#A64AC9" }}
                    >
                      {formatPrice(product.price, product.currencyType)}
                    </span>
                    {product.negotiable && (
                      <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-xl font-semibold text-gray-900 mb-4">
                  {product.title}
                </h1>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      {product.region?.name}, {product.district?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      Posted {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center"
                    style={{ backgroundColor: "#A64AC9" }}
                  >
                    Buy Now
                  </button>
                  <button
                    className="w-full py-3 rounded-xl font-semibold border-2 transition-all hover:bg-gray-50 flex items-center justify-center"
                    style={{ borderColor: "#A64AC9", color: "#A64AC9" }}
                  >
                    Make Offer
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900">
                    Buyer Protection: Money-back guarantee. Read more about{" "}
                    <a href="#" className="underline font-medium">
                      Terms
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* Seller Card */}
              <div className="w-[100dvw] border bg-white rounded-xl p-5 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  Seller Information
                </h3>

                {/* Seller Info */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Seller Avatar */}
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{
                      backgroundColor:
                        product.profile?.avatarColor || "#A64AC9",
                    }}
                  >
                    {product.profile?.avatar ? (
                      <img
                        src={product.profile.avatar}
                        alt={product.profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      product.profile?.fullName?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>

                  {/* Seller Name & Join Date */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">
                      {product.profile?.fullName || "Unknown Seller"}
                    </p>
                    {product.profile?.createdAt && (
                      <p className="text-sm text-gray-500">
                        Member since:{" "}
                        {new Date(product.profile.createdAt).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid w-full grid-cols-2 gap-2">
                  {product.profile?.phoneNumber && (
                    <a
                      href={`tel:${product.profile.phoneNumber}`}
                      className="py-3 px-4 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md"
                      style={{ backgroundColor: "#A64AC9" }}
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  )}

                  {product.profile?.userId && (
                    <a
                      href={`/chat?userId=${product.profile.userId}&productId=${product.id}`}
                      className="py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border-2 transition-all hover:bg-gray-50 shadow-md"
                      style={{ borderColor: "#A64AC9", color: "#A64AC9" }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </a>
                  )}
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-white w-[100dvw] rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3 border-b pb-2">
                  <AlertCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#A64AC9" }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Safety Tips
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                  <li>Meet in a safe public place</li>
                  <li>Check the item before purchase</li>
                  <li>Pay only after collecting item</li>
                  <li>Don't share financial info</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fixed Bottom Bar (for Mobile Price/Actions) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-2xl lg:hidden z-30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Price</span>
            <span className="text-xl font-bold" style={{ color: "#A64AC9" }}>
              {formatPrice(product.price, product.currencyType)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all hover:bg-gray-50"
              style={{ borderColor: "#A64AC9", color: "#A64AC9" }}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              className="py-2 px-4 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "#A64AC9" }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProductDetail;
