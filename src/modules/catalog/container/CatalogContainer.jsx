"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get, isArray } from "lodash";
import {
  Search,
  X,
  DollarSign,
  Clock,
  Eye,
  Grid3X3,
  List,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import useInfiniteScrollQuery from "../../../hooks/api/useInfiniteScrollQuery";
import ItemCard from "../../../common/components/ItemCard";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import CatalogBreadCrumbs from "../components/CatalogBreadCrumbs";
import CatalogFilter from "../components/CatalogFilter";
import MobileCatalogFilter from "../components/MobileCatalogFilter";

const CatalogPage = () => {
  const { id } = useParams();

  // ========== FILTER STATE ==========
  const [filters, setFilters] = useState({
    categoryId: id ? parseInt(id) : null,
    minPrice: null,
    maxPrice: null,
    title: "",
    ownProduct: false,
    properties: null,
    sortBy: null,
    sortOrder: null,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState({ field: null, order: null });
  const [expandedFilters, setExpandedFilters] = useState({});

  // ========== API ==========
  const { data: categoryData } = useGetAllQuery({
    key: `category_${id}`,
    url: `/category/${id}`,
    enabled: !!id,
  });
  const category = get(categoryData, "data.content", {});

  const { data: propertiesData } = useGetAllQuery({
    key: `/category/${id}/properties`,
    url: `/category/${id}/properties`,
    enabled: !!id,
  });
  const properties = isArray(get(propertiesData, "data.content", []))
    ? get(propertiesData, "data.content", [])
    : [];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteScrollQuery({
    key: `${KEYS.product_filter}_${id}_${JSON.stringify(filters)}`,
    url: URLS.product_filter,
    elements: filters,
    initialPageParam: 1,
  });

  const items = data?.pages?.flatMap((page) => page?.content?.data || []) || [];

  useEffect(() => {
    if (id) {
      setFilters((prev) => ({ ...prev, categoryId: parseInt(id) }));
      setSelectedProperties({});
      setPriceRange({ min: "", max: "" });
      setSearchQuery("");
      setSortOption({ field: null, order: null });
    }
  }, [id]);

  // ========== HANDLERS ==========
  const applyFilters = () => {
    const propertyFilters = Object.fromEntries(
      Object.entries(selectedProperties).filter(
        ([_, v]) => v !== "" && v !== null
      )
    );

    setFilters({
      ...filters,
      title: searchQuery.trim(),
      minPrice: priceRange.min ? Number(priceRange.min) : null,
      maxPrice: priceRange.max ? Number(priceRange.max) : null,
      properties:
        Object.keys(propertyFilters).length > 0 ? propertyFilters : null,
      sortBy: sortOption.field,
      sortOrder: sortOption.order,
    });

    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setSelectedProperties({});
    setPriceRange({ min: "", max: "" });
    setSearchQuery("");
    setSortOption({ field: null, order: null });
    setFilters({
      ...filters,
      title: "",
      minPrice: null,
      maxPrice: null,
      properties: null,
      sortBy: null,
      sortOrder: null,
    });
  };

  const handlePropertyChange = (name, value) => {
    setSelectedProperties((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const handleSortChange = (field) => {
    setSortOption((prev) => ({
      field,
      order: prev.field === field && prev.order === "DESC" ? "ASC" : "DESC",
    }));
  };

  const toggleFilterExpand = (name) => {
    setExpandedFilters((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (priceRange.min || priceRange.max) count++;
    if (sortOption.field) count++;
    count += Object.values(selectedProperties).filter((v) => v).length;
    return count;
  };

  const sortOptions = [
    { field: "createdAt", label: "Yangi e'lonlar", icon: Clock },
    { field: "price", label: "Narx bo'yicha", icon: DollarSign },
    { field: "viewCount", label: "Mashhur e'lonlar", icon: Eye },
  ];

  const renderSkeletons = () => (
    <div
      className={`grid ${
        viewMode === "grid"
          ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      } gap-4`}
    >
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-5 bg-gray-300 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CatalogBreadCrumbs id={id} category={category} />

      {/* Compact Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg md:text-2xl font-bold text-purple-800 mb-2">
            {category?.name || "Katalog"}
          </h1>

          {category?.children && category.children.length > 0 && (
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {category.children.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/catalog/${sub.id}`}
                    className="flex-shrink-0 px-3 py-1 text-xs md:text-sm
                      text-purple-700 bg-white/80 backdrop-blur
                      border border-purple-200 rounded-full
                      hover:bg-purple-100 hover:border-purple-300
                      transition-all duration-200 whitespace-nowrap
                      shadow-sm hover:shadow"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CatalogFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priceRange={priceRange}
        selectedProperties={selectedProperties}
        sortOption={sortOption}
        viewMode={viewMode}
        setViewMode={setViewMode}
        expandedFilters={expandedFilters}
        properties={properties}
        items={items}
        isLoading={isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        handlePriceChange={handlePriceChange}
        handlePropertyChange={handlePropertyChange}
        handleSortChange={handleSortChange}
        toggleFilterExpand={toggleFilterExpand}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        getActiveFilterCount={getActiveFilterCount}
        setMobileFiltersOpen={setMobileFiltersOpen}
        renderSkeletons={renderSkeletons}
        sortOptions={sortOptions}
        refetch={refetch}
        isProductLiked={(productId) => false}
      />

      <MobileCatalogFilter
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priceRange={priceRange}
        handlePriceChange={handlePriceChange}
        properties={properties}
        selectedProperties={selectedProperties}
        handlePropertyChange={handlePropertyChange}
        getActiveFilterCount={getActiveFilterCount}
        clearFilters={clearFilters}
        applyFilters={applyFilters}
        items={items}
        refetch={refetch}
      />

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