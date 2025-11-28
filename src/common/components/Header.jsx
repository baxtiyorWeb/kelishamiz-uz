"use client";

import { get } from "lodash";
import {
  Heart,
  MapPin,
  Menu,
  Search as SearchIcon,
  User,
  ShoppingBag,
  Home as HomeIcon,
  ChevronDown,
  PlusCircleIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGetUser from "../../hooks/services/useGetUser";
import useAuthStore from "../../store";
import HeaderCatalog from "./HeaderCatalog";
import Container from "./Container";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const SearchForm = ({ isMobile = false }) => (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`flex items-center w-full rounded-full overflow-hidden border border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all ${
        isMobile ? "shadow-sm" : "shadow-sm"
      }`}
    >
      <input
        type="text"
        placeholder={isMobile ? "Qidirish..." : "Mahsulotlar va turkumlar izlash"}
        className={`${
          isMobile ? "h-9 text-xs" : "h-10 text-sm"
        } flex-1 bg-white pl-3 md:pl-4 pr-2 text-gray-600 outline-none`}
      />
      <button
        type="submit"
        className={`flex ${
          isMobile ? "h-9 w-10" : "h-10 w-12"
        } items-center justify-center text-gray-400 hover:text-purple-500 transition-colors`}
      >
        <SearchIcon size={isMobile ? 16 : 18} />
      </button>
    </form>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md"
            : "bg-gradient-to-r from-purple-50 via-white to-purple-50"
        }`}
      >
        <Container>
          {/* Mobile Header */}
          <div className="lg:hidden">
            {/* Top Row: Logo + Download Button */}
            <div className="flex items-center justify-between py-2.5 px-3">
              <Link to="/" className="flex items-center">
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
              <button className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 active:scale-95 transition-transform">
                <MapPin size={14} className="shrink-0" />
                <span className="text-xs font-medium">Toshkent</span>
                <ChevronDown size={12} />
              </button>
              <span className="text-[10px] text-gray-500">yetkazib berish</span>
            </div>

            {/* Search Bar + Quick Actions */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white">
              <div className="flex-1 min-w-0">
                <SearchForm isMobile={true} />
              </div>
              <Link
                to="/cart"
                className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 active:scale-95 transition-all shrink-0"
              >
                <ShoppingBag size={18} className="text-purple-600" />
              </Link>
              <Link
                to="/profile/dashboard/favourites"
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 active:scale-95 transition-all shrink-0"
              >
                <Heart size={18} className="text-red-500" />
              </Link>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between py-2 px-2">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <img
                  src="https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"
                  alt="Logo"
                  className="h-9 w-[120px] object-cover"
                />
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm"
              >
                <Menu size={18} />
                <span className="font-medium">Katalog</span>
                <ChevronDown
                  size={16}
                  className={`${isOpen ? "rotate-180" : ""} transition-transform duration-300`}
                />
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all">
                <MapPin size={18} />
                <span className="font-medium">Joylashuv</span>
              </button>
            </div>

            <div className="w-full max-w-md mx-4">
              <SearchForm />
            </div>

            <div className="flex items-center gap-3">
              {/* Add Item Button */}
              <Link
                to={!isAuthenticated ? "/auth/login" : "/add-item"}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm whitespace-nowrap"
              >
                <PlusCircleIcon size={18} className="shrink-0" />
                <span className="text-sm font-medium">E'lon qo'shish</span>
              </Link>

              {/* Favourites */}
              <Link
                to="/profile/dashboard/favourites"
                className="group flex flex-col items-center min-w-[70px]"
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
              </Link>

              {/* User/Kabinet */}
              <Link
                to={isAuthenticated ? `/user` : "/auth/login"}
                className="group flex flex-col items-center min-w-[70px]"
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

              <select className="bg-transparent text-sm text-gray-600 outline-none px-2 py-1 rounded-md hover:bg-purple-50 cursor-pointer transition-colors">
                <option value="uz">UZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>
          </div>
        </Container>

        {isOpen && <HeaderCatalog setisOpen={setIsOpen} isOpen={isOpen} />}
      </header>
    </>
  );
};

export default Header;