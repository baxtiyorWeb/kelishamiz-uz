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
  ArrowDownNarrowWide, // Yangi ikonka
  ArrowUpWideNarrow, // Yangi ikonka
} from "lucide-react";
import ItemCard from "../../../common/components/ItemCard"; // Sizning prop-laringizdan olindi
import InfiniteScroll from "react-infinite-scroll-component";

const CatalogFilter = ({
  // State
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

  // Handlers
  handlePriceChange,
  handlePropertyChange,
  handleSortChange,
  toggleFilterExpand,
  // applyFilters, // AVTOMAT FILTRLASH UCHUN ISHLATILMAYDI
  clearFilters,
  getActiveFilterCount,
  setMobileFiltersOpen,
  renderSkeletons,
  sortOptions,
  refetch,
  isProductLiked = () => false,
}) => {
  // Bitta xususiyatni o'chirish
  const removeProperty = (propertyName) => {
    handlePropertyChange(propertyName, "");
  };

  // Narx oralig'ini tozalash
  const clearPriceRange = () => {
    handlePriceChange("min", "");
    handlePriceChange("max", "");
  };

  // Saralash opsiyasini tozalash (faol filtrlar uchun)
  const clearSort = () => {
    handleSortChange(null); // handleSortChange ni null ga chaqirsa, u hammasini tozalaydi
  };

  // Filtr taglaridan qidiruvni tozalash
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ===================== DESKTOP SIDEBAR ===================== */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* Barcha Filtrlarni o'z ichiga oluvchi asosiy konteyner */}
            <div className="bg-white rounded-2xl p-6 shadow-xl ring-1 ring-gray-100 space-y-6">
              {/* 1. Filtr Sarlavhasi + Tozalash Tugmasi */}
              <div className="pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-purple-700 flex items-center gap-3">
                    <Filter className="w-6 h-6" />
                    Filtrlar
                  </h2>
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm font-medium text-red-500 hover:text-red-700 transition"
                      title="Barcha filtrlarni tozalash"
                    >
                      Tozalash ({getActiveFilterCount()})
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Qidiruv (Search) */}
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  Nomi bo'yicha qidirish
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mahsulot nomini kiriting..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // Qidiruvni onBlur bilan yangilash shart emas, chunki u keydown bosilganda ham tez-tez yangilanadi
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* 3. Narx Oralig'i */}
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Narx oralig'i
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    onBlur={() => refetch()}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                  <span className="text-gray-400 font-medium">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    onBlur={() => refetch()}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                </div>
              </div>

              {/* 4. Dinamik Xususiyatlar (Accordeon qismi) */}
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="border-b border-gray-100 last:border-b-0 pb-4"
                  >
                    {/* Accordeon sarlavhasi */}
                    <button
                      onClick={() => toggleFilterExpand(property.name)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-600 transition-colors">
                        {property.name}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedFilters[property.name]
                            ? "rotate-180 text-purple-600"
                            : ""
                        }`}
                      />
                    </button>

                    {/* Accordeon kontenti */}
                    <div
                      className={`mt-3 overflow-hidden transition-all duration-300 ${
                        expandedFilters[property.name]
                          ? "max-h-96 opacity-100 pt-1"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* SELECT / BOOLEAN */}
                        {(property.type === "SELECT" ||
                          property.type === "BOOLEAN") && (
                          <select
                            value={selectedProperties[property.name] || ""}
                            onChange={(e) => {
                              handlePropertyChange(
                                property.name,
                                e.target.value
                              );
                              refetch();
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                          >
                            <option value="">Tanlang</option>
                            {property.type === "BOOLEAN" ? (
                              <>
                                <option value="true">Ha</option>
                                <option value="false">Yo'q</option>
                              </>
                            ) : (
                              property.options &&
                              property.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
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
                            type={
                              property.type === "STRING" ? "text" : "number"
                            }
                            placeholder={`${property.name} kiriting`}
                            value={selectedProperties[property.name] || ""}
                            onChange={(e) =>
                              handlePropertyChange(
                                property.name,
                                e.target.value
                              )
                            }
                            onBlur={() => refetch()}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ===================== MAIN CONTENT ===================== */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 ring-1 ring-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Saralash */}
              <div className="flex flex-wrap gap-3">
                {sortOptions.map((opt) => {
                  const active = sortOption.field === opt.field;
                  const currentOrder =
                    sortOption.field === opt.field ? sortOption.order : "DESC";
                  const nextOrder = currentOrder === "DESC" ? "ASC" : "DESC";

                  // Agar saralash narx bo'yicha bo'lsa, tartibni ham ko'rsatish
                  const isPriceSort = opt.field === "price";

                  return (
                    <button
                      key={opt.field}
                      onClick={() => handleSortChange(opt.field)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-purple-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                      {active && isPriceSort && (
                        <span className="ml-1">
                          {currentOrder === "ASC" ? (
                            <ArrowUpWideNarrow className="w-4 h-4" />
                          ) : (
                            <ArrowDownNarrowWide className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Mode + Mobile Filter */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-gray-600"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden relative flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-lg"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtrlar
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Faol Filtrlar (Tags) */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                <span className="text-gray-600 font-semibold text-sm mr-2 hidden sm:block">
                  Faol filtrlar:
                </span>

                {/* Qidiruv */}
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <Search className="w-4 h-4" />
                    {searchQuery}
                    <button
                      onClick={clearSearch}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}

                {/* Narx */}
                {(priceRange.min || priceRange.max) && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <DollarSign className="w-4 h-4" />
                    {priceRange.min || "0"} — {priceRange.max || "∞"}
                    <button
                      onClick={clearPriceRange}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}

                {/* Saralash (Faol filtrlar orasida ko'rsatish) */}
                {sortOption.field && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {
                      sortOptions.find((opt) => opt.field === sortOption.field)
                        ?.label
                    }
                    {sortOption.field === "price" &&
                      (sortOption.order === "ASC" ? " (↑)" : " (↓)")}
                    <button
                      onClick={clearSort}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}

                {/* Xususiyatlar */}
                {Object.entries(selectedProperties)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {key}:{" "}
                      <strong className="font-semibold">
                        {value === "true"
                          ? "Ha"
                          : value === "false"
                          ? "Yo'q"
                          : value}
                      </strong>
                      <button
                        onClick={() => removeProperty(key)}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}

                {/* Barchasini tozalash tugmasi */}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" /> Barchasini tozalash
                </button>
              </div>
            )}
          </div>

          {/* Mahsulotlar Ro'yxati */}
          {/* Items qismi CatalogPage ichidagi InfiniteScroll ichiga joylashtiriladi. 
              Bu yerda faqat "Hech narsa topilmadi" xabarini ko'rsatamiz, qolganini CatalogPage bajaradi. */}
          {isLoading ? (
            // Yuklanayotgan skeletni ko'rsatish
            renderSkeletons()
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="w-28 h-28 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Search className="w-14 h-14 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Hech narsa topilmadi
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Filtrlaringiz bo'yicha mos keladigan e'lonlar yo'q. Filtrlarni
                o'zgartiring.
              </p>
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8">
              <InfiniteScroll
                dataLength={items.length}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={
                  <div className="col-span-full text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                }
                endMessage={
                  <p className="text-center py-10 text-gray-500">
                    {items.length > 0
                      ? "Barcha e'lonlar yuklandi"
                      : "Bu kategoriyada hali e'lon yo'q"}
                  </p>
                }
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-6"
                  }
                >
                  {items.map((item, index) => (
                    <ItemCard
                      key={item.id || index}
                      item={item}
                      index={index}
                      // isLiked={isLiked(item.id)}
                      refresh={refetch}
                    />
                  ))}
                </div>
              </InfiniteScroll>

              {/* Agar hali yuklanayotgan bo'lsa skelet */}
              {isLoading && renderSkeletons()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogFilter;
