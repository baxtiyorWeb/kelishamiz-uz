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
  Package,
  Car,
  Smartphone,
  Home,
  ShoppingCart,
  Zap,
  Tag,
  Layers,
  Grid,
  Heart,
  Shirt,
  Fish,
  Gem,
} from "lucide-react";
import { cn } from "../../lib/utils.jsx";
import { Link } from "react-router-dom";

const HeaderCatalog = ({ isOpen, setisOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null); // Desktop uchun
  const [hoveredChild, setHoveredChild] = useState(null); // Desktop uchun
  const [openMobileCategory, setOpenMobileCategory] = useState(null); // Mobil uchun

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

  // Body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setisOpen(false);
    setSearchTerm("");
    setSelected(null);
    setHoveredChild(null);
    setOpenMobileCategory(null);
  };

  // Desktop: birinchi kategoriyani avto tanlash
  useEffect(() => {
    if (filteredParents.length > 0 && !selected) {
      const first = head(filteredParents);
      setSelected(first);
      if (first.children?.length > 0) {
        setHoveredChild(head(first.children));
      }
    }
  }, [filteredParents, selected]);

  // Desktop ikona
  const getDesktopIcon = (category, index) => {
    const name = get(category, "name", "").toLowerCase();
    if (name.includes("auto") || name.includes("avto"))
      return <Car className="w-5 h-5" />;
    if (name.includes("smart") || name.includes("telefon"))
      return <Smartphone className="w-5 h-5" />;
    if (name.includes("uy") || name.includes("maishiy"))
      return <Home className="w-5 h-5" />;
    if (name.includes("hafta")) return <ShoppingCart className="w-5 h-5" />;
    if (name.includes("turizm") || name.includes("baliq"))
      return <Package className="w-5 h-5" />;
    if (name.includes("kiyim")) return <Tag className="w-5 h-5" />;

    const icons = [<Zap />, <Layers />, <Grid />, <Package />];
    return icons[index % icons.length];
  };

  // Mobil ikona va rang
  const getMobileIconAndColor = (name, index) => {
    const lower = name.toLowerCase();
    const iconMap = {
      hafta: { icon: <Zap className="w-6 h-6" />, color: "bg-yellow-500" },
      qish: { icon: <Package className="w-6 h-6" />, color: "bg-orange-400" },
      xobbi: { icon: <Heart className="w-6 h-6" />, color: "bg-pink-400" },
      smartfon: {
        icon: <Smartphone className="w-6 h-6" />,
        color: "bg-blue-500",
      },
      turizm: { icon: <Fish className="w-6 h-6" />, color: "bg-teal-500" },
      elektronika: {
        icon: <Zap className="w-6 h-6" />,
        color: "bg-purple-500",
      },
      maishiy: { icon: <Home className="w-6 h-6" />, color: "bg-indigo-500" },
      kiyim: { icon: <Shirt className="w-6 h-6" />, color: "bg-green-500" },
      poyabzal: { icon: <Package className="w-6 h-6" />, color: "bg-red-500" },
      aksessuar: { icon: <Gem className="w-6 h-6" />, color: "bg-amber-500" },
      gozallik: { icon: <Heart className="w-6 h-6" />, color: "bg-rose-500" },
      salomatlik: { icon: <Heart className="w-6 h-6" />, color: "bg-cyan-500" },
      uy: { icon: <Home className="w-6 h-6" />, color: "bg-gray-600" },
    };

    for (const key in iconMap) {
      if (lower.includes(key)) return iconMap[key];
    }
    const colors = [
      "bg-yellow-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
    ];
    return {
      icon: <Package className="w-6 h-6" />,
      color: colors[index % colors.length],
    };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* MOBIL VERSIYA (< md) */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-xl font-bold">Katalog</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Qidirish..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)] pb-10">
          {isLoading ? (
            <div className="px-4 space-y-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="px-3 space-y-2">
              {filteredParents.map((cat, i) => {
                const { icon, color } = getMobileIconAndColor(cat.name, i);
                const isOpen = openMobileCategory === cat.id;
                const hasChildren =
                  isArray(cat.children) && cat.children.length > 0;

                return (
                  <div
                    key={cat.id}
                    className="bg-gray-50 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        hasChildren &&
                        setOpenMobileCategory(isOpen ? null : cat.id)
                      }
                      className="w-full px-4 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                            color
                          )}
                        >
                          {icon}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {cat.name}
                          {cat.name.toLowerCase().includes("hafta") && " ⭐"}
                        </span>
                      </div>
                      {hasChildren && (
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 transition-transform",
                            isOpen && "rotate-90"
                          )}
                        />
                      )}
                    </button>

                    {hasChildren && isOpen && (
                      <div className="border-t bg-white">
                        <Link
                          to={`/catalog/${cat.id}`}
                          onClick={handleClose}
                          className="block px-4 py-3 pl-16 font-medium text-purple-600 hover:bg-purple-50"
                        >
                          Barchasini ko‘rish
                        </Link>
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/catalog/${child.id}`}
                            onClick={handleClose}
                            className="block px-4 py-3 pl-16 text-gray-700 hover:bg-gray-50"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP VERSIYA (≥ md) - Sizning asl kod deyarli o'zgarmagan */}
      <div
        className="hidden md:block fixed inset-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-7xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-extrabold text-2xl">Katalog</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex h-[calc(100%-68px)]">
            {/* 1-ustun */}
            <div className="w-64 bg-white border-r overflow-y-auto">
              <div className="p-4 bg-gray-50 border-b sticky top-0 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Kategoriyalarni qidirish..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 space-y-1">
                {filteredParents.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                      selected?.id === item.id
                        ? "bg-purple-600 text-white shadow-lg"
                        : "hover:bg-purple-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          selected?.id === item.id
                            ? "bg-white/20"
                            : "bg-purple-100 text-purple-600"
                        )}
                      >
                        {getDesktopIcon(item, i)}
                      </div>
                      <span className="font-semibold truncate">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* 2 va 3-ustun */}
            {selected && (
              <div className="flex-1 flex">
                <div className="w-72 border-r bg-gray-50 overflow-y-auto p-6">
                  <h3 className="font-bold text-lg mb-4 border-b pb-2">
                    {selected.name}
                  </h3>
                  <Link
                    to={`/catalog/${selected.id}`}
                    onClick={handleClose}
                    className="block px-3 py-2 mb-3 rounded-xl bg-white shadow-sm font-bold text-purple-600 hover:bg-purple-100"
                  >
                    Barcha mahsulotlarni ko'rish
                  </Link>
                  {selected.children?.map((child) => (
                    <button
                      key={child.id}
                      onMouseEnter={() => setHoveredChild(child)}
                      onClick={() => setHoveredChild(child)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl flex justify-between items-center",
                        hoveredChild?.id === child.id
                          ? "bg-purple-600 text-white"
                          : "hover:bg-purple-100 text-gray-700"
                      )}
                    >
                      <span>{child.name}</span>
                      {child.children?.length > 0 && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 bg-white p-6 overflow-y-auto">
                  {hoveredChild && (
                    <>
                      <Link
                        to={`/catalog/${hoveredChild.id}`}
                        onClick={handleClose}
                        className="text-lg font-bold text-purple-600 hover:text-purple-700 flex items-center mb-4 border-b pb-2"
                      >
                        {hoveredChild.name}{" "}
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </Link>
                      <div className="grid grid-cols-3 gap-4">
                        {hoveredChild.children?.map((grand) => (
                          <Link
                            key={grand.id}
                            to={`/catalog/${grand.id}`}
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-purple-50 text-gray-700 flex items-center gap-3"
                          >
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                            <span className="truncate">{grand.name}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderCatalog;
