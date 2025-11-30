import  { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Eye,
  Shield,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./../../../config/auth/api";
import Container from "../../../common/components/Container";


const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHrs < 24) return `${diffHrs} soat oldin`;
  return `${diffDays} kun oldin`;
};

const formatPrice = (price, currency) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return "N/A";

  if (currency === "UZS") {
    return `${numPrice.toLocaleString("uz-UZ", { maximumFractionDigits: 0 })} so'm`;
  }
  return `${numPrice.toLocaleString("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
  })}`;
};

const ProductDetail = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index) => {
    setCurrentImage(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/by-id/${id}`);
        if (response.data.success && response.data.content) {
          setProduct(response.data.content);
          setIsFavorite(response.data.content.liked_ids?.length > 0);
        } else {
          setError("Mahsulot topilmadi.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Mahsulot ma'lumotlarini yuklashda xatolik yuz berdi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const images =
    product?.images?.sort((a, b) => a.order - b.order).map((img) => img.url) ||
    [];

  const specifications = product
    ? [
        { label: "Kategoriya", value: product.category?.name || "N/A" },
        { label: "To'lov turi", value: product.paymentType || "N/A" },
        { label: "Valyuta", value: product.currencyType || "N/A" },
        { label: "Kelishuv", value: product.negotiable ? "Bor" : "Yo'q" },
        { label: "Viloyat", value: product.region?.name || "N/A" },
        { label: "Tuman", value: product.district?.name || "N/A" },
      ]
    : [];

  const propertyFeatures =
    product?.propertyValues?.map((prop) => prop.value) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Mahsulot ma'lumotlari yuklanmoqda...</p>
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
            Mahsulotni yuklashda xatolik
          </p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <header className="bg-white md:hidden sm:block border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              aria-label="Orqaga qaytish"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              Mahsulot Tafsilotlari
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
              aria-label="Sevimlilarga qo'shish"
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              aria-label="Ulashish"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative group">
                <button
                  onClick={() => openModal(currentImage)}
                  className="aspect-[4/3] w-full h-auto max-h-[500px] block focus:outline-none focus:ring-4 focus:ring-purple-200 cursor-zoom-in"
                  aria-label="Rasmni kattalashtirish"
                >
                  {images.length > 0 ? (
                    <img
                      src={images[currentImage]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      Rasm mavjud emas
                    </div>
                  )}
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md transition-opacity duration-300 hover:bg-white lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label="Oldingi rasm"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md transition-opacity duration-300 hover:bg-white lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label="Keyingi rasm"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentImage + 1} / {images.length}
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  {product.isTop && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                      style={{ backgroundColor: "#A64AC9" }}
                    >
                      Tavsiya etiladi
                    </span>
                  )}
                  {product.isPublish && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-md">
                      Nashr etilgan
                    </span>
                  )}
                </div>
              </div>
            </section>

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
                    aria-label={`${idx + 1}-rasmga o'tish`}
                  >
                    <img
                      src={img}
                      alt={`Kichik rasm ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

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
                    Kelishuv
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

            <section className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                Tavsif
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description || "Tavsif mavjud emas."}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-3 border-t">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.viewCount || 0} ko'rishlar</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{product.likesCount || 0} yoqtirishlar</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Texnik Xususiyatlar
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

            {propertyFeatures.length > 0 && (
              <section className="bg-white rounded-xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Asosiy Xususiyatlar
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

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-6">
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
                        Kelishuv
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
                      Joylashtirildi {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900">
                    Xaridor Himoyasi: Pulni qaytarish kafolati.{" "}
                    <a href="#" className="underline font-medium">
                      Shartlar
                    </a>{" "}
                    haqida ko'proq o'qing.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  Sotuvchi Ma'lumotlari
                </h3>

                <div className="flex items-center gap-3 mb-4 w-full">
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

                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">
                      {product.profile?.fullName || "Noma'lum sotuvchi"}
                    </p>
                    {product.profile?.createdAt && (
                      <p className="text-sm text-gray-500">
                        A'zo bo'lgan:{" "}
                        {new Date(product.profile.createdAt).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.profile?.phoneNumber && (
                    <a
                      href={`tel:${product.profile.phoneNumber}`}
                      className="py-3 px-4 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md"
                      style={{ backgroundColor: "#A64AC9" }}
                    >
                      <Phone className="w-4 h-4" />
                      Qo'ng'iroq
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

              <div className="bg-white rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3 border-b pb-2">
                  <AlertCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#A64AC9" }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Xavfsizlik bo'yicha maslahatlar
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                  <li>Xavfsiz jamoat joyida uchrashing</li>
                  <li>Sotib olishdan oldin mahsulotni tekshiring</li>
                  <li>Faqat mahsulotni olgandan keyin to'lov qiling</li>
                  <li>Moliyaviy ma'lumotlarni ulashmang</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-2xl lg:hidden z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Narx</span>
            <span className="text-xl font-bold" style={{ color: "#A64AC9" }}>
              {formatPrice(product.price, product.currencyType)}
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href={`/chat?userId=${product.profile?.userId}&productId=${product.id}`}
              className="py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all hover:bg-gray-50"
              style={{ borderColor: "#A64AC9", color: "#A64AC9" }}
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <button
              className="py-2 px-4 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "#A64AC9" }}
            >
              Sotib olish
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm transition-opacity duration-300 ease-out"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-7xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="aspect-video max-h-[80vh] mx-auto flex items-center justify-center">
              <img
                src={images[currentImage]}
                alt={`${product.title} - ${currentImage + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                  aria-label="Oldingi rasm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                  aria-label="Keyingi rasm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProductDetail;