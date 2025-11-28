/* eslint-disable react/prop-types */
"use client";

import { get, head, isArray, isEqual, isNil } from "lodash";
import { useEffect, useState } from "react";
import KEYS from "../../export/keys.js";
import URLS from "../../export/urls.js";
import usePaginateQuery from "../../hooks/api/usePaginateQuery.js";
import {
  ChevronRight,
  X,
  Search,
  Grid,
  Tag,
  Layers,
  Package,
  Car,
  Smartphone,
  Home,
  ShoppingCart,
  ChevronLeft,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils.jsx";
import { Link } from "react-router-dom";

const HeaderCatalog = ({ isOpen, setisOpen }) => {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSubcategories, setShowSubcategories] = useState(false);

  const { data: parentList, isLoading } = usePaginateQuery({
    key: KEYS.categories,
    url: URLS.categories,
    enabled: !!isOpen,
  });

  const parents = isArray(get(parentList, "data.content", []))
    ? get(parentList, "data.content", [])
    : [];

  const filteredParents = searchTerm
    ? parents.filter((item) =>
        get(item, "name", "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : parents;

  useEffect(() => {
    if (isNil(selected) && filteredParents.length > 0) {
      setSelected(head(filteredParents));
    }
  }, [filteredParents, selected]);

  const childCategories = get(selected, "children", []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCategoryIcon = (category, index) => {
    const name = get(category, "name", "").toLowerCase();

    if (name.includes("auto") || name.includes("avtomobil") || name.includes("car")) {
      return <Car size={20} />;
    } else if (name.includes("electron") || name.includes("phone") || name.includes("smart")) {
      return <Smartphone size={20} />;
    } else if (name.includes("home") || name.includes("house") || name.includes("uy")) {
      return <Home size={20} />;
    } else if (name.includes("shop") || name.includes("market")) {
      return <ShoppingCart size={20} />;
    }

    const icons = [
      <Package key="package" size={20} />,
      <Tag key="tag" size={20} />,
      <Layers key="layers" size={20} />,
      <Grid key="grid" size={20} />,
    ];
    return icons[index % icons.length];
  };

  const handleCategoryClick = (item) => {
    if (isMobile) {
      setSelected(item);
      setShowSubcategories(true);
    } else {
      setSelected(item);
    }
  };

  const handleBackToMain = () => {
    setShowSubcategories(false);
  };

  const handleClose = () => {
    setisOpen(false);
    setShowSubcategories(false);
  };

  return isOpen ? (
    <div
      className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="absolute inset-0 md:relative md:inset-auto md:mx-auto md:my-6 md:max-w-7xl md:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              {showSubcategories ? (
                <>
                  <button
                    onClick={handleBackToMain}
                    className="flex items-center text-white active:scale-95 transition-transform"
                  >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                    <span className="ml-2 font-semibold">Orqaga</span>
                  </button>
                  <h2 className="text-white font-bold text-base truncate mx-4 flex-1 text-center">
                    {get(selected, "name")}
                  </h2>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles size={22} className="text-purple-200" />
                  <h2 className="text-white font-bold text-xl">Kategoriyalar</h2>
                </div>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/20 text-white active:scale-95 transition-all"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Grid size={24} className="text-white" />
                </div>
                <h2 className="text-white font-bold text-2xl">Barcha kategoriyalar</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/20 text-white active:scale-95 transition-all"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[75vh]">
          {/* Main Categories - Left Side */}
          <div
            className={cn(
              "w-full md:w-[340px] bg-gradient-to-b from-purple-50 to-white overflow-y-auto border-r border-purple-100",
              isMobile && showSubcategories && "hidden"
            )}
          >
            {/* Search Bar */}
            <div className="p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-purple-100">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-purple-50 text-gray-700 placeholder-purple-400 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="p-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-purple-100/50 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredParents.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Grid size={56} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-medium">Hech narsa topilmadi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredParents.map((item, index) => (
                    <button
                      key={get(item, "id")}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-4 py-4 text-left transition-all duration-200 active:scale-[0.98] group",
                        isEqual(get(item, "id"), get(selected, "id"))
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-200"
                          : "bg-white hover:bg-purple-50 hover:shadow-md border border-purple-100"
                      )}
                      onClick={() => handleCategoryClick(item)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          className={cn(
                            "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mr-3 transition-all",
                            isEqual(get(item, "id"), get(selected, "id"))
                              ? "bg-white/20 text-white"
                              : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                          )}
                        >
                          {getCategoryIcon(item, index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "font-semibold text-sm block truncate",
                            isEqual(get(item, "id"), get(selected, "id"))
                              ? "text-white"
                              : "text-gray-800"
                          )}>
                            {get(item, "name")}
                          </span>
                          <span className={cn(
                            "text-xs font-medium",
                            isEqual(get(item, "id"), get(selected, "id"))
                              ? "text-purple-100"
                              : "text-purple-600"
                          )}>
                            {get(item, "children", []).length} subkategoriya
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "flex-shrink-0 transition-all",
                          isEqual(get(item, "id"), get(selected, "id"))
                            ? "text-white translate-x-1"
                            : "text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5"
                        )}
                        size={20}
                        strokeWidth={2.5}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subcategories - Right Side */}
          <div
            className={cn(
              "flex-1 bg-gradient-to-br from-white to-purple-50/30 overflow-y-auto",
              isMobile && !showSubcategories && "hidden"
            )}
          >
            {selected && (
              <div className="p-5 md:p-8">
                {/* Desktop Header */}
                {!isMobile && (
                  <div className="mb-8 pb-6 border-b-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                        {getCategoryIcon(selected, 0)}
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {get(selected, "name")}
                      </h1>
                    </div>
                    <Link
                      to={`/catalog/${get(selected, "id")}`}
                      className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-semibold group"
                      onClick={handleClose}
                    >
                      Barchasini ko'rish
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </Link>
                  </div>
                )}

                {childCategories.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <Package size={72} className="mx-auto mb-4 opacity-20" />
                    <p className="text-base font-medium">Bu kategoriyada subkategoriya yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {childCategories.map((category, index) => (
                      <div key={get(category, "id")} className="group/section">
                        <Link
                          to={`/catalog/${get(category, "id")}`}
                          className="flex items-center mb-4 group/link"
                          onClick={handleClose}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mr-3 text-purple-600 group-hover/link:from-purple-500 group-hover/link:to-purple-600 group-hover/link:text-white transition-all shadow-sm group-hover/link:shadow-md group-hover/link:scale-105">
                            {getCategoryIcon(category, index)}
                          </div>
                          <h3 className="font-bold text-lg text-gray-800 group-hover/link:text-purple-600 transition-colors">
                            {get(category, "name")}
                          </h3>
                        </Link>

                        {/* Grandchildren */}
                        {isArray(get(category, "children")) &&
                          get(category, "children").length > 0 && (
                            <div className="ml-15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {get(category, "children").map((grandchild) => (
                                <Link
                                  key={get(grandchild, "id")}
                                  to={`/catalog/${get(grandchild, "id")}`}
                                  className="flex items-center px-4 py-3 rounded-xl hover:bg-purple-100 bg-white border border-purple-100 text-sm text-gray-700 hover:text-purple-700 transition-all group/item active:scale-[0.98] hover:shadow-sm font-medium"
                                  onClick={handleClose}
                                >
                                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2.5 group-hover/item:bg-purple-600 group-hover/item:scale-125 transition-all" />
                                  <span className="group-hover/item:translate-x-1 transition-transform truncate">
                                    {get(grandchild, "name")}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Categories Section */}
                {!isMobile && (
                  <div className="mt-12 pt-8 border-t-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Mashhur kategoriyalar
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {parents.slice(0, 4).map((category, i) => (
                        <Link
                          key={get(category, "id") || i}
                          to={`/catalog/${get(category, "id")}`}
                          className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-200/50 transition-all active:scale-95 border border-purple-200"
                          onClick={handleClose}
                        >
                          <div className="absolute top-3 right-3 w-9 h-9 bg-white/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <ChevronRight size={18} className="text-purple-600" strokeWidth={2.5} />
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                            {getCategoryIcon(category, i)}
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">
                            {get(category, "name")}
                          </h4>
                          <p className="text-xs text-purple-600 font-semibold">
                            {get(category, "children", []).length} subkategoriya
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile "View All" Button */}
                {isMobile && childCategories.length > 0 && (
                  <Link
                    to={`/catalog/${get(selected, "id")}`}
                    className="sticky bottom-4 mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-300/50 active:scale-98 transition-all"
                    onClick={handleClose}
                  >
                    Barcha mahsulotlarni ko'rish
                    <ChevronRight size={22} strokeWidth={2.5} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default HeaderCatalog;