"use client";

import { useState, useEffect } from "react";
// Bu modullar loyihangizda mavjud deb hisoblanadi
import api from "../../../config/auth/api";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Package,
  Settings,
  LogOut,
  Plus,
  Eye,
  Clock,
  TrendingUp,
  X,
  Edit,
  Trash2,
  List,
} from "lucide-react";

// Tashqi komponentlar (loyihangiz strukturasidan kelib chiqib)
import ItemCard from "./../../../common/components/ItemCard";
import Container from "../../../common/components/Container";
import ProductUpdateModal from "./ProductUpdateModal";

// --- Yordamchi Vizual Komponentlar ---

/**
 * Statistik ma'lumotlar uchun ixcham karta.
 */
const StatCard = ({ icon: Icon, label, value, color = "purple" }) => {
  const colorMap = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
  };
  const iconClasses = colorMap[color] || colorMap.purple;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1 font-medium truncate">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 break-words">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl flex-shrink-0 ${iconClasses}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

/**
 * Foydalanuvchi Boshqaruv panelidagi e'lon kartasi (Tahrirlash/O'chirish tugmalari bilan).
 */
const DashboardItemCard = ({ product, onLike, isLiked, onEdit, onDelete }) => (
  <div className="relative group">
    <ItemCard
      key={product.id}
      item={product}
      onLike={() => onLike(product.id)}
      isLiked={isLiked}
    />

    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
      <button
        onClick={() => onEdit(product)}
        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all"
        title="E'lonni tahrirlash"
      >
        <Edit size={18} />
      </button>

      <button
        onClick={() => onDelete(product)}
        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        title="E'lonni o'chirish"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);

/**
 * Taymerli O'chirish Tasdiqlash Modali.
 */
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  productId,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isActive, setIsActive] = useState(false); // Taymerning faol/to'xtagan holati

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsActive(false);
      return;
    }

    setIsActive(true);
    let timer;

    timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Taymer tugaganda va hali ham faol bo'lsa (Bekor qilish bosilmagan bo'lsa), o'chirishni chaqirish
          if (isActive) {
            onConfirm(productId);
          }
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onConfirm, onClose, productId, isActive]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setIsActive(false); // Taymerni to'xtatish
    onClose();
  };

  const handleConfirmNow = () => {
    setIsActive(false); // Taymerni to'xtatish
    onConfirm(productId); // Darhol o'chirishni boshlash
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-start mb-4 border-b pb-3">
          <div className="flex items-center">
            <Trash2 className="text-red-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">
              E'lonni o'chirish
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Siz rostdan ham{" "}
          <strong className="font-semibold text-gray-800">
            "{productTitle}"
          </strong>{" "}
          e'lonini o'chirmoqchimisiz?
          <br />
          <span className="font-bold text-red-600 mt-2 block">
            {countdown} soniya ichida avtomatik ravishda o'chiriladi.
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleConfirmNow}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Ha, o'chirilsin
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Muvaffaqiyat bildirishnomasi Modali.
 */
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000); // 3 soniyadan keyin avtomatik yopish
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Muvaffaqiyat!</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};

/**
 * Butun sahifani qoplaydigan Yuklanish animatsiyasi.
 */
const LoaderOverlay = ({ isLoading, text = "Amal bajarilmoqda..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
        <svg
          className="animate-spin h-8 w-8 text-purple-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-3 text-gray-700 font-medium">{text}</p>
      </div>
    </div>
  );
};

/**
 * Yuklanish uchun Skeloton.
 */
const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl shadow-sm animate-pulse border border-gray-100 overflow-hidden"
      >
        <div className="h-28 md:h-36 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-full mt-2" />
        </div>
      </div>
    ))}
  </div>
);

