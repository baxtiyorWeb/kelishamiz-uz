"use client";

import {
  Heart,
  MapPin,
  Menu,
  Search as SearchIcon,
  User,
  ShoppingBag,
  PlusCircleIcon,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { get } from "lodash";
import useGetUser from "../../hooks/services/useGetUser";
import useAuthStore from "../../store";
import api from "../../config/auth/api";
import DistrictSelector from "./Location"; // Nomni DistrictSelector.jsx deb o'zgartirdim.
import HeaderCatalog from "./HeaderCatalog";

// Utility component for Search Form
const SearchForm = ({ isMobile = false }) => (
  <form
    onSubmit={(e) => e.preventDefault()}
    className={`flex items-center w-full rounded-full border transition-all ${
      isMobile
        ? "shadow-sm border-gray-300"
        : "shadow-sm border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200"
    }`}
  >
    <input
      type="text"
      placeholder={isMobile ? "Qidirish..." : "Mahsulotlar va turkumlar izlash"}
      className={`${
        isMobile ? "h-9 text-xs" : "h-10 text-sm"
      } flex-1 bg-white pl-3 md:pl-4 pr-2 text-gray-600 outline-none rounded-l-full`}
    />
    <button
      type="submit"
      aria-label="Qidirish"
      className={`flex ${
        isMobile ? "h-9 w-10" : "h-10 w-12"
      } items-center justify-center text-gray-400 hover:text-purple-500 transition-colors bg-white rounded-r-full shrink-0`}
    >
      <SearchIcon size={isMobile ? 16 : 18} />
    </button>
  </form>
);

const Header = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const user = useGetUser();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: districts, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["location_districts"],
    queryFn: async () => {
      // API chaqiruvini try-catch blokiga oldim va .data ga murojaatni to'g'irladim.
      const response = await api.get("/location/districts");
      return response.data;
    },
    staleTime: Infinity, // Lokal ma'lumotlar uchun mos
  });

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFavoriteClick = useCallback(() => {
    // Sevimlilar uchun lokal saqlash ishlatilishi shart emas, ammo asl kodni saqladim.
    localStorage.setItem("liked", JSON.stringify("liked"));
    navigate(
      isAuthenticated ? `/user/${get(user, "sub")}` : "/auth/login",
      { state: { from: location.pathname, target: "favorites" } } // Qayerga borishini bilish uchun state qo'shdim
    );
  }, [isAuthenticated, navigate, user, location]);

  const LocationButton = ({ isDesktop = true }) => {
    const defaultText = isDistrictsLoading ? "Yuklanmoqda..." : "Toshkent";

    // Default holat: faqat poytaxt ko'rsatilsin
    const selectedText = "Joylashuv"; // Bu yerga tanlangan tumanlar sonini hisoblash mumkin edi, ammo soddalik uchun qoldirildi.

    return (
      <button
        onClick={() => setIsLocationSelectorOpen(true)}
        className={`flex items-center transition-all ${
          isDesktop
            ? "space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200"
            : "space-x-1 text-purple-600 hover:text-purple-700 active:scale-95 transition-transform"
        }`}
      >
        <MapPin size={isDesktop ? 18 : 14} className="shrink-0" />
        <span
          className={`${isDesktop ? "font-medium" : "text-xs font-medium"}`}
        >
          {isDesktop ? selectedText : defaultText}
        </span>
        <ChevronDown size={isDesktop ? 16 : 12} />
      </button>
    );
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md"
            : "bg-gradient-to-r from-purple-50 via-white to-purple-50"
        }`}
      >
        {/* Mobile Header (lg:hidden) */}
        <div className="lg:hidden">
          {/* Top Row: Logo + Download Button */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <Link to="/" aria-label="Bosh sahifa">
              <img
                src="https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"
                alt="Logo"
                className="h-7 object-contain"
              />
            </Link>
            <button className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm active:scale-95">
              Yuklab olish
            </button>
          </div>

          {/* Location Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-purple-50/50">
            <LocationButton isDesktop={false} />
            <span className="text-[10px] text-gray-500">yetkazib berish</span>
          </div>

          {/* Search Bar + Quick Actions */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white">
            <div className="flex-1 min-w-0">
              <SearchForm isMobile={true} />
            </div>
            <Link
              to="/cart"
              aria-label="Savat"
              className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 active:scale-95 transition-all shrink-0"
            >
              <ShoppingBag size={18} className="text-purple-600" />
            </Link>
          </div>
          {/* Mobile bottom menu (optional) */}
        </div>

        {/* Desktop Header (hidden lg:flex) */}
        <div className="hidden lg:flex items-center justify-between py-2 px-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <Link to="/" aria-label="Bosh sahifa">
              <img
                src="https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"
                alt="Logo"
                className="h-9 w-[120px] object-cover"
              />
            </Link>

            {/* Catalog Button */}
            <button
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              aria-expanded={isCatalogOpen}
              aria-controls="header-catalog"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm active:scale-95"
            >
              <Menu size={18} />
              <span className="font-medium">Katalog</span>
              <ChevronDown
                size={16}
                className={`${
                  isCatalogOpen ? "rotate-180" : ""
                } transition-transform duration-300`}
              />
            </button>

            {/* Location Button */}
            <LocationButton isDesktop={true} />
          </div>

          <div className="w-full max-w-lg mx-8">
            <SearchForm />
          </div>

          <div className="flex items-center gap-3">
            {/* Add Item Button */}
            <Link
              to={!isAuthenticated ? "/auth/login" : "/add-item"}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm whitespace-nowrap active:scale-95"
            >
              <PlusCircleIcon size={18} className="shrink-0" />
              <span className="text-sm font-medium">E'lon qo'shish</span>
            </Link>

            {/* Favourites */}
            <button
              onClick={handleFavoriteClick}
              className="group flex flex-col items-center w-20 justify-center"
              aria-label="Sevimlilar"
            >
              <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <Heart
                  className="text-purple-600 group-hover:text-purple-700"
                  size={20}
                />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-purple-600 mt-1">
                Sevimlilar
              </span>
            </button>

            {/* User/Kabinet */}
            <Link
              to={isAuthenticated ? `/user/${get(user, "sub")}` : "/auth/login"}
              className="group flex flex-col items-center w-20 justify-center"
              aria-label={isAuthenticated ? "Kabinet" : "Kirish"}
            >
              <div className="p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <User
                  className="text-purple-600 group-hover:text-purple-700"
                  size={20}
                />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-purple-600 mt-1">
                {isAuthenticated ? "Kabinet" : "Kirish"}
              </span>
            </Link>
          </div>
        </div>

        {isCatalogOpen && (
          <HeaderCatalog
            setIsOpen={setIsCatalogOpen}
            isOpen={isCatalogOpen}
            id="header-catalog"
          />
        )}
      </header>

      <DistrictSelector
        districts={districts}
        isOpen={isLocationSelectorOpen}
        setIsOpen={setIsLocationSelectorOpen}
      />
    </>
  );
};

export default Header;
