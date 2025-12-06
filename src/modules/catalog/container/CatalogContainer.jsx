import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { get, isArray, debounce } from "lodash";
import { Clock, DollarSign, Eye, Search, X } from "lucide-react";

import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import useGetAllQuery from "../../../hooks/api/useGetAllQuery";
import useInfiniteScrollQuery from "../../../hooks/api/useInfiniteScrollQuery";
import CatalogBreadCrumbs from "../components/CatalogBreadCrumbs";
import CatalogFilter from "../components/CatalogFilter";
import MobileCatalogFilter from "../components/MobileCatalogFilter";
import Container from "../../../common/components/Container";

const CatalogPage = () => {
  // ==================== URL PARAMETRLARI ====================
  const { id } = useParams();
  const categoryId = id ? Number(id) : null;
  const [searchParams, setSearchParams] = useSearchParams();

  // URL dan qidiruv so'zini olish
  const urlSearch = searchParams.get("search") || "";

  // ==================== STATE'LAR ====================
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedProperties, setSelectedProperties] = useState({});
  const [sortOption, setSortOption] = useState({
    field: "createdAt",
    order: "DESC",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [viewMode, setViewMode] = useState("grid");

  // ==================== API KATEGORIYA MA'LUMOTLARI ====================
  const { data: categoryData } = useGetAllQuery({
    key: `category_${categoryId}`,
    url: `/category/${categoryId}`,
    enabled: !!categoryId,
  });
  const category = get(categoryData, "data.content", {});

  // ==================== KATEGORIYA XUSUSIYATLARI ====================
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

  // ==================== API PAYLOAD YARATISH ====================
  const apiPayload = useMemo(() => {
    const formattedProperties = Object.entries(selectedProperties)
      .filter(([_, value]) => value !== "" && value !== null)
      .map(([key, value]) => ({ key, value }));

    return {
      categoryId,
      title: searchQuery.trim() || null, // Bo'sh bo'lsa null yuborish
      minPrice: priceRange.min ? Number(priceRange.min) : null,
      maxPrice: priceRange.max ? Number(priceRange.max) : null,
      properties: formattedProperties,
      sortBy: sortOption.field,
      sortOrder: sortOption.order,
      page: 1,
      pageSize: 10,
    };
  }, [categoryId, searchQuery, priceRange, selectedProperties, sortOption]);

  // ==================== MAHSULOTLARNI YUKLASH ====================
  const queryKey = useMemo(() => {
    return `${KEYS.product_filter}_${categoryId}_${JSON.stringify(apiPayload)}`;
  }, [categoryId, apiPayload]);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useInfiniteScrollQuery({
      key: queryKey,
      url: URLS.product_filter,
      method: "POST",
      elements: apiPayload,
      initialPageParam: 1,
    });

  // ==================== MAHSULOTLAR RO'YXATI ====================
  const items = useMemo(
    () => data?.pages?.flatMap((page) => page?.content?.data || []) || [],
    [data]
  );

  // ==================== URL BILAN SINXRONLASHTIRISH ====================

  // 1. searchQuery o'zgarganda URL ni yangilash
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";

    if (searchQuery && searchQuery !== currentSearch) {
      searchParams.set("search", searchQuery);
      setSearchParams(searchParams, { replace: true });
    } else if (!searchQuery && currentSearch) {
      searchParams.delete("search");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchQuery]);

  // 2. URL search o'zgarganda state ni yangilash (browser back/forward)
  useEffect(() => {
    const newUrlSearch = searchParams.get("search") || "";
    if (newUrlSearch !== searchQuery) {
      setSearchQuery(newUrlSearch);
    }
  }, [searchParams.get("search")]);

  // 3. Kategoriya o'zgarganda faqat boshqa filtrlarni reset qilish
  useEffect(() => {
    if (categoryId) {
      setPriceRange({ min: "", max: "" });
      setSelectedProperties({});
      setSortOption({ field: "createdAt", order: "DESC" });
      // searchQuery saqlanadi - kategoriya o'zgarganda ham qidiruv saqlanib qoladi
    }
  }, [categoryId]);

  // ==================== HANDLER FUNKSIYALAR ====================

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handlePriceChange = useCallback((type, value) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  }, []);

  const handlePropertyChange = useCallback((name, value) => {
    setSelectedProperties((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleFilterExpand = useCallback((name) => {
    setExpandedFilters((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleSortChange = useCallback((value) => {
    if (!value) return;
    const [field, order] = value.split("_");
    setSortOption({ field, order });
  }, []);

  // Barcha filtrlarni tozalash
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setSelectedProperties({});
    setSortOption({ field: "createdAt", order: "DESC" });

    // URL dan ham search parametrini o'chirish
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("search");
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Mobil filtrlarni qo'llash
  const applyMobileFilters = useCallback(() => {
    setMobileFiltersOpen(false);
    // State lar allaqachon o'zgargan, query avtomatik yangilanadi
  }, []);

  // Faol filtrlar sonini hisoblash
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (searchQuery) count++;
    if (priceRange.min || priceRange.max) count++;
    if (sortOption.field !== "createdAt" || sortOption.order !== "DESC")
      count++;
    count += Object.keys(selectedProperties).filter(
      (key) =>
        selectedProperties[key] !== "" && selectedProperties[key] !== null
    ).length;
    return count;
  }, [searchQuery, priceRange, sortOption, selectedProperties]);

  // ==================== SKELETON LOADING ====================

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
          className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== SORTLASH VARIANTLARI ====================

  const sortOptions = [
    { value: "createdAt_DESC", label: "Yangi e'lonlar" },
    { value: "price_ASC", label: "Narx: Arzonrog'i" },
    { value: "price_DESC", label: "Narx: Qimmatrog'i" },
    { value: "title_ASC", label: "Nom bo'yicha (A-Z)" },
  ];

  // ==================== UMUMIY PROPS ====================

  const commonProps = {
    searchQuery,
    setSearchQuery: handleSearchChange,
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

  // ==================== SARLAVHA GENERATSIYA ====================

  const pageTitle = useMemo(() => {
    if (id && category?.name) {
      if (searchQuery) {
        return `${category.name} - "${searchQuery}"`;
      }
      return category.name;
    }
    if (!id && searchQuery) {
      return `Qidiruv: "${searchQuery}"`;
    }
    if (!id && !searchQuery) {
      return "Barcha Mahsulotlar";
    }
    return id ? `Kategoriya #${id}` : "Katalog";
  }, [id, category, searchQuery]);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogBreadCrumbs id={id} category={category} />

      <div className="bg-gradient-to-r mx-auto  rounded-xl mb-3 from-white to-purple-50/40 border-b border-gray-100">
        <Container>
          <div className="flex flex-col py-3 md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {pageTitle}
              </h1>
              {items.length > 0 && !isLoading && (
                <p className="text-sm text-gray-600">
                  Jami {items.length} ta mahsulot topildi
                  {hasNextPage && " (ko'proq yuklanmoqda...)"}
                </p>
              )}
            </div>

            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 font-medium text-sm"
                aria-label="Barcha filtrlarni tozalash"
              >
                <X className="w-4 h-4" />
                Filtrlarni tozalash ({getActiveFilterCount()})
              </button>
            )}
          </div>

          {category?.children?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {category.children.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/catalog/${sub.id}${
                      searchQuery
                        ? `?search=${encodeURIComponent(searchQuery)}`
                        : ""
                    }`}
                    className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 rounded-full whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>

      <CatalogFilter
        {...commonProps}
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
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

      <style>{`
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
