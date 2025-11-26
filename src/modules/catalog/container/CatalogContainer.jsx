"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get, isArray } from "lodash";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ArrowUpDown,
  Grid3X3,
  List,
  Filter,
  ChevronRight,
  ChevronDown,
  Home,
  TrendingUp,
  Clock,
  Eye,
  DollarSign,
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
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState({ field: null, order: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});

  // Fetch category details
  const { data: categoryData } = useGetAllQuery({
    key: `category_${id}`,
    url: `/category/${id}`,
    enabled: !!id,
  });

  const category = get(categoryData, "data.content", {});

  // Fetch category properties
  const { data: propertiesData } = useGetAllQuery({
    key: `/category/${id}/properties`,
    url: `/category/${id}/properties`,
    enabled: !!id,
  });

  const properties = isArray(get(propertiesData, "data.content", []))
    ? get(propertiesData, "data.content", [])
    : [];

  // Fetch products
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteScrollQuery({
    key: `${KEYS.product_filter}_${id}_${JSON.stringify(filters)}`,
    url: URLS.product_filter,
    elements: filters,
    initialPageParam: 1,
  });

  const items = isArray(get(data, "pages", []))
    ? data?.pages.flatMap((page) => page?.content?.data || []).flat()
    : [];

  useEffect(() => {
    if (id) {
      setFilters((prev) => ({ ...prev, categoryId: parseInt(id) }));
      setSelectedProperties({});
      setPriceRange({ min: "", max: "" });
      setSortOption({ field: null, order: null });
    }
  }, [id]);

  const applyFilters = () => {
    const propertyFilters = {};
    Object.entries(selectedProperties).forEach(([key, value]) => {
      if (value) propertyFilters[key] = value;
    });

    const updatedFilters = {
      ...filters,
      properties: Object.keys(propertyFilters).length > 0 ? propertyFilters : null,
      minPrice: priceRange.min ? Number(priceRange.min) : null,
      maxPrice: priceRange.max ? Number(priceRange.max) : null,
      title: searchQuery || "",
      sortBy: sortOption.field,
      sortOrder: sortOption.order,
    };

    setFilters(updatedFilters);
    setMobileFiltersOpen(false);
  };

  const handlePropertyChange = (name, value) => {
    setSelectedProperties((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const handleSortChange = (field) => {
    setSortOption((prev) => {
      if (prev.field === field) {
        return { field, order: prev.order === "ASC" ? "DESC" : "ASC" };
      }
      return { field, order: "DESC" };
    });
    setShowSortDropdown(false);
  };

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

  const getActiveFilterCount = () => {
    let count = 0;
    if (priceRange.min || priceRange.max) count++;
    if (searchQuery) count++;
    if (sortOption.field) count++;
    count += Object.keys(selectedProperties).length;
    return count;
  };

  const toggleFilterExpand = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const sortOptions = [
    { field: "createdAt", label: "Yangi e'lonlar", icon: Clock },
    { field: "price", label: "Narx bo'yicha", icon: DollarSign },
    { field: "viewCount", label: "Mashhur e'lonlar", icon: Eye },
  ];

  const renderSkeletons = () => (
    <div className={`grid ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4`}>
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-full animate-pulse w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const FilterSection = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>Bosh sahifa</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {category?.parent && (
              <>
                <Link
                  to={`/catalog/${category.parent.id}`}
                  className="text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {category.parent.name}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            <span className="text-gray-900 font-medium">{category?.name}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{category?.name}</h1>
          
          {/* Subcategories */}
          {category?.children && category.children.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {category.children.map((subcat) => (
                <Link
                  key={subcat.id}
                  to={`/catalog/${subcat.id}`}
                  className="flex-shrink-0 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap"
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
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Filter Header */}
              <FilterSection>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    Filtrlar
                  </h2>
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Tozalash ({getActiveFilterCount()})
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-300 outline-none"
                  />
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Narx oralig'i
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                  />
                  <span className="text-gray-400 font-medium">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </FilterSection>

              {/* Properties */}
              {properties.map((property) => (
                <FilterSection key={property.id}>
                  <button
                    onClick={() => toggleFilterExpand(property.name)}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">{property.name}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        expandedFilters[property.name] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {(!expandedFilters[property.name] || expandedFilters[property.name]) && (
                    <div className="space-y-2">
                      {property.type === "SELECT" && property.options && (
                        <select
                          className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                          onChange={(e) => handlePropertyChange(property.name, e.target.value)}
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
                          placeholder={`${property.name} kiriting`}
                          value={selectedProperties[property.name] || ""}
                          onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                        />
                      )}
                      
                      {(property.type === "INTEGER" || property.type === "DOUBLE") && (
                        <input
                          type="number"
                          placeholder={`${property.name} kiriting`}
                          value={selectedProperties[property.name] || ""}
                          onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                        />
                      )}
                      
                      {property.type === "BOOLEAN" && (
                        <select
                          className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                          onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                          value={selectedProperties[property.name] || ""}
                        >
                          <option value="">Tanlang</option>
                          <option value="true">Ha</option>
                          <option value="false">Yo'q</option>
                        </select>
                      )}
                    </div>
                  )}
                </FilterSection>
              ))}

              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl"
              >
                Filtrlarni qo'llash
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Sort Options */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = sortOption.field === option.field;
                    return (
                      <button
                        key={option.field}
                        onClick={() => handleSortChange(option.field)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                        {isActive && (
                          <span className="text-xs">
                            {sortOption.order === "DESC" ? "↓" : "↑"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* View Mode & Mobile Filter */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all duration-300 ${
                        viewMode === "grid"
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all duration-300 ${
                        viewMode === "list"
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-emerald-500/30"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filtrlar
                    {getActiveFilterCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
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
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      <Search className="w-3.5 h-3.5" />
                      {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  
                  {(priceRange.min || priceRange.max) && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      {priceRange.min || "0"} - {priceRange.max || "∞"}
                      <button onClick={() => setPriceRange({ min: "", max: "" })} className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  
                  {Object.entries(selectedProperties).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      {key}: {value}
                      <button
                        onClick={() => {
                          const newProps = { ...selectedProperties };
                          delete newProps[key];
                          setSelectedProperties(newProps);
                        }}
                        className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Products */}
            {isLoading ? (
              renderSkeletons()
            ) : items?.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mahsulotlar topilmadi</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Ushbu kategoriyada mahsulotlar mavjud emas yoki filtrlar bo'yicha natija yo'q
                </p>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            ) : (
              <InfiniteScroll
                dataLength={items?.length || 0}
                next={fetchNextPage}
                hasMore={hasNextPage}
                scrollThreshold={0.9}
                loader={renderSkeletons()}
                endMessage={
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm text-gray-600 font-medium">
                      <Check className="w-5 h-5 text-emerald-600" />
                      Barcha mahsulotlar yuklandi
                    </div>
                  </div>
                }
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "flex flex-col space-y-4"
                  }
                >
                  {items?.map((item, index) => (
                    <div key={item?.id || index} className={viewMode === "list" ? "w-full" : ""}>
                      <ItemCard item={item} index={index} viewMode={viewMode} />
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-6 h-6 text-emerald-600" />
                Filtrlar
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Price Range */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Narx oralig'i
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                  <span className="text-gray-400 font-medium">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Properties */}
              {properties.map((property) => (
                <div key={property.id} className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{property.name}</h3>
                  
                  {property.type === "SELECT" && property.options && (
                    <select
                      className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                      value={selectedProperties[property.name] || ""}
                    >
                      <option value="">Tanlang</option>
                      {property.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {property.type === "STRING" && (
                    <input
                      type="text"
                      placeholder={`${property.name} kiriting`}
                      value={selectedProperties[property.name] || ""}
                      onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  )}
                  
                  {(property.type === "INTEGER" || property.type === "DOUBLE") && (
                    <input
                      type="number"
                      placeholder={`${property.name} kiriting`}
                      value={selectedProperties[property.name] || ""}
                      onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  )}
                  
                  {property.type === "BOOLEAN" && (
                    <select
                      className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                      value={selectedProperties[property.name] || ""}
                    >
                      <option value="">Tanlang</option>
                      <option value="true">Ha</option>
                      <option value="false">Yo'q</option>
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl transition-all duration-300"
                >
                  Filtrlarni tozalash ({getActiveFilterCount()})
                </button>
              )}
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30"
              >
                Natijalarni ko'rish ({items?.length || 0})
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CatalogPage;