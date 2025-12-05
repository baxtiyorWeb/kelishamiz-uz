import { useState, useCallback, useEffect } from "react";
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Eye,
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
import useGetUser from "../../../hooks/services/useGetUser";
import { useQuery, useMutation, useQueryClient } from "react-query";

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
    return `${numPrice.toLocaleString("uz-UZ", {
      maximumFractionDigits: 0,
    })} so'm`;
  }
  return `${numPrice.toLocaleString("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
  })}`;
};

const getAuthToken = () => localStorage.getItem("accessToken");

const fetchProductById = async (id) => {
  if (!id) throw new Error("Mahsulot IDsi mavjud emas");
  const response = await api.get(`/products/by-id/${id}`);
  if (response.data.success && response.data.content) {
    return response.data.content;
  }
  throw new Error(
    response.data?.message ||
      "Mahsulot ma'lumotlarini yuklashda xatolik yuz berdi."
  );
};

const toggleLike = async ({ productId }) => {
  const response = await api.post(`/products/${productId}/like`, {});
  return response.data;
};

const useRegisterView = (id) => {
  const mutation = useMutation(
    async () => {
      if (!id) throw new Error("Mahsulot ID mavjud emas");
      const response = await api.post(`/products/${id}/view`);
      return response.data;
    },
    {
      onError: (err) => {
        console.error("View so‘rovi yuborishda xato:", err);
      },
      onSuccess: (data) => {
        console.log("View ro‘yxatga olindi:", data);
      },
    }
  );

  return mutation;
};

