"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useQuery } from "react-query";
import api from "./../../config/auth/api"; // Adjust the import path as necessary
// Mock API function for demonstration
const fetchBanners = async () => {
  const response = await api.get("/banners/public/active?placement=home_hero");
  if (response.status !== 200 || !response.data) {
    throw new Error("Bannerlarni yuklashda xatolik yuz berdi.");
  }
  // Agar API bevosita massiv qaytarsa, shunday bo'ladi:
  return response.data?.content; // <--- ?.content ni olib tashlang
};

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const {
    data: slides,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activeBanners", "home_hero"],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const hasSlides = slides && slides.length > 0;
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasSlides) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) goToNextSlide();
    if (isRightSwipe) goToPrevSlide();
  };

  const goToNextSlide = useCallback(() => {
    if (hasSlides) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  }, [slides, hasSlides]);

  const goToPrevSlide = useCallback(() => {
    if (hasSlides) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides, hasSlides]);

  useEffect(() => {
    if (!isHovering && hasSlides) {
      const interval = setInterval(goToNextSlide, 4000);
      return () => clearInterval(interval);
    }
  }, [goToNextSlide, isHovering, hasSlides]);

  if (isLoading) {
    return (
      <div className="my-6">
        <div className="relative w-full h-[40vh] max-h-[400px] min-h-[280px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300/50 to-transparent animate-pulse" />
          <div className="absolute bottom-6 left-6 space-y-3">
            <div className="h-8 w-48 bg-white/30 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-white/20 rounded animate-pulse" />
            <div className="h-10 w-24 bg-white/25 rounded-lg animate-pulse" />
          </div>
          <div className="absolute bottom-6 right-6 flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/30 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !hasSlides) return null;

  return (
    <div className="my-6">
      <div
        className="relative w-full h-[40vh] max-h-[400px] min-h-[280px] overflow-hidden rounded-2xl  group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Container */}
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="min-w-full h-full relative">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="text-white p-8 md:p-28 max-w-lg space-y-4">
                    {slide.title && (
                      <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                        {slide.title}
                      </h2>
                    )}
                    {slide.description && (
                      <p className="text-lg md:text-xl leading-relaxed text-white/90">
                        {slide.description}
                      </p>
                    )}
                    {slide.linkUrl && (
                      <a
                        href={slide.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        Learn More
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Enhanced Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentIndex
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
};

export default Banner;
