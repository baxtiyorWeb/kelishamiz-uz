"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { get, isArray, debounce } from "lodash";
import { Clock, DollarSign, Eye } from "lucide-react";

import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import useInfiniteScrollQuery from "../../../hooks/api/useInfiniteScrollQuery";
import CatalogBreadCrumbs from "../components/CatalogBreadCrumbs";
import CatalogFilter from "../components/CatalogFilter";
import MobileCatalogFilter from "../components/MobileCatalogFilter";

const CatalogPage = () => {
  const { id } = useParams();
  const categoryId = id ? Number(id) : null;

  // --- STATE: UI uchun (Inputlarda ko'rinib turadigan qiymatlar) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedProperties, setSelectedProperties] = useState({});
  const [sortOption, setSortOption] = useState({
    field: "createdAt",
    order: "DESC",
  });

  // Mobile filter ochilganmi?
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [viewMode, setViewMode] = useState("grid");

  // --- STATE: API uchun (Debounce qilingan va formatlangan) ---
  const [apiFilters, setApiFilters] = useState({
    categoryId,
    title: "",
    minPrice: null,
    maxPrice: null,
    properties: [],
    sortBy: "createdAt",
    sortOrder: "DESC",
    page: 1, // useInfiniteScrollQuery uchun 1 deb qoldiramiz
    pageSize: 10,
  });

  // 1. Kategoriyani va Xususiyatlarni (Properties) yuklash
  const { data: categoryData } = useGetAllQuery({
    key: `category_${categoryId}`,
    url: `/category/${categoryId}`,
    enabled: !!categoryId,
  });
  const category = get(categoryData, "data.content", {});

  const { data: propertiesData } = useGetAllQuery({
    key: `/category/${categoryId}/properties`,
    url: `/category/${categoryId}/properties`,
    enabled: !!categoryId,
  });

  const properties = useMemo(() => {
    return isArray(get(propertiesData, "data.content", []))
      ? get(propertiesData, "data.content", [])
      : [];
  }, [propertiesData]);

  const generateApiPayload = useCallback(() => {
    const formattedProperties = Object.entries(selectedProperties)
      .filter(([_, value]) => value !== "" && value !== null)
      .map(([key, value]) => ({ key, value }));

    return {
      categoryId,
      title: searchQuery.trim(),
      minPrice: priceRange.min ? Number(priceRange.min) : null,
      maxPrice: priceRange.max ? Number(priceRange.max) : null,
      properties: formattedProperties,
      sortBy: sortOption.field,
      sortOrder: sortOption.order,
    };
  }, [categoryId, searchQuery, priceRange, selectedProperties, sortOption]);

  useEffect(() => {
    if (mobileFiltersOpen) return;

    const debouncedUpdate = debounce((payload) => {
      setApiFilters((prev) => ({
        ...prev,
        ...payload,
        page: 1,
      }));
    }, 100);

    const payload = generateApiPayload();
    debouncedUpdate(payload);

    return () => debouncedUpdate.cancel();
  }, [
    searchQuery,
    priceRange,
    selectedProperties,
    sortOption,
    mobileFiltersOpen,
    generateApiPayload,
  ]);

  const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
    useInfiniteScrollQuery({
      key: `${KEYS.product_filter}_${categoryId}_${JSON.stringify(apiFilters)}`,
      url: URLS.product_filter,
      method: "POST",
      elements: apiFilters,
      initialPageParam: 1,
    });

  const items = useMemo(
    () => data?.pages?.flatMap((page) => page?.content?.data || []) || [],
    [data]
  );

  console.log(items);

  useEffect(() => {
    if (categoryId) {
      setSearchQuery("");
      setPriceRange({ min: "", max: "" });
      setSelectedProperties({});
      setSortOption({ field: "createdAt", order: "DESC" });
    }
  }, [categoryId]);

  // Handlers
  const handlePriceChange = (type, value) =>
    setPriceRange((prev) => ({ ...prev, [type]: value }));

  const handlePropertyChange = (name, value) =>
    setSelectedProperties((prev) => ({ ...prev, [name]: value }));

  const toggleFilterExpand = (name) =>
    setExpandedFilters((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleSortChange = (value) => {
    if (!value) return;
    const [field, order] = value.split("_");
    setSortOption({ field, order });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setSelectedProperties({});
    setSortOption({ field: "createdAt", order: "DESC" });
  };

  const applyMobileFilters = () => {
    setApiFilters((prev) => ({
      ...prev,
      ...generateApiPayload(),
      page: 1,
    }));
    setMobileFiltersOpen(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (priceRange.min || priceRange.max) count++;
    if (sortOption.field !== "createdAt" || sortOption.order !== "DESC")
      count++;
    count += Object.keys(selectedProperties).length;
    return count;
  };

  const renderSkeletons = () => (
    <div
      className={`grid ${
        viewMode === "grid"
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-1"
      } gap-4`}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl h-64 animate-pulse bg-gray-200"
        ></div>
      ))}
    </div>
  );

  const sortOptions = [
    { value: "createdAt_DESC", label: "Yangi e'lonlar" },
    { value: "price_ASC", label: "Narx: Arzonrog'i" },
    { value: "price_DESC", label: "Narx: Qimmatrog'i" },
    { value: "title_ASC", label: "Nom bo'yicha (A-Z)" },
  ];

  const commonProps = {
    searchQuery,
    setSearchQuery,
    priceRange,
    handlePriceChange,
    selectedProperties,
    handlePropertyChange,
    sortOption,
    handleSortChange,
    expandedFilters,
    toggleFilterExpand,
    properties,
    clearFilters,
    getActiveFilterCount,
    sortOptions,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogBreadCrumbs id={id} category={category} />

      <div className="bg-white border-b border-gray-200 py-4 mb-4 rounded-xl">
        <div className="container mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            {category?.name || "Katalog"}
          </h1>
          {category?.children?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/catalog/${sub.id}`}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full whitespace-nowrap transition"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <CatalogFilter
        {...commonProps}
        items={items}
        isLoading={isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setMobileFiltersOpen={setMobileFiltersOpen}
        renderSkeletons={renderSkeletons}
      />

      <MobileCatalogFilter
        {...commonProps}
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
        applyFilters={applyMobileFilters}
        totalItems={items.length}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CatalogPage;
