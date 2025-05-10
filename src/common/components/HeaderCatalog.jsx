"use client";

import { get, head, isArray, isEqual, isNil } from "lodash";
import { useEffect, useState } from "react";
import KEYS from "../../export/keys.js";
import URLS from "../../export/urls.js";
import usePaginateQuery from "../../hooks/api/usePaginateQuery.js";
import {
  ChevronRight,
  ShoppingBag,
  X,
  Search,
  Grid,
  Tag,
  Layers,
  Package,
  ArrowRight,
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { data: parentList, isLoading } = usePaginateQuery({
    key: KEYS.categories,
    url: URLS.categories,
    enabled: !!isOpen,
  });

  const parents = isArray(get(parentList, "data.content", []))
    ? get(parentList, "data.content", [])
    : [];

  // Filter parents based on search term
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

  // Get children from the selected category
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

  // Get a category-specific icon based on name
  const getCategoryIcon = (category, index) => {
    const name = get(category, "name", "").toLowerCase();

    if (
      name.includes("auto") ||
      name.includes("avtomobil") ||
      name.includes("car")
    ) {
      return <Car key="car" size={18} />;
    } else if (
      name.includes("electron") ||
      name.includes("phone") ||
      name.includes("smart")
    ) {
      return <Smartphone key="smartphone" size={18} />;
    } else if (
      name.includes("home") ||
      name.includes("house") ||
      name.includes("uy")
    ) {
      return <Home key="home" size={18} />;
    } else if (name.includes("shop") || name.includes("market")) {
      return <ShoppingCart key="cart" size={18} />;
    }

    // Fallback to generic icons
    const icons = [
      <Package key="package" size={18} />,
      <Tag key="tag" size={18} />,
      <Layers key="layers" size={18} />,
      <Grid key="grid" size={18} />,
    ];
    return icons[index % icons.length];
  };

  // Handle category click
  const handleCategoryClick = (item) => {
    setSelected(item);
    if (isMobile) {
      // On mobile, scroll to the top of the right panel
      const rightPanel = document.getElementById("right-panel");
      if (rightPanel) {
        rightPanel.scrollTop = 0;
      }
    }
  };

  // Handle subcategory click
  const handleSubcategoryClick = (categoryId) => {
    // Here you would typically navigate to the category page
    setisOpen(false);
    // Example: navigate to category page
    // window.location.href = `/category/${categoryId}`
  };

  // Debug the data structure
  console.log("Selected category:", selected);
  console.log("Child categories:", childCategories);

  return isOpen ? (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setisOpen(false)}
    >
      <div
        className="relative w-11/12 max-w-6xl rounded-xl bg-white shadow-2xl transition-all duration-300 ease-in-out modal-animation"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setisOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col md:flex-row h-[80vh] md:h-[70vh] overflow-hidden rounded-xl">
          {/* Left sidebar - Parent categories */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-gradient-to-b from-teal-600 to-teal-700 p-4 overflow-y-auto">
            {/* Search input */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-teal-300" />
              </div>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 bg-teal-700/50 text-white placeholder-teal-300 rounded-lg border border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mb-4 flex items-center gap-2 px-2 text-white">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-bold">Kategoriyalar</h2>
            </div>

            {isLoading ? (
              // Loading skeleton
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-white/10 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : filteredParents.length === 0 ? (
              // No results
              <div className="text-center py-8 text-white/80">
                <p>Hech qanday natija topilmadi</p>
              </div>
            ) : (
              // Category list
              <div className="space-y-1">
                {filteredParents?.map((item, index) => (
                  <button
                    className={cn(
                      "group w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                      isEqual(get(item, "id"), get(selected, "id"))
                        ? "bg-white text-teal-800"
                        : "text-white hover:bg-white/10"
                    )}
                    key={get(item, "id")}
                    onClick={() => handleCategoryClick(item)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-teal-300 group-hover:text-white transition-colors">
                        {getCategoryIcon(item, index)}
                      </span>
                      <span className="truncate">{get(item, "name")}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isEqual(get(item, "id"), get(selected, "id"))
                          ? "text-teal-600"
                          : "text-teal-300 group-hover:translate-x-1 group-hover:text-white"
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right content - Child categories */}
          <div
            id="right-panel"
            className="w-full md:w-2/3 lg:w-3/4 bg-white p-4 md:p-6 overflow-y-auto"
          >
            {selected && (
              <>
                <div className="mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                    {get(selected, "name")}
                    <Link
                      to={`/category/${get(selected, "id")}`}
                      className="ml-2 text-sm text-teal-600 hover:text-teal-700 flex items-center"
                      onClick={() => setisOpen(false)}
                    >
                      Barchasini ko'rish
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </h1>
                  <div className="mt-2 h-1 w-20 rounded bg-teal-600"></div>
                </div>

                {childCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Bu kategoriyada hech qanday subkategoriya mavjud emas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                    {childCategories?.map((category, index) => (
                      <div key={get(category, "id")} className="mb-4">
                        {get(category, "name") && (
                          <Link
                            to={`/category/${get(category, "id")}`}
                            className="flex items-center group"
                            onClick={() => setisOpen(false)}
                          >
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                              {getCategoryIcon(category, index)}
                            </div>
                            <h2 className="font-medium text-teal-700 group-hover:text-teal-800 transition-colors">
                              {get(category, "name")}
                            </h2>
                          </Link>
                        )}

                        {/* Display grandchildren (third level) */}
                        {isArray(get(category, "children")) &&
                          get(category, "children").length > 0 && (
                            <ul className="space-y-1 mt-3 ml-10">
                              {get(category, "children").map((grandchild) => (
                                <li
                                  key={get(grandchild, "id")}
                                  onClick={() =>
                                    handleSubcategoryClick(
                                      get(grandchild, "id")
                                    )
                                  }
                                  className="cursor-pointer text-sm text-gray-600 hover:text-teal-600 py-1.5 transition-colors duration-150 flex items-center border-b border-gray-100 last:border-0"
                                >
                                  <div className="w-1.5 h-1.5 bg-teal-200 rounded-full mr-2"></div>
                                  <span className="hover:translate-x-1 transition-transform">
                                    {get(grandchild, "name")}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Featured categories or promotions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Mashhur kategoriyalar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {parents.slice(0, 4).map((category, i) => (
                  <Link
                    key={get(category, "id") || i}
                    to={`/category/${get(category, "id")}`}
                    className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setisOpen(false)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600">
                        {getCategoryIcon(category, i)}
                      </div>
                      <ChevronRight className="h-4 w-4 text-teal-500" />
                    </div>
                    <h4 className="font-medium text-teal-800">
                      {get(category, "name") || `Kategoriya ${i + 1}`}
                    </h4>
                    <p className="text-xs text-teal-600 mt-1">
                      {get(category, "children", []).length} subkategoriya
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default HeaderCatalog;
