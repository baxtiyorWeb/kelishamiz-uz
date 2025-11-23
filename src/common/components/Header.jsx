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
  const user = useGetUser();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const SearchForm = () => (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center w-full rounded-full overflow-hidden border border-gray-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-300 transition-all shadow-sm"
    >
      <input
        type="text"
        placeholder="Mahsulotlar va turkumlar izlash"
        className="h-10 flex-1 bg-white pl-4 pr-2 text-gray-600 text-sm outline-none"
      />
      <button
        type="submit"
        className="flex h-10 w-12 items-center justify-center text-gray-400 hover:text-teal-500 transition-colors mr-1"
      >
        <SearchIcon size={18} />
      </button>
    </form>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full  transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md "
            : "bg-gradient-to-r from-teal-50 via-white to-teal-50"
        }`}
      >
        <Container>
          {/* Mobile-specific top sections */}
          <div className="lg:hidden space-y-2 py-2 px-4">
            {/* Top: Logo left, Yuklab olish right */}
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <img
                  src="https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"
                  alt="Logo"
                  className="h-8 object-contain"
                />
              </Link>
              <button className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors">
                Yuklab olish
              </button>
            </div>

            {/* Location bar */}
            <div className="flex items-center justify-between text-sm">
              <button className="flex items-center space-x-1 text-teal-600 hover:text-teal-700">
                <MapPin size={16} />
                <span>Toshkent</span>
                <ChevronDown size={14} />
              </button>
              <span className="text-gray-500">yetkazib beriladigan shahar</span>
            </div>

            {/* Search bar with cart and heart */}
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <SearchForm />
              </div>
              <Link
                to="/cart"
                className="p-2 rounded-full bg-white border border-gray-300 hover:bg-teal-50"
              >
                <ShoppingBag size={20} className="text-gray-500 hover:text-teal-500" />
              </Link>
              <Link
                to="/profile/dashboard/favourites"
                className="p-2 rounded-full bg-white border border-gray-300 hover:bg-teal-50"
              >
                <Heart size={20} className="text-gray-500 hover:text-red-500" />
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
                className="flex items-center space-x-2 p-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              >
                <Menu size={18} />
                <span className="font-medium">Katalog</span>
                <ChevronDown
                  size={16}
                  className={`${isOpen ? "rotate-180" : ""} transition-transform`}
                />
              </button>

              <button className="flex items-center space-x-2 p-2 rounded-xl bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 hover:from-teal-100 hover:to-teal-200">
                <MapPin size={18} />
                <span className="font-medium">Joylashuv</span>
              </button>
            </div>

            <div className="w-full max-w-md mx-2">
              <SearchForm />
            </div>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 ">
              {/* Add Item Button */}
              <Link
                to={!isAuthenticated ? "/auth/login" : "/add-item"}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 whitespace-nowrap"
              >
                <ShoppingBag size={18} className="shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base  font-medium truncate">
                  E&apos;lon qo&apos;shish
                </span>
              </Link>

              {/* Favourites */}
              <Link
                to="/profile/dashboard/favourites"
                className="group flex space-x-1 items-center"
              >
                <div className="p-2 rounded-full bg-teal-50 group-hover:bg-teal-100">
                  <Heart
                    className="text-teal-600 group-hover:text-teal-700"
                    size={20}
                  />
                </div>
                <span className="text-xs  text-gray-600 group-hover:text-teal-600 mt-1">
                  Sevimlilar
                </span>
              </Link>

              {/* User/Kabinet */}
              <Link
                to={isAuthenticated ? `/user` : "/auth/login"}
                className="group flex space-x-1 items-center"
              >
                <div className="p-2 rounded-full bg-teal-50 group-hover:bg-teal-100">
                  <User
                    className="text-teal-600 group-hover:text-teal-700"
                    size={20}
                  />
                </div>
                <span className="text-xs text-gray-600 group-hover:text-teal-600 mt-1">
                  {isAuthenticated ? "Kabinet" : "Login"}
                </span>
              </Link>

              {/* Language Selector */}
              <select className="bg-transparent text-sm text-gray-600 outline-none  rounded-md hover:bg-teal-50">
                <option value="uz">UZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>
          </div>
        </Container>

        {isOpen && <HeaderCatalog setisOpen={setIsOpen} isOpen={isOpen} />}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-14 px-2">
          <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-teal-600 p-1">
            <HomeIcon size={20} />
            <span className="text-xs mt-1">Asosiy</span>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center text-gray-600 hover:text-teal-600 p-1"
          >
            <Menu size={20} />
            <span className="text-xs mt-1">Katalog</span>
          </button>

          <Link
            to={!isAuthenticated ? "/auth/login" : "/add-item"}
            className="flex flex-col items-center text-gray-600 hover:text-teal-600 p-1"
          >
            <PlusCircleIcon size={20} />
            <span className="text-xs mt-1">qo&apos;shish</span>
          </Link>

          <Link
            to="/profile/dashboard/favourites"
            className="flex flex-col items-center text-gray-600 hover:text-teal-600 p-1"
          >
            <Heart size={20} />
            <span className="text-xs mt-1">Sevimlilar</span>
          </Link>

          <Link
            to={isAuthenticated ? `/user/${get(user, "id")}` : "/auth/login"}
            className="flex flex-col items-center text-gray-600 hover:text-teal-600 p-1"
          >
            <User size={20} />
            <span className="text-xs mt-1">Kabinet</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;