const ProfileInfo = ({ isMobile = false, onClose, profile_info }) => {
  const content = profile_info?.content;
  const initial = content?.fullName?.charAt(0) || "U"; // 'U' - User
  const avatarUrl = content?.avatar;

  const avatar = avatarUrl ? (
    <img
      src={avatarUrl}
      alt="Avatar"
      className="w-full h-full object-cover rounded-xl"
    />
  ) : (
    <div
      className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-md`}
    >
      {initial}
    </div>
  );

  return (
    <div
      className={`flex items-center gap-4 ${
        isMobile ? "justify-between" : "mb-6 pb-6 border-b border-gray-100"
      }`}
    >
      <div className={`w-14 h-14 md:w-16 md:h-16 flex-shrink-0`}>{avatar}</div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate text-lg">
          {content?.fullName || "Foydalanuvchi"}
        </h3>
        <p className="text-sm text-gray-500">
          {content?.phoneNumber || "Telefon raqam yo'q"}
        </p>
      </div>

      {isMobile && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0"
        >
          <X size={24} />
        </button>
      )}
    </div>
  );
};

/**
 * Boshqaruv panelining Yon Menyusi (Sidebar).
 */
const SidebarContent = ({ isMobile = false, onClose, profile_info }) => {
  const sidebarLinks = [
    { icon: Package, label: "E'lonlarim", href: "/dashboard", badge: null },
    { icon: MessageCircle, label: "Xabarlar", href: "/chat", badge: 3 },
    { icon: TrendingUp, label: "Statistika", href: "/statistics", badge: null },
    { icon: Settings, label: "Sozlamalar", href: "/settings", badge: null },
  ];

  return (
    <nav className="space-y-1">
      {isMobile && (
        <ProfileInfo
          profile_info={profile_info}
          isMobile={true}
          onClose={onClose}
        />
      )}
      {sidebarLinks.map((link) => (
        <Link
          key={link.label}
          to={link.href}
          onClick={isMobile ? onClose : () => {}}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all group ${
            isMobile ? "text-base" : "text-base"
          } ${
            link.href === "/dashboard" ? "bg-purple-50 text-purple-700" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <link.icon
              size={20}
              className="group-hover:scale-105 transition-transform"
            />
            <span>{link.label}</span>
          </div>
          {link.badge && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {link.badge}
            </span>
          )}
        </Link>
      ))}
      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all mt-4">
        <LogOut size={20} />
        <span>Chiqish</span>
      </button>
    </nav>
  );
};

// --- Asosiy Komponent: UserDashboard ---

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);

  // Tahrirlash/O'chirish/Xabar modali holatlari
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const queryClient = useQueryClient();

  const { data: profile_info, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile_me", ], 
    queryFn: async () => {
      const response = await api.get("/profiles/me");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(stored);
  }, []);

  // Filterlash uchun tablar
  const tabs = [
    { id: "active", label: "Faol", icon: Package, filter: "elonlar" },
    { id: "pending", label: "Kutilmoqda", icon: Clock, filter: "kutilmoqda" },
    {
      id: "saved",
      label: "Yoqtirilganlar",
      icon: Heart,
      filter: "saqlanganlar",
    },
  ];

  // Dashbord ma'lumotlarini (e'lonlar va statistika) olish
  const fetchData = async () => {
    const currentFilter =
      tabs.find((t) => t.id === activeTab)?.filter || "elonlar";

    const response = await api.get(
      `/profiles/me/dashboard?filter=${currentFilter}`
    );

    return response.data;
  };

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard", activeTab],
    queryFn: fetchData,
  });

  // E'lonni o'chirish
  const deleteMutation = useMutation({
    mutationFn: async (productId) => {
      await api.delete(`/products/by-id/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboard", "active"]); // Faol e'lonlarni yangilash
      queryClient.invalidateQueries(["dashboard", "pending"]); // Kutilmoqda e'lonlarni yangilash
      setSuccessMessage("E'lon muvaffaqiyatli o'chirildi.");
      setIsSuccessModalOpen(true);
      closeDeleteModal();
    },
    onError: (error) => {
      console.error("O'chirishda xato:", error);
      alert("O'chirishda xato yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    },
  });

  // Yoqtirish/Yoqtirmaslik
  const handleLike = async (productId) => {
    const token = localStorage.getItem("accessToken");
    const isCurrentlyLiked = likedProducts.includes(productId);

    if (!token) {
      // Avtorizatsiyadan o'tmagan foydalanuvchi uchun Local Storage
      const updatedLikes = isCurrentlyLiked
        ? likedProducts.filter((id) => id !== productId)
        : [...likedProducts, productId];
      localStorage.setItem("likedProducts", JSON.stringify(updatedLikes));
      setLikedProducts(updatedLikes);
      // Agar 'saved' tabida bo'lsak va yoqtirishni o'chirsak, o'sha e'lon ro'yxatdan olib tashlanishi uchun dashboardni yangilash
      if (activeTab === "saved" && isCurrentlyLiked) {
        queryClient.invalidateQueries(["dashboard", activeTab]);
      }
    } else {
      // Avtorizatsiyadan o'tgan foydalanuvchi uchun API orqali
      try {
        await api.post(`/products/${productId}/like`, {});
        // Serverdagi holat o'zgargani uchun yoqtirilganlar ro'yxatini yangilash (agar "saved" tabida bo'lsa)
        queryClient.invalidateQueries(["dashboard", "saved"]);

        // Ma'lumotni to'g'ri sinxronlash uchun
        setLikedProducts((prev) =>
          isCurrentlyLiked
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
      } catch (err) {
        console.error("Like error:", err);
      }
    }
  };

  // Tahrirlash Modalini ochish
  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  // O'chirish Modalini ochish
  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // O'chirishni tasdiqlash
  const handleConfirmDelete = (productId) => {
    if (productId && !deleteMutation.isLoading) {
      deleteMutation.mutate(productId);
    }
  };

  // O'chirish Modalini yopish
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Muvaffaqiyat Modalini yopish
  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessMessage("");
  };

  const isProductLiked = (productId) => {
    return likedProducts.includes(productId);
  };

  const products =
    dashboardData?.content?.products || dashboardData?.content || [];
  const stats = dashboardData?.content?.stats || {};

  return (
    <Container className="py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
            <ProfileInfo profile_info={profile_info} />
            <SidebarContent profile_info={profile_info} />

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 my-6 border border-purple-200">
              <h4 className="text-base font-bold text-purple-800 mb-3">
                Bu oyda
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700 font-medium">
                    Ko'rishlar
                  </span>
                  <span className="font-bold text-purple-900">
                    {stats.views || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700 font-medium">E'lonlar</span>
                  <span className="font-bold text-purple-900">
                    {products.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-white p-6  lg:hidden transition-transform duration-300 ease-in-out overflow-y-auto">
            <SidebarContent
              isMobile={true}
              onClose={() => setShowMobileMenu(false)}
              profile_info={profile_info}
            />
          </div>
        )}

        <main className="flex-1 min-w-0 ">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h1 className="text-2xl font-bold text-gray-800">
              Boshqaruv Paneli
            </h1>
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <List size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard
              icon={Package}
              label="Jami e'lonlar"
              value={stats.totalProducts || 0}
              color="purple"
            />
            <StatCard
              icon={Eye}
              label="Ko'rishlar"
              value={stats.views || 0}
              color="blue"
            />
            <StatCard
              icon={Heart}
              label="Sevimlilar"
              value={stats.likes || 0}
              color="red"
            />
            <StatCard
              icon={MessageCircle}
              label="Xabarlar"
              value={stats.messages || 0} // Agar API dan kelsa
              color="purple"
            />
          </div>

          <div className="bg-white rounded-2xl  border border-gray-100 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Mening E'lonlarim
              </h2>
              <Link
                to="/add-item"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all active:scale-[0.98] text-sm font-medium shadow-lg shadow-purple-500/30"
              >
                <Plus size={18} />
                <span>E'lon qo'shish</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-6 overflow-x-auto whitespace-nowrap -mx-4 px-4 md:mx-0 md:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {isDashboardLoading ? (
              <LoadingSkeleton />
            ) : products.length > 0 ? (
              <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}
              >
                {products.map((product) => (
                  <DashboardItemCard
                    key={product.id}
                    product={product}
                    onLike={handleLike}
                    isLiked={isProductLiked(product.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              // Ma'lumot yo'q holati
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package size={30} className="text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Bu yerda e'lonlaringiz yo'q
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Yangi e'lon qo'shish orqali boshlang
                </p>
                <Link
                  to="/add-item"
                  className="inline-flex rounded-xl items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all active:scale-[0.98] font-medium text-base shadow-lg shadow-purple-500/30"
                >
                  <Plus size={18} />
                  <span>E'lon qo'shish</span>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>


      <ProductUpdateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProductToEdit(null);
          queryClient.invalidateQueries(["dashboard", activeTab]); // Ma'lumotlarni yangilash
        }}
        initialProduct={productToEdit}
        productId={productToEdit?.id}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        productTitle={productToDelete?.title || ""}
        productId={productToDelete?.id}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        message={successMessage}
      />

      <LoaderOverlay
        isLoading={deleteMutation.isLoading}
        text="E'lon o'chirilmoqda..."
      />
    </Container>
  );
};

export default UserDashboard;
