import { get, isArray } from "lodash";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
import KEYS from "../../export/keys";
import URLS from "../../export/urls";
import useGetInfinityScrollQuery from "../../hooks/api/useGetInfinityScrollQuery";
import ItemCard from "./ItemCard";
import { useEffect, useState, useCallback } from "react";

const Recommenduem = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const [districtIds, setDistrictIds] = useState([]);

  useEffect(() => {
    const loadDistrictIds = () => {
      try {
        const storedDistricts = localStorage.getItem("selectedDistricts");
        if (storedDistricts) {
          const parsedDistricts = JSON.parse(storedDistricts);
          if (isArray(parsedDistricts) && parsedDistricts.length > 0) {
            setDistrictIds(parsedDistricts);
          } else {
            setDistrictIds([]);
          }
        } else {
          setDistrictIds([]);
        }
      } catch (error) {
        console.error("Error parsing selectedDistricts:", error);
        setDistrictIds([]);
      }
    };

    loadDistrictIds();

    const handleStorageChange = (e) => {
      if (e.key === "selectedDistricts") {
        loadDistrictIds();
      }
    };

    const handleCustomStorageChange = () => {
      loadDistrictIds();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdated", handleCustomStorageChange);
    };
  }, []);

  const { data, fetchNextPage, hasNextPage, refetch, isLoading, isFetching } =
    useGetInfinityScrollQuery({
      key: [KEYS.products, districtIds.join(",")],
      url: URLS.products,
      initialPageParam: 1,
      elements: {
        districtIds: districtIds.length > 0 ? districtIds.join(",") : undefined,
      },
    });

    

  useEffect(() => {
    try {
      const stored = localStorage.getItem("likedProducts");
      if (stored) {
        setLikedProducts(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading liked products:", error);
      setLikedProducts([]);
    }
  }, []);

  useEffect(() => {
    if (districtIds.length >= 0) {
      refetch();
    }
  }, [districtIds, refetch]);

  const isProductLiked = useCallback((productId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return likedProducts.includes(productId);
    } else {
      return (
        data?.pages?.some((page) =>
          get(page, "content.data", []).some(
            (item) => item.id === productId && item.isLike
          )
        ) || false
      );
    }
  }, [data]);

  const items = isArray(get(data, "pages", []))
    ? data?.pages?.flatMap((page) => get(page, "content.data", []))
    : [];

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-purple-50 rounded-full flex items-center justify-center mb-3 md:mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 md:h-12 md:w-12 text-purple-500"
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
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
        Hech qanday mahsulot topilmadi
      </h3>
      <p className="text-sm md:text-base text-gray-500 max-w-md">
        {districtIds.length > 0
          ? "Tanlangan tumanlarda hozircha mahsulotlar mavjud emas."
          : "Hozircha bu toifada mahsulotlar mavjud emas. Iltimos, keyinroq qayta tekshiring yoki boshqa toifani tanlang."}
      </p>
    </div>
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 lg:gap-5 gap-y-4 md:gap-y-6">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-sm overflow-hidden bg-white border border-gray-200"
        >
          <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-2 md:p-4">
            <div className="h-4 md:h-6 bg-gray-200 rounded animate-pulse mb-1.5 md:mb-2"></div>
            <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse mb-1.5 md:mb-2"></div>
            <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse mb-1.5 md:mb-2 w-2/3"></div>
            <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse mb-2 md:mb-4 w-1/4"></div>
            <div className="h-5 md:h-6 bg-gray-200 rounded animate-pulse mb-2 md:mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-7 md:h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-7 w-7 md:h-8 md:w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-6 md:mt-8 lg:mt-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 relative">
          <span className="relative z-10">Tavsiya etilgan mahsulotlar</span>
          <span className="absolute bottom-0 left-0 w-1/2 h-2 md:h-3 bg-purple-100 -z-0"></span>
        </h2>


        <a
          href="/all-products"
          className="text-purple-600 hover:text-purple-700 font-medium flex items-center transition-colors text-xs sm:text-sm md:text-base shrink-0"
        >
          <span className="hidden sm:inline">Barchasini ko'rish</span>
          <span className="sm:hidden">Barchasi</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>

      {isLoading || isFetching ? (
        renderSkeletons()
      ) : items.length === 0 ? (
        renderEmptyState()
      ) : (
        <InfiniteScroll
          dataLength={items.length}
          next={fetchNextPage}
          hasMore={hasNextPage || false}
          scrollThreshold={0.9}
          loader={
            <div className="flex justify-center py-4 md:py-6">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-purple-500" />
            </div>
          }
          endMessage={
            items.length > 0 && (
              <div className="text-center py-4 md:py-6 text-sm md:text-base text-gray-500">
                Barcha mahsulotlar yuklandi
              </div>
            )
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 lg:gap-5 gap-y-4 md:gap-y-6">
            {items.map((item, index) => (
              <ItemCard
                key={`${item?.id}-${index}`}
                item={item}
                index={index}
                isLiked={isProductLiked(item.id)}
                refresh={refetch}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Recommenduem;