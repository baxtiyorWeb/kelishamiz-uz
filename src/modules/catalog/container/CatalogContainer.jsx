"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get, isArray } from "lodash";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
  ArrowUpDown,
  Grid3X3,
  List,
  Filter,
  ChevronRight,
} from "lucide-react";
import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import useInfiniteScrollQuery from "../../../hooks/api/useInfiniteScrollQuery";
import ItemCard from "../../../common/components/ItemCard";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

const CatalogPage = () => {
  const { id } = useParams();
  const [filters, setFilters] = useState({
    categoryId: id ? parseInt(id) : null,
    minPrice: null,
    maxPrice: null,
    title: "",
    ownProduct: false,
    properties: null,

    sortBy: "DESC",
    sortOrder: "DESC",
    paymentType: null,
    currencyType: null,
    negotiable: true,
    regionId: null,
    districtId: null,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState({});
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortOption, setSortOption] = useState({ field: null, order: null });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch category details
  const { data: categoryData } = useGetAllQuery({
    key: `category_${id}`,
    url: `/category/${id}`,
    enabled: !!id,
  });

  const category = get(categoryData, "data.content", {});

  // Fetch category properties for filtering
  const { data: propertiesData } = useGetAllQuery({
    key: `/category/${id}/properties`,
    url: `/category/${id}/properties`,
    enabled: !!id,
  });

  const properties = isArray(get(propertiesData, "data.content", []))
    ? get(propertiesData, "data.content", [])
    : [];
  // Fetch products with filters
  // console.log(properties);

  const { data, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteScrollQuery({
      key: `${KEYS.product_filter}_${id}_${JSON.stringify(filters)}`,
      url: URLS.product_filter,
      elements: filters,
      initialPageParam: 1,
    });

  const items = isArray(get(data, "pages", []))
    ? data?.pages.flatMap((page) => page?.content?.data || []).flat()
    : [];

  // Update filters when category ID changes
  useEffect(() => {
    if (id) {
      setFilters((prev) => ({
        ...prev,
        categoryId: parseInt(id),
      }));
      // Reset other filters when category changes
      setSelectedProperties({});
      setPriceRange({ min: "", max: "" });
      setSortOption({ field: null, order: null });
    }
  }, [id]);

  // Apply filters
  const applyFilters = () => {
    const propertyFilters = {};

    // Convert selected properties to the format expected by the API
    Object.entries(selectedProperties).forEach(([key, value]) => {
      if (value) {
        propertyFilters[key] = value;
      }
    });

    const updatedFilters = {
      ...filters,
      properties:
        Object.keys(propertyFilters).length > 0 ? propertyFilters : null,
      minPrice: priceRange.min ? Number(priceRange.min) : null,
      maxPrice: priceRange.max ? Number(priceRange.max) : null,
      title: searchQuery || "",
      sortBy: sortOption.field,
      sortOrder: sortOption.order,
    };

    setFilters(updatedFilters);
    setMobileFiltersOpen(false);
  };

  // Handle property selection
  const handlePropertyChange = (name, value) => {
    setSelectedProperties((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle price range changes
  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handle sort option change
  const handleSortChange = (field) => {
    setSortOption((prev) => {
      if (prev.field === field) {
        // Toggle order if same field
        return { field, order: prev.order === "ASC" ? "DESC" : "ASC" };
      }
      // Default to ASC for new field
      return { field, order: "ASC" };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedProperties({});
    setPriceRange({ min: "", max: "" });
    setSortOption({ field: null, order: null });
    setSearchQuery("");
    setFilters({
      categoryId: id ? parseInt(id) : null,
      minPrice: null,
      maxPrice: null,
      title: "",
      ownProduct: false,
      properties: null,
      sortBy: "DESC",
      sortOrder: "DESC",
      paymentType: null,
      currencyType: null,
      negotiable: true,
      regionId: null,
      districtId: null,
    });
  };

  // Empty state when no items are found
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-teal-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Hech qanday mahsulot topilmadi
      </h3>
      <p className="text-gray-500 max-w-md">
        Hozircha bu toifada mahsulotlar mavjud emas. Iltimos, keyinroq qayta
        tekshiring yoki boshqa toifani tanlang.
      </p>
    </div>
  );

  // Loading skeleton for initial load
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 gap-y-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-sm overflow-hidden bg-white"
        >
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (priceRange.min || priceRange.max) count++;
    if (searchQuery) count++;
    if (sortOption.field) count++;
    count += Object.keys(selectedProperties).length;
    return count;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">
            Bosh sahifa
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          {category?.parent && (
            <>
              <Link
                to={`/catalog/${category.parent.id}`}
                className="hover:text-teal-600 transition-colors"
              >
                {category.parent.name}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
            </>
          )}
          <span className="text-gray-700 font-medium">{category?.name}</span>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>

          {/* Subcategories */}
          {category?.children && category.children.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {category.children.map((subcat) => (
                <Link
                  key={subcat.id}
                  to={`/catalog/${subcat.id}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-600 rounded-full text-sm font-medium transition-colors"
                >
                  {subcat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-teal-500" />
                  Filtrlar
                </h2>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3">
                  Narx oralig'i
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Property Filters */}
              {properties.map((property) => (
                <div key={property.id}>
                  <h3 className="font-medium text-gray-700 mb-3">
                    {property.name}
                  </h3>
                  {property.type === "SELECT" && property.options && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      value={selectedProperties[property.name] || ""}
                    >
                      <option value="">Tanlang</option>
                      {property.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {property.type === "STRING" && (
                    <input
                      type="text"
                      placeholder={`${property.name} qiymati`}
                      value={selectedProperties[property.name] || ""}
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  )}
                  {property.type === "INTEGER" && (
                    <input
                      type="number"
                      placeholder={`${property.name} qiymati`}
                      value={selectedProperties[property.name] || ""}
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  )}
                  {property.type === "DOUBLE" && (
                    <input
                      type="number"
                      placeholder={`${property.name} qiymati`}
                      value={selectedProperties[property.name] || ""}
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  )}
                  {property.type === "BOOLEAN" && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      onChange={(e) =>
                        handlePropertyChange(property.name, e.target.value)
                      }
                      value={selectedProperties[property.name] || ""}
                    >
                      <option value="">Tanlang</option>
                      <option value="true">Ha</option>
                      <option value="false">Yo'q</option>
                    </select>
                  )}
                </div>
              ))}

              <div className="p-4">
                <button
                  onClick={applyFilters}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Qo'llash
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors">
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      <span>Saralash</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                      <div className="py-1">
                        <button
                          onClick={() => handleSortChange("price")}
                          className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${
                            sortOption.field === "price"
                              ? "bg-teal-50 text-teal-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>Narx</span>
                          {sortOption.field === "price" && (
                            <span>
                              {sortOption.order === "ASC" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleSortChange("createdAt")}
                          className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${
                            sortOption.field === "createdAt"
                              ? "bg-teal-50 text-teal-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>Sana</span>
                          {sortOption.field === "createdAt" && (
                            <span>
                              {sortOption.order === "ASC" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleSortChange("viewCount")}
                          className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${
                            sortOption.field === "viewCount"
                              ? "bg-teal-50 text-teal-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>Ko'rishlar soni</span>
                          {sortOption.field === "viewCount" && (
                            <span>
                              {sortOption.order === "ASC" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-md">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-l-md ${
                        viewMode === "grid"
                          ? "bg-teal-500 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-r-md ${
                        viewMode === "list"
                          ? "bg-teal-500 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center space-x-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-1" />
                    <span>Filtrlar</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="ml-1 bg-white text-teal-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {getActiveFilterCount() > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchQuery && (
                    <div className="flex items-center bg-teal-50 text-teal-700 text-xs rounded-full px-3 py-1">
                      <span>Qidiruv: {searchQuery}</span>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 text-teal-500 hover:text-teal-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {(priceRange.min || priceRange.max) && (
                    <div className="flex items-center bg-teal-50 text-teal-700 text-xs rounded-full px-3 py-1">
                      <span>
                        Narx: {priceRange.min || "0"} - {priceRange.max || "∞"}
                      </span>
                      <button
                        onClick={() => setPriceRange({ min: "", max: "" })}
                        className="ml-1 text-teal-500 hover:text-teal-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {sortOption.field && (
                    <div className="flex items-center bg-teal-50 text-teal-700 text-xs rounded-full px-3 py-1">
                      <span>
                        Saralash:{" "}
                        {sortOption.field === "price"
                          ? "Narx"
                          : sortOption.field === "createdAt"
                          ? "Sana"
                          : "Ko'rishlar"}
                        {sortOption.order === "ASC"
                          ? " (o'sish)"
                          : " (kamayish)"}
                      </span>
                      <button
                        onClick={() =>
                          setSortOption({ field: null, order: null })
                        }
                        className="ml-1 text-teal-500 hover:text-teal-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {Object.entries(selectedProperties).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center bg-teal-50 text-teal-700 text-xs rounded-full px-3 py-1"
                    >
                      <span>
                        {key}:{" "}
                        {typeof value === "object"
                          ? `${value.min || "0"} - ${value.max || "∞"}`
                          : value}
                      </span>
                      <button
                        onClick={() => {
                          const newProps = { ...selectedProperties };
                          delete newProps[key];
                          setSelectedProperties(newProps);
                        }}
                        className="ml-1 text-teal-500 hover:text-teal-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={clearFilters}
                    className="flex items-center bg-gray-200 text-gray-700 text-xs rounded-full px-3 py-1 hover:bg-gray-300 transition-colors"
                  >
                    <span>Barcha filtrlarni tozalash</span>
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              // Loading skeleton
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                } gap-4`}
              >
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items?.length === 0 ? (
              // Empty state
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Mahsulotlar topilmadi
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Ushbu kategoriyada mahsulotlar mavjud emas yoki filtrlar
                  bo'yicha hech qanday natija topilmadi.
                </p>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            ) : isLoading ? (
              renderSkeletons()
            ) : items?.length === 0 ? (
              renderEmptyState()
            ) : (
              <InfiniteScroll
                dataLength={items?.length || 0}
                next={fetchNextPage}
                hasMore={hasNextPage}
                scrollThreshold={0.9} // optional: 90% scrollda trigger bo‘ladi
                loader={renderSkeletons()}
                endMessage={
                  <div className="text-center py-6 text-gray-500">
                    Barcha mahsulotlar yuklandi
                  </div>
                }
              >
                <div
                  className={
                    viewMode === "grid"
                      ? `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6`
                      : `flex flex-col space-y-4`
                  }
                >
                  {items?.map((item, index) => (
                    <div
                      key={item?.id || index}
                      className={viewMode === "list" ? "w-full" : ""}
                    >
                      <ItemCard item={item} index={index} viewMode={viewMode} />
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileFiltersOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-teal-500" />
                    Filtrlar
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Narx oralig'i
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          handlePriceChange("min", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          handlePriceChange("max", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Property Filters */}
                  {properties.map((property) => (
                    <div key={property.id} className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">
                        {property.name}
                      </h3>

                      {/* STRING va INT uchun text input */}
                      {(property.type === "STRING" ||
                        property.type === "INT") && (
                        <input
                          type="text"
                          placeholder={`${property.name} qiymati`}
                          value={selectedProperties[property.name] || ""}
                          onChange={(e) =>
                            handlePropertyChange(property.name, e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        />
                      )}

                      {/* BOOLEAN uchun checkbox */}
                      {property.type === "BOOLEAN" && (
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedProperties[property.name] || false}
                            onChange={(e) =>
                              handlePropertyChange(
                                property.name,
                                e.target.checked
                              )
                            }
                            className="form-checkbox text-teal-600"
                          />
                          <span className="text-sm text-gray-700">Ha</span>
                        </label>
                      )}

                      {/* SELECT uchun select box */}
                      {property.type === "SELECT" && (
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          onChange={(e) =>
                            handlePropertyChange(property.name, e.target.value)
                          }
                          value={selectedProperties[property.name] || ""}
                        >
                          <option value="">Tanlang</option>
                          {property.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 px-4 py-4 space-y-3">
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Filtrlarni tozalash
                    </button>
                  )}
                  <button
                    onClick={applyFilters}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Qo'llash
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
