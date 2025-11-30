"use client";

import { useState, useEffect, useMemo } from "react";
import api from "../../../config/auth/api";
import { useQuery, useQueryClient } from "react-query"; // useQueryClient qo'shildi
import { Link } from "react-router-dom";
import {
  User,
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
  Save, // Modal uchun
  Edit, // Modal uchun
  Trash2, // Qo'shimcha ikonka
} from "lucide-react";
import ItemCard from "./../../../common/components/ItemCard"; // Sizning ItemCard komponentangiz
import Container from "../../../common/components/Container"; // Sizning Container komponentangiz
import ProductUpdateModal from "./ProductUpdateModal";

// =========================================================================
// 1. Yordamchi Komponentalar
// =========================================================================

const StatCard = ({ icon: Icon, label, value, color = "purple" }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600 mb-1 truncate">{label}</p>
        <p className="text-lg md:text-2xl font-bold text-gray-800">{value}</p>
      </div>
      {/* Tailwind CSS da dinamik ranglar ishlatish uchun `safelist` kerak, bu yerda o'zgaruvchan uslublar soddalashtirildi */}
      <div className={`p-2 bg-purple-100 rounded-lg flex-shrink-0`}>
        <Icon className={`text-purple-600`} size={20} />
      </div>
    </div>
  </div>
);

// Tahrirlash tugmasini qo'shish uchun ItemCard Wrapper
const DashboardItemCard = ({
  product,
  onLike,
  isLiked,
  onEdit,
  handleProductId,
}) => (
  <div className="relative">
    <ItemCard
      key={product.id}
      item={product}
      onLike={onLike}
      isLiked={isLiked}
    />
    <button
      onClick={() => onEdit(product)}
      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all z-10"
      title="E'lonni tahrirlash"
    >
      <Edit size={18} />
    </button>
  </div>
);

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);
  const [productId, setProductId] = useState();

  // Modal holati
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const queryClient = useQueryClient(); // useQueryClient

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(stored);
  }, []);

  const tabs = [
    { id: "active", label: "Faol", icon: Package, filter: "elonlar" },
    { id: "draft", label: "Qoralama", icon: FileText, filter: "qoralamalar" },
    { id: "pending", label: "Kutilmoqda", icon: Clock, filter: "kutilmoqda" },
    { id: "archive", label: "Arxiv", icon: Archive, filter: "arxiv" },
  ];

  const sidebarLinks = [
    { icon: Package, label: "E'lonlarim", href: "#", badge: null },
    {
      icon: Heart,
      label: "Sevimlilar",
      href: "/profile/dashboard/favourites",
      badge: null,
    },
    { icon: MessageCircle, label: "Xabarlar", href: "/chat", badge: 3 },
    { icon: TrendingUp, label: "Statistika", href: "#", badge: null },
    { icon: Settings, label: "Sozlamalar", href: "#", badge: null },
  ];

  const fetchData = async () => {
    const currentFilter =
      tabs.find((t) => t.id === activeTab)?.filter || "elonlar";
    const response = await api.get(
      `/profiles/me/dashboard?filter=${currentFilter}`
    );
    return response.data;
  };

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", activeTab],
    queryFn: fetchData,
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

  const handleEdit = (product) => {
    setProductToEdit(product);
    setProductId(product.id);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (id, data) => {
    try {
      await api.patch(`/products/${id}`, data);
      await queryClient.invalidateQueries(["dashboard", activeTab]);
    } catch (error) {
      console.error("Mahsulotni yangilashda xato:", error);
      throw error;
    }
  };

  const isProductLiked = (productId) => {
    return likedProducts.includes(productId);
  };

  const products = dashboardData?.content?.products || [];
  const stats = dashboardData?.content?.stats || {};

  const LoadingSkeleton = () => (
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
        <h3 className="font-semibold text-gray-800 truncate">
          Baxtliyorqurvon
        </h3>
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

  const handleProductId = (productId) => {
    setProductId(productId);
  };

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Mening e'lonlarim
              </h2>
              <Link
                to="/add-item"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
              >
                <Plus size={18} />
                <span>E'lon qo'shish</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                    activeTab === tab.id
                      ? "bg-purple-100 text-purple-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="E'lonlarda qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end sm:justify-start">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === "grid"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === "list"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : products.length > 0 ? (
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                } gap-3 md:gap-4`}
              >
                {products.map((product) => (
                  <DashboardItemCard
                    key={product.id}
                    product={product}
                    onLike={handleLike}
                    isLiked={isProductLiked(product.id)}
                    onEdit={handleEdit} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 md:py-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={40} className="text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                  E'lonlaringiz yo'q
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Bu yerda sizning e'lonlaringiz ko'rinadi
                </p>
                <Link
                  to="/add-item"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm active:scale-95 font-medium"
                >
                  <Plus size={20} />
                  <span>E'lon qo'shish</span>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <ProductUpdateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productData={productToEdit}
        productId={productId}
        onSave={handleUpdateProduct}
      />
    </Container>
  );
};

export default UserDashboard;
