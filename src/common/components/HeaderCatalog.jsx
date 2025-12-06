/* eslint-disable react/prop-types */
"use client";

import { get, head, isArray, isEqual, isNil } from "lodash";
import { useEffect, useState } from "react";
import KEYS from "../../export/keys.js";
import URLS from "../../export/urls.js";
import usePaginateQuery from "../../hooks/api/usePaginateQuery.js";
import { ChevronRight, ChevronLeft, X, Search, Package } from "lucide-react";
import { cn } from "../../lib/utils.jsx";
import { Link } from "react-router-dom";

const HeaderCatalog = ({ isOpen, setIsOpen }) => {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredChild, setHoveredChild] = useState(null);

  const [mobileView, setMobileView] = useState("parent");

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
    const isSelectedInFiltered =
      selected &&
      filteredParents.some((p) => isEqual(get(p, "id"), get(selected, "id")));

    if (!isSelectedInFiltered && filteredParents.length > 0) {
      setSelected(head(filteredParents));
    } else if (isNil(selected) && filteredParents.length > 0) {
      setSelected(head(filteredParents));
    }
  }, [filteredParents, selected]);

  const childCategories = get(selected, "children", []);

  useEffect(() => {
    setHoveredChild(null);
    if (!isNil(selected) && childCategories.length > 0) {
      setHoveredChild(head(childCategories));
    }
  }, [selected, childCategories]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMobileView("parent");
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const grandchildren = isArray(get(hoveredChild, "children", []))
    ? get(hoveredChild, "children", [])
    : [];

  const handleParentSelect = (item) => {
    setSelected(item);
    if (window.innerWidth < 768) {
      setMobileView("child");
    }
  };

  const handleChildSelect = (category) => {
    setHoveredChild(category);
    if (window.innerWidth < 768) {
      setMobileView("grandchild");
    }
  };

  const handleBack = () => {
    if (mobileView === "grandchild") {
      setMobileView("child");
    } else if (mobileView === "child") {
      setMobileView("parent");
    }
  };

  return isOpen ? (
    <div
      className="fixed inset-0 rounded-xl z-[9999] bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div
        className={`
    fixed top-0 left-0 w-screen h-screen
    bg-white rounded-none
    shadow-2xl overflow-hidden
    transition-all duration-300
    animate-in slide-in-from-top-8
    md:top-20 md:left-[10%] md:w-[80vw] md:h-[80vh] md:rounded-xl
  `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r rounded-xl from-purple-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
          {mobileView !== "parent" && (
            <button
              onClick={handleBack}
              className="md:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/30 text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <h2 className="text-white font-extrabold text-xl md:text-2xl">
            {mobileView === "parent" && "Katalog"}
            {mobileView === "child" && get(selected, "name")}
            {mobileView === "grandchild" && get(hoveredChild, "name")}
          </h2>

          <button
            onClick={handleClose}
            aria-label="Katalog oynasini yopish"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/30 text-white transition shadow-md"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex h-[calc(100%-56px)] md:h-[calc(100%-68px)]">
          <div className="hidden md:flex w-full">
            <div className="w-64 bg-white border-r overflow-y-auto flex-shrink-0">
              <div className="p-3 bg-gray-50 border-b sticky top-0 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                    placeholder="Kategoriyalarni qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-3 p-2">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-200 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredParents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-base">
                      Hech qanday kategoriya topilmadi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredParents.map((item, index) => (
                      <button
                        key={get(item, "id")}
                        className={cn(
                          "w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm",
                          isEqual(get(item, "id"), get(selected, "id"))
                            ? "bg-purple-600 text-white  shadow-purple-200"
                            : "hover:bg-purple-50 text-gray-700 hover:text-purple-700"
                        )}
                        onClick={() => setSelected(item)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold truncate text-sm">
                            {get(item, "name")}
                          </span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-transform flex-shrink-0",
                            isEqual(get(item, "id"), get(selected, "id"))
                              ? "text-white"
                              : "text-gray-400"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {selected ? (
                <div className="flex w-full">
                  <div className="w-72 border-r overflow-y-auto p-6 bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">
                      {get(selected, "name")}
                    </h3>
                    {childCategories.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">Subkategoriya yo'q</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Link
                          to={`/catalog/${get(selected, "id")}`}
                          onClick={handleClose}
                          className="block px-3 py-2 rounded-xl text-sm font-bold text-purple-600 hover:bg-purple-100 transition-colors bg-white  mb-2"
                        >
                          Barcha mahsulotlarni ko'rish
                        </Link>

                        {childCategories.map((category) => {
                          const isCurrent = isEqual(
                            get(category, "id"),
                            get(hoveredChild, "id")
                          );

                          return (
                            <button
                              key={get(category, "id")}
                              className={cn(
                                "w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-colors text-sm group",
                                isCurrent
                                  ? "bg-purple-600 text-white "
                                  : "text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                              )}
                              onMouseEnter={() => setHoveredChild(category)}
                            >
                              <span className="font-medium truncate">
                                {get(category, "name")}
                              </span>
                              {isArray(get(category, "children")) &&
                                get(category, "children").length > 0 && (
                                  <ChevronRight
                                    className={cn(
                                      "w-4 h-4 flex-shrink-0",
                                      isCurrent
                                        ? "text-white"
                                        : "text-gray-400 group-hover:text-purple-700"
                                    )}
                                  />
                                )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {hoveredChild && (
                      <Link
                        to={`/catalog/${get(hoveredChild, "id")}`}
                        onClick={handleClose}
                        className="flex items-center text-lg font-bold mb-4 text-purple-600 hover:text-purple-700 transition-colors border-b pb-2 group"
                      >
                        {get(hoveredChild, "name")}
                        <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}

                    {grandchildren.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">
                          Tegishli mahsulotlar topilmadi
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                        {grandchildren.map((grandchild) => (
                          <Link
                            key={get(grandchild, "id")}
                            to={`/catalog/${get(grandchild, "id")}`}
                            className="block p-2 rounded-lg hover:bg-purple-50 text-sm text-gray-700 hover:text-purple-700 transition-colors group"
                            onClick={handleClose}
                          >
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform flex-shrink-0" />
                              <span className="truncate font-normal">
                                {get(grandchild, "name")}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Kategoriya tanlang</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden w-full overflow-hidden">
            {mobileView === "parent" && (
              <div className="h-full overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b sticky top-0 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                      placeholder="Kategoriyalarni qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="h-12 bg-gray-200 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : filteredParents.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-sm">
                        Hech qanday kategoriya topilmadi.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredParents.map((item, index) => (
                        <button
                          key={get(item, "id")}
                          className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-all bg-white hover:bg-purple-50 border border-gray-200"
                          onClick={() => handleParentSelect(item)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600"></div>
                            <span className="font-semibold text-sm text-gray-800">
                              {get(item, "name")}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {mobileView === "child" && selected && (
              <div className="h-full overflow-y-auto">
                <div className="p-3">
                  {childCategories.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-sm">Subkategoriya yo'q</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to={`/catalog/${get(selected, "id")}`}
                        onClick={handleClose}
                        className="block px-4 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md mb-3"
                      >
                        Barcha mahsulotlarni ko'rish
                      </Link>

                      {childCategories.map((category) => (
                        <button
                          key={get(category, "id")}
                          className="w-full flex items-center justify-between text-left px-4 py-3 rounded-xl transition-colors bg-white hover:bg-purple-50 border border-gray-200"
                          onClick={() => handleChildSelect(category)}
                        >
                          <span className="font-medium text-sm text-gray-800">
                            {get(category, "name")}
                          </span>
                          {isArray(get(category, "children")) &&
                            get(category, "children").length > 0 && (
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {mobileView === "grandchild" && hoveredChild && (
              <div className="h-full overflow-y-auto">
                <div className="p-3">
                  {grandchildren.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Tegishli mahsulotlar topilmadi</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to={`/catalog/${get(hoveredChild, "id")}`}
                        onClick={handleClose}
                        className="block px-4 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md mb-3"
                      >
                        Barcha mahsulotlarni ko'rish
                      </Link>

                      {grandchildren.map((grandchild) => (
                        <Link
                          key={get(grandchild, "id")}
                          to={`/catalog/${get(grandchild, "id")}`}
                          className="block px-4 py-3 rounded-xl hover:bg-purple-50 text-sm text-gray-700 transition-colors bg-white border border-gray-200"
                          onClick={handleClose}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 flex-shrink-0" />
                            <span className="font-medium">
                              {get(grandchild, "name")}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default HeaderCatalog;
