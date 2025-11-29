import React, { useState } from "react";
import { Filter, X, Search, DollarSign, ChevronDown } from "lucide-react";

// Iloji boricha chiroyli va purple rang uslubida yaratildi.
const MobileCatalogFilter = ({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  searchQuery,
  setSearchQuery,
  priceRange,
  handlePriceChange,
  properties, // Dinamik xususiyatlar (Transport kabi)
  selectedProperties,
  handlePropertyChange,
  getActiveFilterCount,
  clearFilters,
  applyFilters,
  items,
}) => {
  const PURPLE_COLOR = "#A64AC9"; // Asosiy binafsha
  const LIGHT_PURPLE_BG = "#F7F5FA"; // Yengil binafsha fon
  
  // Dinamik xususiyatlar uchun state (agar sizda yo'q bo'lsa, uni yuqori komponentda e'lon qiling)
  const [expandedFilters, setExpandedFilters] = useState({});

  const toggleFilterExpand = (name) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  if (!mobileFiltersOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 1. Orqa fon (Overlay) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setMobileFiltersOpen(false)}
      />

      {/* 2. Asosiy Filtr Drawer (O'ngdan chiquvchi oyna) */}
      {/* max-w-sm endi 400px atrofida bo'lib, biroz kengroq bo'lishi mumkin */}
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        
        {/* === Header (Rangi va Yopish tugmasi) === */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-6 h-6" style={{ color: PURPLE_COLOR }} />
            Filtrlar
          </h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-1 hover:bg-purple-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" style={{ color: PURPLE_COLOR }} />
          </button>
        </div>

        {/* === Content (Aylantiriladigan qism) - flex-1 va padding bor, footer yuqoriga chiqishi uchun === */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* A. Qidiruv (Search) */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Mahsulot nomidan qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // CHIROYLI INPUT USLUBI: To'liq dumaloq, border-2 va purple focus
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 text-base rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none shadow-sm"
            />
          </div>

          {/* B. Narx Oralig'i */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: LIGHT_PURPLE_BG }}> 
            <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: PURPLE_COLOR }} />
              Narx oralig'i
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                // CHIROYLI INPUT USLUBI
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-base rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
              />
              <span className="text-gray-400 font-medium text-lg">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                // CHIROYLI INPUT USLUBI
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-base rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* C. Dinamik Xususiyatlar (Transport kabi) */}
          {properties.map((property) => (
            <div key={property.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: LIGHT_PURPLE_BG }}>
              
              {/* Accordeon Sarlavhasi (Always visible) */}
              <button
                onClick={() => toggleFilterExpand(property.name)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <h3 className="font-bold text-lg text-gray-800">
                  {property.name}
                </h3>
                <ChevronDown
                    className={`w-5 h-5 text-purple-600 transition-transform ${
                      expandedFilters[property.name] ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Accordeon Kontenti (Collapsible) */}
              <div
                className={`px-4 pb-4 transition-all duration-300 ${
                    expandedFilters[property.name]
                        ? "max-h-96 opacity-100 pt-2"
                        : "max-h-0 opacity-0"
                }`}
              >
                {/* SELECT / BOOLEAN */}
                {(property.type === "SELECT" || property.type === "BOOLEAN") && (
                  <select
                    // CHIROYLI INPUT USLUBI
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-base rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
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

                {/* STRING / INTEGER / DOUBLE */}
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
                    // CHIROYLI INPUT USLUBI
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-base rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-20 bg-white p-4 border-t border-gray-100 space-y-3 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.05)]">
          
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-semibold py-3 rounded-2xl transition-all duration-300"
            >
              Filtrlarni tozalash ({getActiveFilterCount()})
            </button>
          )}

          <button
            onClick={() => {
              applyFilters();
              setMobileFiltersOpen(false);
            }}
            // Asosiy tugma uslubi: Gradient Purple, katta va jozibali
            className="w-full text-white text-base font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-xl shadow-purple-300/50"
            style={{
              background: `linear-gradient(to right, ${PURPLE_COLOR}, #9333ea)`, // Katta, jozibali purple
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