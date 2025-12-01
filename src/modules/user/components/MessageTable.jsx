"use client";

import { useState, useEffect, useMemo } from "react";
// api, useQuery, useMutation kabi modullar loyihangizga qarab sozlanadi
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
  Search,
  Grid,
  List,
  Eye,
  Clock,
  Archive,
  FileText,
  TrendingUp,
  X,
  Edit,
  Trash2,
} from "lucide-react";

// Tashqi komponentlar importi (Ushbu faylda mavjud emas, lekin kerak)
import ItemCard from "./../../../common/components/ItemCard";
import Container from "../../../common/components/Container";
import ProductUpdateModal from "./ProductUpdateModal";

// =========================================================================
// I. YORDAMCHI KOMPONENTLAR
// =========================================================================

// --- I.1. StatCard ---
const StatCard = ({ icon: Icon, label, value, color = "purple" }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600 mb-1 truncate">{label}</p>
        <p className="text-lg md:text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-2 bg-purple-100 rounded-lg flex-shrink-0`}>
        <Icon className={`text-purple-600`} size={20} />
      </div>
    </div>
  </div>
);

// --- I.2. DashboardItemCard (Edit + Delete) ---
const DashboardItemCard = ({ product, onLike, isLiked, onEdit, onDelete }) => (
  <div className="relative ">
    <ItemCard
      key={product.id}
      item={product}
      onLike={onLike}
      isLiked={isLiked}
    />

    <button
      onClick={() => onEdit(product)}
      className="absolute top-3 right-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all z-10"
      title="E'lonni tahrirlash"
    >
      <Edit size={18} />
    </button>

    <button
      onClick={() => onDelete(product)}
      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-all z-10"
      title="E'lonni o'chirish"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

// --- I.3. DeleteConfirmationModal (Taymerli tasdiqlash) ---
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  productId,
}) => {
  const [countdown, setCountdown] = useState(5);
  // Taymer faoliyatini nazorat qilish
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsActive(false);
      return;
    }

    setIsActive(true);
    let timer;

    // Taymerni boshlash
    timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Agar taymer tugaganda hali ham faol bo'lsa (Bekor qilish bosilmagan bo'lsa) o'chirish
          if (isActive) {
            onConfirm(productId);
          }
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Komponent o'chirilganda yoki modal yopilganda taymerni to'xtatish
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-start mb-4">
          <Trash2 className="text-red-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800 flex-1">
            E'lonni o'chirish
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Siz rostdan ham **"{productTitle}"** e'lonini o'chirmoqchimisiz?
          <br />
          <span className="font-semibold text-red-500">
            {countdown} soniya ichida avtomatik ravishda o'chiriladi.
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleConfirmNow}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            // Taymer 0 bo'lsa tugmani o'chirib qo'yish shart emas, chunki u 0 bo'lishidan oldin o'chiriladi
          >
            Ha, o'chirilsin
          </button>
        </div>
      </div>
    </div>
  );
};

// --- I.4. SuccessModal (Chiroyli muvaffaqiyat bildirishnomasi) ---
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

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
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};

