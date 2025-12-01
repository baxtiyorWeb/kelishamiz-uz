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
} from "lucide-react";
import { cn } from "../../lib/utils.jsx";
import { Link } from "react-router-dom";

const HeaderCatalog = ({ isOpen, setisOpen }) => {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const getCategoryIcon = (category, index) => {
    const name = get(category, "name", "").toLowerCase();

    if (
      name.includes("auto") ||
      name.includes("avtomobil") ||
      name.includes("car")
    ) {
      return <Car className="w-5 h-5" />;
    } else if (
      name.includes("electron") ||
      name.includes("phone") ||
      name.includes("smart")
    ) {
      return <Smartphone className="w-5 h-5" />;
    } else if (
      name.includes("home") ||
      name.includes("house") ||
      name.includes("uy")
    ) {
      return <Home className="w-5 h-5" />;
    } else if (name.includes("shop") || name.includes("market")) {
      return <ShoppingCart className="w-5 h-5" />;
    }

    const icons = [
      <Package key="package" className="w-5 h-5" />,
      <Tag key="tag" className="w-5 h-5" />,
      <Layers key="layers" className="w-5 h-5" />,
      <Grid key="grid" className="w-5 h-5" />,
    ];
    return icons[index % icons.length];
  };

  const handleClose = () => {
    setisOpen(false);
  };

  return isOpen ? (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className={`
    fixed inset-0 
    md:left-1/2 md:top-10
    md:-translate-x-1/2
    md:w-[95%] md:max-w-5xl md:h-[85vh]
    bg-white md:rounded-2xl shadow-2xl overflow-hidden

    transition-all duration-300
    animate-in fade-in slide-in-from-top-8
  `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg md:text-xl">
            Kategoriyalar
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <div className="flex h-[calc(100%-56px)] md:h-[calc(100%-64px)]">
          {/* Left Sidebar */}
          <div className="w-[45%] md:w-64 bg-gray-50 border-r overflow-y-auto">
            {/* Search */}
            <div className="p-3 bg-white border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="p-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredParents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Topilmadi</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredParents.map((item, index) => (
                    <button
                      key={get(item, "id")}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm",
                        isEqual(get(item, "id"), get(selected, "id"))
                          ? "bg-purple-600 text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                      onClick={() => setSelected(item)}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          isEqual(get(item, "id"), get(selected, "id"))
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        )}
                      >
                        {getCategoryIcon(item, index)}
                      </div>
                      <span className="font-medium truncate text-xs md:text-sm">
                        {get(item, "name")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selected && (
              <div className="p-4 md:p-6">
                {/* Selected Category Header */}
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                      {getCategoryIcon(selected, 0)}
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                      {get(selected, "name")}
                    </h1>
                  </div>
                  <Link
                    to={`/catalog/${get(selected, "id")}`}
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-semibold group"
                    onClick={handleClose}
                  >
                    Barchasini ko'rish
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Subcategories */}
                {childCategories.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Subkategoriya yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {childCategories.map((category, index) => (
                      <div key={get(category, "id")}>
                        <Link
                          to={`/catalog/${get(category, "id")}`}
                          className="flex items-center gap-2.5 mb-3 group"
                          onClick={handleClose}
                        >
                          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            {getCategoryIcon(category, index)}
                          </div>
                          <h3 className="font-bold text-base text-gray-800 group-hover:text-purple-600 transition-colors">
                            {get(category, "name")}
                          </h3>
                        </Link>

                        {/* Grandchildren */}
                        {isArray(get(category, "children")) &&
                          get(category, "children").length > 0 && (
                            <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {get(category, "children").map((grandchild) => (
                                <Link
                                  key={get(grandchild, "id")}
                                  to={`/catalog/${get(grandchild, "id")}`}
                                  className="flex items-center px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-gray-600 hover:text-purple-700 transition-colors group"
                                  onClick={handleClose}
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-125 transition-transform" />
                                  <span className="truncate">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default HeaderCatalog;
