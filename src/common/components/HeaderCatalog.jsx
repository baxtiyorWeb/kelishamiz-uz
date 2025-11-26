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
      return <Car size={18} />;
    } else if (name.includes("electron") || name.includes("phone") || name.includes("smart")) {
      return <Smartphone size={18} />;
    } else if (name.includes("home") || name.includes("house") || name.includes("uy")) {
      return <Home size={18} />;
    } else if (name.includes("shop") || name.includes("market")) {
      return <ShoppingCart size={18} />;
    }

    const icons = [
      <Package key="package" size={18} />,
      <Tag key="tag" size={18} />,
      <Layers key="layers" size={18} />,
      <Grid key="grid" size={18} />,
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
      className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="absolute inset-0 md:relative md:inset-auto md:mx-auto md:my-8 md:max-w-6xl md:rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 shadow-md">
            <div className="flex items-center justify-between">
              {showSubcategories ? (
                <>
                  <button
                    onClick={handleBackToMain}
                    className="flex items-center text-white active:scale-95 transition-transform"
                  >
                    <ChevronLeft size={24} />
                    <span className="ml-2 font-medium">Orqaga</span>
                  </button>
                  <h2 className="text-white font-semibold text-sm truncate mx-4 flex-1 text-center">
                    {get(selected, "name")}
                  </h2>
                </>
              ) : (
                <h2 className="text-white font-semibold text-lg">Kategoriyalar</h2>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white active:scale-95 transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Desktop Close Button */}
        {!isMobile && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all active:scale-95"
          >
            <X size={24} />
          </button>
        )}

        <div className="flex flex-col md:flex-row h-[calc(100vh-60px)] md:h-[70vh]">
          {/* Main Categories - Left Side */}
          <div
            className={cn(
              "w-full md:w-1/3 bg-gradient-to-b from-teal-50 to-white md:from-teal-500 md:to-teal-600 overflow-y-auto",
              isMobile && showSubcategories && "hidden"
            )}
          >
            {/* Search Bar */}
            <div className="p-4 md:p-4 sticky top-0 bg-teal-50 md:bg-transparent z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 md:text-teal-300" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white md:bg-teal-700/50 text-gray-700 md:text-white placeholder-gray-400 md:placeholder-teal-300 rounded-xl border-2 border-gray-200 md:border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500 md:focus:ring-white/30 text-sm transition-all"
                  placeholder="Kategoriya qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="px-3 pb-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-white/20 md:bg-white/10 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredParents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 md:text-white/80">
                  <Grid size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Hech narsa topilmadi</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredParents.map((item, index) => (
                    <button
                      key={get(item, "id")}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all duration-200 active:scale-98",
                        isEqual(get(item, "id"), get(selected, "id"))
                          ? "bg-white shadow-md text-teal-700 md:bg-white md:text-teal-800"
                          : "bg-white/50 md:bg-white/10 text-gray-700 md:text-white hover:bg-white/70 md:hover:bg-white/20"
                      )}
                      onClick={() => handleCategoryClick(item)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                            isEqual(get(item, "id"), get(selected, "id"))
                              ? "bg-teal-100 text-teal-600"
                              : "bg-teal-100/50 md:bg-teal-700/50 text-teal-600 md:text-teal-200"
                          )}
                        >
                          {getCategoryIcon(item, index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm block truncate">
                            {get(item, "name")}
                          </span>
                          <span className={cn(
                            "text-xs",
                            isEqual(get(item, "id"), get(selected, "id"))
                              ? "text-teal-600"
                              : "text-gray-500 md:text-teal-200"
                          )}>
                            {get(item, "children", []).length} ta
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "flex-shrink-0 transition-transform",
                          isEqual(get(item, "id"), get(selected, "id"))
                            ? "text-teal-600 translate-x-1"
                            : "text-gray-400 md:text-teal-300"
                        )}
                        size={20}
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
              "w-full md:w-2/3 bg-white overflow-y-auto",
              isMobile && !showSubcategories && "hidden"
            )}
          >
            {selected && (
              <div className="p-4 md:p-6">
                {/* Desktop Header */}
                {!isMobile && (
                  <div className="mb-6 pb-4 border-b-2 border-teal-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      {get(selected, "name")}
                    </h1>
                    <Link
                      to={`/catalog/${get(selected, "id")}`}
                      className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium group"
                      onClick={handleClose}
                    >
                      Barchasini ko'rish
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}

                {childCategories.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Package size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Bu kategoriyada subkategoriya yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {childCategories.map((category, index) => (
                      <div key={get(category, "id")} className="group">
                        <Link
                          to={`/catalog/${get(category, "id")}`}
                          className="flex items-center mb-3 group/link"
                          onClick={handleClose}
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mr-3 text-teal-600 group-hover/link:from-teal-500 group-hover/link:to-teal-600 group-hover/link:text-white transition-all shadow-sm">
                            {getCategoryIcon(category, index)}
                          </div>
                          <h3 className="font-semibold text-gray-800 group-hover/link:text-teal-600 transition-colors">
                            {get(category, "name")}
                          </h3>
                        </Link>

                        {/* Grandchildren */}
                        {isArray(get(category, "children")) &&
                          get(category, "children").length > 0 && (
                            <div className="ml-14 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {get(category, "children").map((grandchild) => (
                                <Link
                                  key={get(grandchild, "id")}
                                  to={`/catalog/${get(grandchild, "id")}`}
                                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-teal-50 text-sm text-gray-600 hover:text-teal-700 transition-all group/item active:scale-98"
                                  onClick={handleClose}
                                >
                                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-2 group-hover/item:w-2 group-hover/item:h-2 transition-all" />
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
                  <div className="mt-10 pt-6 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={20} className="text-teal-600" />
                      <h3 className="text-lg font-bold text-gray-800">
                        Mashhur kategoriyalar
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {parents.slice(0, 4).map((category, i) => (
                        <Link
                          key={get(category, "id") || i}
                          to={`/catalog/${get(category, "id")}`}
                          className="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 hover:shadow-lg transition-all active:scale-95"
                          onClick={handleClose}
                        >
                          <div className="absolute top-2 right-2 w-8 h-8 bg-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} className="text-teal-600" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-teal-600 mb-3 group-hover:scale-110 transition-transform">
                            {getCategoryIcon(category, i)}
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                            {get(category, "name")}
                          </h4>
                          <p className="text-xs text-teal-600">
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
                    className="sticky bottom-4 mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3.5 rounded-xl font-medium shadow-lg active:scale-98 transition-all"
                    onClick={handleClose}
                  >
                    Barcha mahsulotlarni ko'rish
                    <ChevronRight size={20} />
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