const ProductDetail = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(null);
  const { id } = useParams();
  const user = useGetUser();
  const userId = user?.sub;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const viewMutation = useRegisterView(id);

  useEffect(() => {
    if (id) viewMutation.mutate();
  }, [id]);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery(["productDetail", id], () => fetchProductById(id), {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      console.error("Failed to load product details:", err);
    },
  });

  const images =
    product?.images?.sort((a, b) => a.order - b.order).map((img) => img.url) ||
    [];
  const likesCount = product?.likesCount || 0;

  const { data: isLikedData } = useQuery({
    queryKey: ["isliked", id, userId], // faqat product va user id-ga bog'laymiz
    queryFn: async () => {
      const res = await api.get(`/products/${id}/like/status?userId=${userId}`);
      return res.data?.content?.liked;
    },
    enabled: !!id && !!userId, // faqat id va userId mavjud bo'lsa ishlaydi
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (typeof isLikedData === "boolean") {
      setIsLiked(isLikedData);
    }
  }, [isLikedData]);

  const likeMutation = useMutation(toggleLike, {
    onMutate: async () => {
      await queryClient.cancelQueries(["productDetail", id]);

      const previousProduct = queryClient.getQueryData(["productDetail", id]);

      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked
        ? likesCount + 1
        : Math.max(0, likesCount - 1);

      queryClient.setQueryData(["productDetail", id], (old) => {
        if (!old) return old;

        let newLikedIds = old.liked_ids ? [...old.liked_ids] : [];
        if (newIsLiked) {
          if (userId && !newLikedIds.includes(userId)) {
            newLikedIds.push(userId);
          }
        } else {
          newLikedIds = newLikedIds.filter((likedId) => likedId !== userId);
        }

        return {
          ...old,
          likesCount: newLikesCount,
          liked_ids: newLikedIds,
        };
      });

      return { previousProduct };
    },
    onError: (err, variables, context) => {
      console.error("Error toggling like, rolling back:", err);
      if (context?.previousProduct) {
        queryClient.setQueryData(
          ["productDetail", id],
          context.previousProduct
        );
      }
      alert(
        "Yoqtirishni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["productDetail", id]);
    },
  });

  const handleLikeClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!id) return;

      const token = getAuthToken();

      if (userId && token) {
        likeMutation.mutate({ productId: id });
      } else {
        alert("Iltimos, yoqtirishni saqlash uchun tizimga kiring!");
      }
    },
    [id, userId, likeMutation]
  );

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
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Mahsulot ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl ">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-xl font-semibold text-red-600 mb-2">
            Mahsulotni yuklashda xatolik
          </p>
          <p className="text-gray-600 text-sm">
            {error?.message || "Mahsulot topilmadi yoki xato yuz berdi."}
          </p>
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

  const propertyFeatures =
    product?.propertyValues?.map((prop) => {
      if (typeof prop.value === "object") {
        return {
          key: prop.value.key, // left text
          value: prop.value.value, // right text
        };
      }

      return {
        key: prop.key || "",
        value: prop.value || "",
      };
    }) || [];

  const primaryColor = "#A64AC9";
  return (
    <>
      <header className="bg-white md:hidden sm:block border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              aria-label="Orqaga qaytish"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <p className="text-sm font-medium text-gray-500">
              {product.category?.name || "Kategoriya"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLikeClick}
              className={`p-1.5 rounded-full bg-gradient-to-br from-rose-100 to-pink-50 
    group/likes hover:from-rose-200 hover:to-pink-100 transition-all duration-300
    ${isLiked ? "text-rose-600" : "text-rose-500"}`}
              aria-label="Sevimlilarga qo'shish"
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-300 ${
                  isLiked ? "fill-rose-600" : "fill-none"
                } group-hover/likes:scale-110`}
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

      <div className="max-w-7xl mx-auto sm:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-xl overflow-hidden shadow-sm relative">
              <div className="relative group">
                <button
                  onClick={() => openModal(currentImage)}
                  className="aspect-[4/3] w-full h-auto max-h-[350px] block focus:outline-none focus:ring-4 focus:ring-purple-200 cursor-zoom-in"
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

                <div
                  className="hidden lg:flex absolute bottom-3 right-3  gap-2 items-center 
    bg-white/100 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20"
                >
                  <div className="flex items-center gap-1 group/views cursor-pointer">
                    <div
                      className="p-1.5 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 
        group-hover/views:from-purple-200 group-hover/views:to-purple-100 transition-all duration-300"
                    >
                      <Eye
                        size={16}
                        className="text-purple-600 group-hover/views:scale-110 transition-transform"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 min-w-[20px] text-center">
                      {product.viewCount || 0}
                    </span>
                  </div>

                  <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                  <div className="flex items-center gap-1 group/likes cursor-pointer">
                    <button
                      onClick={handleLikeClick}
                      className={`p-1.5 rounded-full bg-gradient-to-br from-rose-100 to-pink-50
        hover:from-rose-200 hover:to-pink-100 transition-all duration-300
        ${isLiked ? "text-rose-600" : "text-rose-500"}`}
                      aria-label="Sevimlilarga qo'shish"
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform duration-300 
          ${
            isLiked ? "fill-rose-600" : "fill-none"
          } group-hover/likes:scale-110`}
                      />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 min-w-[20px] text-center">
                      {likesCount}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <div
              className="flex lg:hidden w-max float-right  bottom-3 right-3  gap-2 items-center 
    bg-white/100 backdrop-blur-md px-3 py-1.5 rounded-full  border border-white/20"
            >
              <div className="flex items-center gap-1 group/views cursor-pointer">
                <div
                  className="p-1 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 
        group-hover/views:from-purple-200 group-hover/views:to-purple-100 transition-all duration-300"
                >
                  <Eye
                    size={14} // kichikroq icon mobilga
                    className="text-purple-600 group-hover/views:scale-110 transition-transform"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 min-w-[20px] text-center">
                  {product.viewCount || 0}
                </span>
              </div>

              <div className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

              <div className="flex items-center gap-1 group/likes cursor-pointer">
                <button
                  onClick={handleLikeClick}
                  className={`p-1 rounded-full bg-gradient-to-br from-rose-100 to-pink-50
        hover:from-rose-200 hover:to-pink-100 transition-all duration-300
        ${isLiked ? "text-rose-600" : "text-rose-500"}`}
                  aria-label="Sevimlilarga qo'shish"
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-300 
          ${
            isLiked ? "fill-rose-600" : "fill-none"
          } group-hover/likes:scale-110`}
                  />
                </button>
                <span className="text-xs font-semibold text-gray-700 min-w-[20px] text-center">
                  {likesCount}
                </span>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImage === idx
                        ? "scale-100"
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

            <section className="bg-white rounded-xl p-5 shadow-sm space-y-5">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap word">
                {product.description || "Tavsif mavjud emas."}
               
              </p>
            </section>

            {propertyFeatures.length > 0 && (
              <section className="bg-white rounded-xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Asosiy Xususiyatlar
                </h2>
                <div className="space-y-3">
                  {propertyFeatures.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm font-medium text-gray-600">
                        {item?.key}
                      </span>
                      <div className="flex-1 mx-4 border-b border-dashed border-gray-300"></div>
                      <span className="text-sm font-semibold text-gray-900">
                        {item?.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-6">
              <div className="bg-white rounded-xl p-5 hidden lg:block">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatPrice(product.price, product.currencyType)}
                    </span>
                    {product.negotiable && (
                      <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                        Kelishuv
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleLikeClick}
                    className={`p-1.5 rounded-full bg-gradient-to-br from-rose-100 to-pink-50 
    group/likes hover:from-rose-200 hover:to-pink-100 transition-all duration-300
    ${isLiked ? "text-rose-600" : "text-rose-500"}`}
                    aria-label="Sevimlilarga qo'shish"
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isLiked ? "fill-rose-600" : "fill-none"
                      } group-hover/likes:scale-110`}
                    />
                  </button>
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
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      To'lov turi: {product.paymentType || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-5 border-b pb-3">
                  Sotuvchi Ma'lumotlari
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow"
                    style={{
                      backgroundColor:
                        product.profile?.avatarColor || primaryColor,
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

                    <div className="text-sm text-gray-500 space-y-1">
                      {product.profile?.createdAt && (
                        <p>
                          A'zo bo'lgan:{" "}
                          {new Date(product.profile.createdAt).getFullYear()}
                        </p>
                      )}
                      {product?.district?.name && (
                        <p className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">
                            Hudud:
                          </span>
                          {product?.district?.name}
                        </p>
                      )}
                      {product.profile?.phoneNumber && (
                        <p className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">
                            Telefon:
                          </span>
                          {product.profile.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {product.profile?.phoneNumber && (
                    <a
                      href={`tel:${product.profile.phoneNumber}`}
                      className="py-3 px-4 rounded-xl font-medium text-white text-sm 
                  flex items-center justify-center gap-2 transition-all 
                  hover:opacity-90 shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Phone className="w-4 h-4" />
                      Qo'ng'iroq
                    </a>
                  )}

                  {product.profile?.userId && (
                    <a
                      href={`/chat?userId=${product.profile.userId}&productId=${product.id}`}
                      className="py-3 px-4 rounded-xl font-medium text-sm 
                  flex items-center justify-center gap-2 border-2 transition-all 
                  hover:bg-gray-50 shadow-md"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3 border-b pb-2">
                  <AlertCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: primaryColor }}
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
              aria-label="Chat orqali bog'lanish"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
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
            className="relative w-full h-full max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
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
    </>
  );
};

export default ProductDetail;