// --- I.5. LoaderOverlay (Butun sahifani qoplaydigan yuklanish animatsiyasi) ---
const LoaderOverlay = ({ isLoading, text = "Amal bajarilmoqda..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
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

// --- Boshqa yordamchi vizual komponentlar (Skeloton, Profil) ---
const LoadingSkeleton = ({ viewMode }) => (
  <div
    className={`grid ${
      viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
    } gap-4`}
  >
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
        <div className="h-32 md:h-40 bg-gray-200 rounded-t-xl" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
);

const ProfileInfo = ({ isMobile = false, onClose }) => (
  <div
    className={`flex items-center gap-4 ${
      isMobile ? "justify-between" : "mb-6 pb-6 border-b border-gray-100"
    }`}
  >
    <div
      className={`w-${isMobile ? "12" : "16"} h-${
        isMobile ? "12" : "16"
      } bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-${
        isMobile ? "lg" : "2xl"
      } font-bold shadow-md`}
    >
      B
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-800 truncate">Baxtliyorqurvon</h3>
      <p className="text-sm text-gray-500">+998 99 258-48-80</p>
    </div>
    {isMobile && (
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
      >
        <X size={24} />
      </button>
    )}
  </div>
);

// =========================================================================
// II. ASOSIY KOMPONENT (UserDashboard)
// =========================================================================

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);

  // Tahrirlash modali holatlari
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // O'chirish modali holatlari
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Muvaffaqiyat modali holati
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(stored);
  }, []);

  const tabs = [
    { id: "active", label: "Faol", icon: Package, filter: "elonlar" },
    { id: "pending", label: "Kutilmoqda", icon: Clock, filter: "kutilmoqda" },
    {
      id: "saved",
      label: "yoqtirilganlar",
      icon: Heart,
      filter: "saqlanganlar",
    },
  ];
  // syncLikesFromLocal
  const sidebarLinks = [
    { icon: Package, label: "E'lonlarim", href: "#", badge: null },

    { icon: MessageCircle, label: "Xabarlar", href: "/chat", badge: 3 },
    { icon: TrendingUp, label: "Statistika", href: "#", badge: null },
    { icon: Settings, label: "Sozlamalar", href: "#", badge: null },
  ];

  useEffect(() => {
    const likedFlag = JSON.parse(localStorage.getItem("liked"));
    if (likedFlag === "liked") {
      const savedTab = tabs.find((t) => t.filter === "saqlanganlar");
      if (savedTab) {
        setActiveTab(savedTab.id);
        localStorage.removeItem("liked");
      }
    }
  }, []);

  const fetchData = async () => {
    const likedFlag = JSON.parse(localStorage.getItem("liked"));

    const currentFilter =
      likedFlag === "liked"
        ? "saqlanganlar"
        : tabs.find((t) => t.id === activeTab)?.filter || "elonlar";

    const response = await api.get(
      `/profiles/me/dashboard?filter=${currentFilter}`
    );

    if (likedFlag === "liked") {
      localStorage.removeItem("liked");
    }

    console.log(likedFlag);

    return response.data;
  };

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard", activeTab],
    queryFn: fetchData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId) => {
      await api.delete(`/products/by-id/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboard", activeTab]);
      setSuccessMessage("E'lon muvaffaqiyatli o'chirildi.");
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      console.error("O'chirishda xato:", error);
      alert("O'chirishda xato yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    },
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

  // --- Sidebar Content (Asosiy funksiyaga joylashtirish uchun) ---
  const SidebarContent = ({ isMobile = false, onClose }) => (
    <nav className="space-y-1">
      {isMobile && <ProfileInfo isMobile={isMobile} onClose={onClose} />}
      {sidebarLinks.map((link) => (
        <Link
          key={link.label}
          to={link.href}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all group ${
            isMobile ? "text-sm" : "text-base"
          }`}
        >
          <div className="flex items-center gap-3">
            <link.icon
              size={20}
              className="group-hover:scale-110 transition-transform"
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

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-10">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <ProfileInfo />
            <SidebarContent />

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 my-6">
              <h4 className="text-sm font-semibold text-purple-800 mb-3">
                Bu oyda
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">Ko'rishlar</span>
                  <span className="font-bold text-purple-800">
                    {stats.views || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">E'lonlar</span>
                  <span className="font-bold text-purple-800">
                    {products.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-white p-6 shadow-xl lg:hidden transition-transform duration-300 ease-in-out">
            <SidebarContent
              isMobile={true}
              onClose={() => setShowMobileMenu(false)}
            />
          </div>
        )}

        <main className="flex-1 min-w-0">
          <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                  B
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    Baxtliyorqurvon
                  </h3>
                  <p className="text-xs text-gray-500">+998 99 258-48-80</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <StatCard
              icon={Package}
              label="Jami e'lonlar"
              value={products.length}
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
              value={3}
              color="purple"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-1">
            <div className="flex flex-row items-start justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Mening e'lonlarim
              </h2>
              <Link
                to="/add-item"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all active:scale-[0.98] text-sm font-medium"
              >
                <Plus size={16} />
                <span>E'lon qo'shish</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                    // padding va radius ixchamlashtirildi
                    activeTab === tab.id
                      ? "bg-purple-100 text-purple-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {isDashboardLoading ? (
              <LoadingSkeleton viewMode={viewMode} />
            ) : products.length > 0 ? (
              <div
                className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4`} // O'zgarishsiz qoldirildi (chunki ma'qul)
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
              // NO DATA HOLATI IXCHAMLASHTIRILDI
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package size={30} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  E'lonlaringiz yo'q
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Bu yerda sizning e'lonlaringiz ko'rinadi
                </p>
                <Link
                  to="/add-item"
                  className="inline-flex rounded-xl items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white g hover:from-purple-600 hover:to-purple-700 transition-all  active:scale-[0.98] font-medium text-sm" // padding, radius va shrift ixchamlashtirildi
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
