"use client";

import { useState, useEffect } from "react";
import api from "../../../config/auth/api";
import { useQuery } from "react-query";
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
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const ProductCard = ({ item, onLike, isLiked }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group border border-gray-100">
    <div className="relative pt-[75%]">
      <img
        src={item.imageUrl || "https://via.placeholder.com/400x300"}
        alt={item.title}
        className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <button
        onClick={() => onLike(item.id)}
        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white active:scale-95 transition-all shadow-md"
      >
        <Heart
          size={18}
          className={isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}
        />
      </button>
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
        {item.status || "Faol"}
      </div>
    </div>
    <div className="p-3 md:p-4">
      <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate mb-1">
        {item.title}
      </h3>
      <p className="text-gray-500 text-xs md:text-sm line-clamp-2 mb-2">
        {item.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-base md:text-lg font-bold text-teal-600">
          {item.price?.toLocaleString()} UZS
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Eye size={14} />
          <span>{item.views || 0}</span>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = "teal" }) => (
  <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs md:text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-xl`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
  </div>
);

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);

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
    { icon: Heart, label: "Sevimlilar", href: "/profile/dashboard/favourites", badge: null },
    { icon: MessageCircle, label: "Xabarlar", href: "/chat", badge: 3 },
    { icon: TrendingUp, label: "Statistika", href: "#", badge: null },
    { icon: Settings, label: "Sozlamalar", href: "#", badge: null },
  ];

  const fetchData = async () => {
    const currentFilter = tabs.find(t => t.id === activeTab)?.filter || "elonlar";
    const response = await api.get(`/profiles/me/dashboard?filter=${currentFilter}`);
    return response.data;
  };

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", activeTab],
    queryFn: fetchData,
  });

  const handleLike = async (productId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const currentLikes = JSON.parse(localStorage.getItem("likedProducts") || "[]");
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

  const isProductLiked = (productId) => {
    return likedProducts.includes(productId);
  };

  const products = dashboardData?.content?.products || [];
  const stats = dashboardData?.content?.stats || {};

  const LoadingSkeleton = () => (
    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
          <div className="h-40 md:h-48 bg-gray-200 rounded-t-xl" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              {/* User Profile */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">Baxtliyorqurvon</h3>
                  <p className="text-sm text-gray-500">+998 99 258-48-80</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1 mb-6">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon size={20} className="group-hover:scale-110 transition-transform" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Stats Preview */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-semibold text-teal-800 mb-3">Bu oyda</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-teal-700">Ko'rishlar</span>
                    <span className="font-bold text-teal-800">{stats.views || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-teal-700">E'lonlar</span>
                    <span className="font-bold text-teal-800">{products.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all">
                <LogOut size={20} />
                <span>Chiqish</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                    B
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Baxtliyorqurvon</h3>
                    <p className="text-xs text-gray-500">+998 99 258-48-80</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Settings size={20} />
                </button>
              </div>

              {showMobileMenu && (
                <nav className="space-y-1 pt-4 border-t border-gray-100">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg font-medium text-sm text-gray-700 hover:bg-teal-50"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon size={18} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <StatCard icon={Package} label="Jami e'lonlar" value={products.length} color="teal" />
              <StatCard icon={Eye} label="Ko'rishlar" value={stats.views || 0} color="blue" />
              <StatCard icon={Heart} label="Sevimlilar" value={stats.likes || 0} color="red" />
              <StatCard icon={MessageCircle} label="Xabarlar" value={3} color="purple" />
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Mening e'lonlarim</h2>
                <Link
                  to="/add-item"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
                >
                  <Plus size={18} />
                  <span>E'lon qo'shish</span>
                </Link>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                      activeTab === tab.id
                        ? "bg-teal-100 text-teal-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* View Toggle & Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="E'lonlarda qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === "grid"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === "list"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {/* Products Grid/List */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : products.length > 0 ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-3 md:gap-4`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      item={product}
                      onLike={handleLike}
                      isLiked={isProductLiked(product.id)}
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm active:scale-95 font-medium"
                  >
                    <Plus size={20} />
                    <span>E'lon qo'shish</span>
                  </Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;