import React, { useState, useEffect } from "react";
import {
  Filter,
  X,
  Search,
  DollarSign,
  ChevronDown,
  ArrowDownNarrowWide,
} from "lucide-react";

// Iloji boricha chiroyli va purple rang uslubida yaratildi.
const MobileCatalogFilter = ({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  searchQuery,
  setSearchQuery,
  priceRange,
  handlePriceChange,
  properties,
  selectedProperties,
  handlePropertyChange,
  sortOption, // Yaxshilangan: Saralash opsiyasi
  handleSortChange, // Yaxshilangan: Saralash handler
  sortOptions, // Yaxshilangan: Saralash ro'yxati
  getActiveFilterCount,
  clearFilters,
  applyFilters,
  items, // Natijalar sonini ko'rsatish uchun
}) => {
  const PURPLE_COLOR = "#7c3aed"; // Indigo/Purple 600
  const LIGHT_PURPLE_BG = "#f5f3ff"; // Indigo 50

  const [expandedFilters, setExpandedFilters] = useState({});

  const toggleFilterExpand = (name) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Drawer yopilganda expanded holatini tozalash
  useEffect(() => {
    if (!mobileFiltersOpen) {
      setExpandedFilters({});
    }
  }, [mobileFiltersOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        mobileFiltersOpen ? "visible" : "invisible"
      }`}
    >
      {/* 1. Orqa fon (Overlay) */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          mobileFiltersOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileFiltersOpen(false)}
      />

      <div
        className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out 
          ${mobileFiltersOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-6 h-6 text-purple-600" />
            Filtrlar
          </h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-1 hover:bg-purple-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 hover:text-purple-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-600" /> Qidiruv
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Mahsulot nomidan qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-base rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <ArrowDownNarrowWide className="w-4 h-4 text-purple-600" />{" "}
              Saralash
            </h3>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-base rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
              value={sortOption.field + "_" + sortOption.order}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* C. Narx Oralig'i */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" /> Narx oralig'i
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-base rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
              />
              <span className="text-gray-400 font-medium text-lg">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-base rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* D. Xususiyatlar (Properties) */}
          <div className="space-y-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <button
                  onClick={() => toggleFilterExpand(property.name)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <h3 className="font-bold text-base text-gray-800">
                    {property.name}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 transition-transform ${
                      expandedFilters[property.name] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${
                    expandedFilters[property.name]
                      ? "max-h-96 opacity-100 pt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {(property.type === "SELECT" ||
                    property.type === "BOOLEAN") && (
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-base rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      value={selectedProperties[property.name] || ""}
                    >
                      <option value="">Tanlang</option>
                      {property.type === "BOOLEAN" ? (
                        <>
                          <option value="true">Ha</option>
                          <option value="false">Yo'q</option>
                        </>
                      ) : (
                        property.options &&
                        property.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      )}
                    </select>
                  )}

                  {(property.type === "STRING" ||
                    property.type === "INTEGER" ||
                    property.type === "DOUBLE") && (
                    <input
                      type={property.type === "STRING" ? "text" : "number"}
                      placeholder={`${property.name} kiriting`}
                      value={selectedProperties[property.name] || ""}
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-base rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 space-y-3 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.05)]">
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-semibold py-3 rounded-xl transition-all duration-300"
            >
              Filtrlarni tozalash ({getActiveFilterCount()})
            </button>
          )}

          <button
            onClick={() => {
              applyFilters();
            }}
            className="w-full text-white text-base font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-700/50"
            style={{
              background: `linear-gradient(to right, ${PURPLE_COLOR}, #9333ea)`,
            }}
          >
            Natijalarni ko'rish ({items?.length || 0})
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCatalogFilter;
