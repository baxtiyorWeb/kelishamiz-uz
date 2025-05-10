"use client";

import { get } from "lodash";
import {
  Heart,
  MapPin,
  Menu,
  Search,
  User,
  ShoppingBag,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGetUser from "../../hooks/services/useGetUser";
import useAuthStore from "../../store";
import HeaderCatalog from "./HeaderCatalog";
import Container from "./Container";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      className="flex items-center w-full rounded-full overflow-hidden border-2 border-teal-500 focus-within:ring-2 focus-within:ring-teal-300 transition-all shadow-sm"
    >
      <input
        type="text"
        placeholder="Qidiruv"
        className="h-10 flex-1 max-w-lg bg-white pl-4 text-gray-600 text-sm outline-none"
      />
      <button
        type="submit"
        className="flex h-10 w-12 items-center justify-center bg-teal-500 text-white hover:bg-teal-600 transition-colors"
      >
        <Search size={18} />
      </button>
    </form>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md"
          : "bg-gradient-to-r from-teal-50 via-white to-teal-50"
      }`}
    >
      <Container>
        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between py-4 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-teal-600 hover:text-teal-700 transition-colors p-1 rounded-full hover:bg-teal-50"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center">
            <img
              src="https://kelishamiz.vercel.app/assets/logo-BMjhHkCS.png"
              alt="Logo"
              className="h-10 object-contain"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/profile/dashboard/favourites"
              className="text-teal-600 hover:text-teal-700 p-1 rounded-full hover:bg-teal-50"
            >
              <Heart size={20} />
            </Link>
            <Link
              to={isAuthenticated ? `/user/${get(user, "id")}` : "/auth/login"}
              className="text-teal-600 hover:text-teal-700 p-1 rounded-full hover:bg-teal-50"
            >
              <User size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white py-4 px-4 space-y-4 border-t border-gray-100 rounded-b-2xl shadow-lg">
            <SearchForm />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsOpen(!isOpen);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 p-3 text-white shadow-sm hover:from-teal-600 hover:to-teal-700"
              >
                <Menu size={18} />
                <span className="text-sm font-medium">Katalog</span>
              </button>

              <button className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-teal-50 to-teal-100 p-3 text-teal-700 shadow-sm hover:from-teal-100 hover:to-teal-200">
                <MapPin size={18} />
                <span className="text-sm font-medium">Joylashuv</span>
              </button>
            </div>

            <Link
              to="/add-item"
              className="flex text-sm h-9 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-2 text-white shadow-md hover:from-teal-700 hover:to-teal-800"
            >
              <ShoppingBag size={18} className="mr-1" />
              <span className="text-sm font-medium">E'lon qo'shish</span>
            </Link>

            <div className="flex justify-between pt-3 border-t border-gray-100">
              <select className="bg-transparent text-sm text-gray-600 outline-none p-2 rounded-md hover:bg-teal-50">
                <option value="uz">UZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>
          </div>
        )}

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

          <div className="flex items-center space-x-4">
            <Link
              to={!isAuthenticated ? "/auth/login" : "/add-item"}
              className="flex text-sm items-center space-x-2 px-2  py-2 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            >
              <ShoppingBag size={18} className="mr-1" />
              <span className="text-sm font-medium">
                E&apos;lon qo&apos;shish
              </span>
            </Link>

            <Link
              to="/profile/dashboard/favourites"
              className="group flex  space-x-1 items-center"
            >
              <div className="p-2  rounded-full bg-teal-50 group-hover:bg-teal-100">
                <Heart
                  className="text-teal-600 group-hover:text-teal-700"
                  size={20}
                />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-teal-600 mt-1">
                Sevimlilar
              </span>
            </Link>

            <Link
              to={isAuthenticated ? `/user/${get(user, "id")}` : "/auth/login"}
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

            <select className="bg-transparent text-sm text-gray-600 outline-none p-2 rounded-md hover:bg-teal-50">
              <option value="uz">UZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </div>
        </div>
      </Container>

      {isOpen && <HeaderCatalog setisOpen={setIsOpen} isOpen={isOpen} />}
    </header>
  );
};

export default Header;
