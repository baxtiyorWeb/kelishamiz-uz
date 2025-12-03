"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, X, Check } from "lucide-react"; // Search icon olib tashlandi

const DistrictSelector = ({ districts = [], isOpen, setIsOpen }) => {
  // Boshlang'ich holatni localStorage'dan yuklash
  const [selectedDistricts, setSelectedDistricts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedDistricts");
      try {
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Error parsing selectedDistricts from localStorage", e);
        return [];
      }
    }
    return [];
  });

  // Qidiruv maydoni endi kerak emas, shuning uchun searchTerm o'chirildi.
  const ref = useRef(null);
  const MAX_SELECTION = 3;

  // --- useEffect: Modalni yopish va fonni boshqarish ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Faqat ref.current mavjud bo'lsa va bosish modal ichida bo'lmasa yopish
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      // Fonga scrollni o'chirish
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      // Fonga scrollni qayta yoqish
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setIsOpen]);

  // --- useEffect: Tanlangan tumanlarni localStorage'ga saqlash ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "selectedDistricts",
          JSON.stringify(selectedDistricts)
        );
      } catch (e) {
        console.error("Error saving selectedDistricts to localStorage", e);
      }
    }
  }, [selectedDistricts]);

  // --- Mantiqiy funksiyalar ---

  const toggleDistrict = (id) => {
    setSelectedDistricts((prev) => {
      if (prev.includes(id)) {
        // Tanlovni olib tashlash
        return prev.filter((d) => d !== id);
      } else {
        // Yangi tanlov qo'shish (cheklovni tekshirish)
        if (prev.length >= MAX_SELECTION) {
          return prev; // Cheklovdan oshishga yo'l qo'ymaslik
        }
        return [...prev, id];
      }
    });
  };

  const getDistrictName = (id) => {
    const district = districts?.content?.find((d) => d.id === id);
    return district ? district.name : "Noma'lum";
  };

  const handleRemove = (id) => {
    setSelectedDistricts((prev) => prev.filter((d) => d !== id));
  };

  // Qidiruv olib tashlangani uchun, endi barcha tumanlar ko'rsatiladi
  const allDistricts = districts?.content || [];

  // --- Komponentaning Render Qismi ---
  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        isOpen
          ? "bg-black/50 backdrop-blur-sm"
          : "pointer-events-none bg-transparent"
      }`}
      aria-hidden={!isOpen}
      // Orqa fonni bosilganda yopish (modal o'zi emas, tashqi qismi)
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        // Asosiy Modal uslublari: Telefon uchun to'liq balandlik/kenglikka o'tadi
        className={`fixed top-0 left-0 w-full h-full md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[95%] md:max-w-md bg-white md:rounded-2xl shadow-none md:shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100" // Mobil (h-full)
            : "translate-y-full opacity-0 md:scale-95" // Mobil (pastga tushadi)
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="district-selector-title"
      >
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-4 md:py-5 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3
                id="district-selector-title"
                className="text-lg sm:text-xl font-bold text-white"
              >
                Joylashuvni Tanlash
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Maksimal **{MAX_SELECTION}** tagacha tanlash mumkin
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-4 sm:p-6 flex-1 overflow-y-auto"
          style={{ maxHeight: "calc(100% - 140px)" }}
        >
          {" "}
          {/* Mobil uchun max-height dinamik */}
          {/* Selected Districts (Chips) */}
          {selectedDistricts.length > 0 && (
            <div className="mb-5 border-b border-gray-100 pb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Tanlangan ({selectedDistricts.length}/{MAX_SELECTION})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDistricts.map((id) => {
                  const name = getDistrictName(id);
                  return (
                    <div
                      key={id}
                      className="group flex items-center gap-2 pr-2 pl-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full hover:shadow-md transition-all shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">
                        {name}
                      </span>
                      <button
                        onClick={() => handleRemove(id)}
                        className="w-5 h-5 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center transition-colors opacity-100 group-hover:opacity-100"
                        aria-label={`${name}ni o'chirish`}
                      >
                        <X className="w-3 h-3 text-purple-700" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Districts List */}
          <div className="space-y-2 pb-4 custom-scrollbar">
            {allDistricts.length > 0 ? (
              allDistricts.map((district) => {
                const isSelected = selectedDistricts.includes(district.id);
                const isDisabled =
                  selectedDistricts.length >= MAX_SELECTION && !isSelected;

                return (
                  <label
                    key={district.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all group ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 shadow-sm"
                        : isDisabled
                        ? "bg-gray-50 opacity-50 cursor-not-allowed"
                        : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isSelected}
                          onChange={() => toggleDistrict(district.id)}
                          disabled={isDisabled}
                        />
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-purple-600 border-purple-600"
                              : "border-gray-300 bg-white group-hover:border-purple-400"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white animate-in zoom-in duration-200" />
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isSelected
                            ? "text-purple-700"
                            : isDisabled
                            ? "text-gray-400"
                            : "text-gray-700 group-hover:text-purple-700"
                        }`}
                      >
                        {district.name}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shrink-0" />
                    )}
                  </label>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Tumanlar yuklanmadi
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Ma'lumot manbasini tekshiring
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-3 shadow-lg">
          <button
            onClick={() => setSelectedDistricts([])}
            className="w-full sm:flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-sm sm:text-base"
            disabled={selectedDistricts.length === 0}
          >
            Tozalash
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={selectedDistricts.length === 0}
          >
            Saqlash va Filtrni Qo'llash
          </button>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DistrictSelector;
