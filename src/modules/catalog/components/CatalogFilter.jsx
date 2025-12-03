import React from "react";
import {
  Filter,
  Search,
  DollarSign,
  ChevronDown,
  X,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  Sparkles,
} from "lucide-react";
import ItemCard from "../../../common/components/ItemCard";
import InfiniteScroll from "react-infinite-scroll-component";

const CatalogFilter = ({
  searchQuery,
  setSearchQuery,
  priceRange,
  selectedProperties,
  sortOption,
  viewMode,
  setViewMode,
  expandedFilters,
  properties,
  items,
  isLoading,
  fetchNextPage,
  hasNextPage,
  handlePriceChange,
  handlePropertyChange,
  handleSortChange,
  toggleFilterExpand,
  clearFilters,
  getActiveFilterCount,
  setMobileFiltersOpen,
  renderSkeletons,
  sortOptions,
  // refetch propini olib tashladik
  isProductLiked = () => false,
}) => {
  const removeProperty = (propertyName) => {
    handlePropertyChange(propertyName, "");
  };

  const clearPriceRange = () => {
    handlePriceChange("min", "");
    handlePriceChange("max", "");
  };

  const clearSort = () => {
    // Saralashni boshlang'ich holatga (createdAt_DESC) qaytarish
    handleSortChange("createdAt_DESC");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* ===================== COMPACT SIDEBAR ===================== */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-4 space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  Filtrlar
                </h2>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Qidirish
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nomi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Narx (so'm)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="border-b border-gray-100 pb-3 last:border-0"
                  >
                    <button
                      onClick={() => toggleFilterExpand(property.name)}
                      className="w-full flex items-center justify-between text-left group py-1"
                    >
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-purple-600 transition">
                        {property.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedFilters[property.name]
                            ? "rotate-180 text-purple-600"
                            : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`mt-2 overflow-hidden transition-all duration-300 ${
                        expandedFilters[property.name]
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {(property.type === "SELECT" ||
                        property.type === "BOOLEAN") && (
                        <select
                          value={selectedProperties[property.name] || ""}
                          onChange={(e) => {
                            handlePropertyChange(property.name, e.target.value);
                          }}
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
                        >
                          <option value="">Tanlang</option>
                          {property.type === "BOOLEAN" ? (
                            <>
                              <option value="true">Ha</option>
                              <option value="false">Yo'q</option>
                            </>
                          ) : (
                            property.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
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
                          placeholder={`${property.name}...`}
                          value={selectedProperties[property.name] || ""}
                          onChange={(e) =>
                            handlePropertyChange(property.name, e.target.value)
                          }
                          // onBlur={() => refetch()} Olib tashlandi
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ===================== MAIN CONTENT ===================== */}
        <div className="flex-1 min-w-0">
          {/* Compact Toolbar */}
          <div className="bg-white rounded-xl p-3 md:p-4 mb-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              {/* Sort Buttons */}
              <div className="w-full max-w-xs">
                <select
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm shadow-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  // sortOption.field va sortOption.order ni birlashtirib, joriy qiymatni yaratish
                  value={sortOption.field + "_" + sortOption.order}
                  onChange={(e) => {
                    // Yangi qiymatni to'g'ridan-to'g'ri handlerga yuborish
                    handleSortChange(e.target.value);
                  }}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-xs shadow-md"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtrlar
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters - Compact Tags */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                    <Search className="w-3 h-3" />
                    {searchQuery.length > 15
                      ? searchQuery.substring(0, 15) + "..."
                      : searchQuery}
                    <button
                      onClick={clearSearch}
                      className="ml-0.5 hover:bg-purple-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(priceRange.min || priceRange.max) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                    <DollarSign className="w-3 h-3" />
                    {priceRange.min || "0"} — {priceRange.max || "∞"}
                    <button
                      onClick={clearPriceRange}
                      className="ml-0.5 hover:bg-green-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Saralash tagini to'g'ri ko'rsatish */}
                {(sortOption.field !== "createdAt" ||
                  sortOption.order !== "DESC") && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                    {
                      sortOptions.find(
                        (opt) =>
                          opt.value ===
                          sortOption.field + "_" + sortOption.order
                      )?.label
                    }
                    <button
                      onClick={clearSort}
                      className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {Object.entries(selectedProperties)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium"
                    >
                      {key}:{" "}
                      {value === "true"
                        ? "Ha"
                        : value === "false"
                        ? "Yo'q"
                        : value}
                      <button
                        onClick={() => removeProperty(key)}
                        className="ml-0.5 hover:bg-amber-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 transition"
                >
                  <X className="w-3 h-3" /> Tozalash
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            renderSkeletons()
          ) : items.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                Hech narsa topilmadi
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Filtrlarni o'zgartiring yoki boshqa kategoriyani tanlang
              </p>
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition text-sm"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={items.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                </div>
              }
              endMessage={
                <p className="text-center py-8 text-sm text-gray-500">
                  {items.length > 0 ? "Barcha e'lonlar yuklandi" : ""}
                </p>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {items.map((item, index) => (
                  <ItemCard key={item.id || index} item={item} index={index} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a78bfa;
        }
      `}</style>
    </div>
  );
};

export default CatalogFilter;
