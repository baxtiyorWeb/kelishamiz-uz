/* eslint-disable react/prop-types */
import { get, isArray, useMemo } from "lodash";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import ItemCard from "../../../common/components/ItemCard";
import KEYS from "../../../export/keys";
import URLS from "../../../export/urls";
import useInfiniteScrollQuery from "../../../hooks/api/useInfiniteScrollQuery";
import { Sparkles } from "lucide-react";

/**
 * Mahsulot tavsiyalarini (recommendation) cheksiz yuklash (Infinite Scroll) komponenti.
 * Bu komponent asosiy filterlar o'zgarishiga qarab API'ga so'rov yuboradi.
 * * @param {Array<Object>} addFilter - Tashqi manbadan kelayotgan qo'shimcha filterlar.
 */
const Recommenduem = ({ addFilter = [] }) => {
  const { id } = useParams();
  const categoryId = Number(id);

  // Filterlarni API'ga mos formatga keltiramiz
  const apiPayload = useMemo(() => {
    // APIga yuborilishi kerak bo'lgan filter obyektini tuzish
    const valueFilter = addFilter.map((item) => ({
      key: item.name, // Agar itemda name fieldi bo'lsa
      value: item.filter,
    }));

    // Narx oralig'i (min/max) uchun alohida maydonlar kiritish logikasi
    // Agar min/max alohida fieldlar sifatida uzatilmasa (backend talabiga qarab formatlanadi)
    // Hozirgi kiritilgan kodda bu juda murakkab tuzilgan edi, soddalashtiramiz.
    const propertiesArray = [];
    let minPrice = null;
    let maxPrice = null;
    
    valueFilter.forEach(f => {
      if (typeof f.value === 'object' && f.value !== null && (f.value.min !== undefined || f.value.max !== undefined)) {
        // Bu narx oralig'i deb taxmin qilamiz
        minPrice = f.value.min ? Number(f.value.min) : null;
        maxPrice = f.value.max ? Number(f.value.max) : null;
      } else if (f.value !== null && f.value !== "") {
        // Bu oddiy xususiyat
        propertiesArray.push({ key: f.key, value: f.value });
      }
    });

    return {
      search: "",
      size: 8, // Bitta yuklashda 8 ta item yuklasin
      categoryId: categoryId,
      // districtId, regionId, paymentTypeId va h.k. agar kerak bo'lsa
      valueFilter: propertiesArray, // Xususiyatlarni array sifatida yuborish
      minPrice: minPrice, 
      maxPrice: maxPrice,
      // API'ga mos boshqa default qiymatlar
      districtId: 0, 
      regionId: 0,
      paymentTypeId: 0,
      sellTypeId: 0,
      ownProducts: false,
      userId: 0,
      productIdList: [],
    };
  }, [addFilter, categoryId]);

  // Cheksiz yuklash uchun API so'rovi
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading, // Birinchi yuklanish
    isFetchingNextPage, // Keyingi sahifani yuklash
  } = useInfiniteScrollQuery({
    // So'rov key'i, filterlar o'zgarganda so'rov qayta yuborilishi uchun
    key: `${KEYS.product_list}_recommend_${categoryId}_${JSON.stringify(apiPayload)}`,
    url: URLS.product_list,
    method: "POST", // Agar backend post bo'lsa
    elements: apiPayload,
  });

  // Natijalarni birlashtiramiz
  const items = isArray(get(data, "pages", []))
    ? get(data, "pages", []).flatMap((page) => page?.content?.data || []) // API javobining ichki data qismidan olish
    : [];

  // --- SKELETON LOADER QISMI ---
  const renderSkeletons = (count) => (
    [...Array(count)].map((_, i) => (
      <div 
        key={i} 
        className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse border border-gray-100"
      >
        {/* Rasm joyi */}
        <div className="aspect-square bg-gray-200"></div>
        {/* Matn joylari */}
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          <div className="h-5 bg-purple-100 rounded w-1/3 mt-2"></div>
        </div>
      </div>
    ))
  );

  // Skelet yuklashda nechta element ko'rsatilishi kerakligini aniqlaymiz
  const skeletonCount = isFetchingNextPage ? 4 : 8;
  const showInitialLoading = isLoading && items.length === 0;

  // Kontent yo'qligi haqida xabar
  const showNoContent = !isLoading && items.length === 0;
  
  return (
    <div className="pt-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        <Sparkles className="w-5 h-5 text-purple-500 inline mr-2" /> Tavsiya etilgan mahsulotlar
      </h2>

      {showInitialLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderSkeletons(skeletonCount)}
        </div>
      ) : showNoContent ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">Tavsiya uchun mahsulotlar topilmadi.</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={items.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
              {renderSkeletons(4)} 
            </div>
          }
          endMessage={
            <p className="text-center py-8 text-sm text-gray-400">
              {items.length > 0 ? "✨ Barcha tavsiyalar yuklandi" : ""}
            </p>
          }
          style={{ overflow: "visible" }} // InfiniteScroll scrollbar hosil qilmasligi uchun
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <ItemCard key={item.id || index} item={item} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Recommenduem;