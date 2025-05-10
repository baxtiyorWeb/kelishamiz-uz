import { get, isArray } from "lodash";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Sample banner data - replace with your actual data
  const slides = [
    {
      id: 1,
      imageUrl:
        "https://olcha.uz/image/original/sliders/oz/cdn_1/2025-02-13/z2C7Ar56VK4CTVLlEtYDEreM61Kg6hXzFQXRbmqqoiO0eyAtYFFVrp9RM6oG.png",
      title: "Summer Sale",
      subtitle: "Up to 50% off",
      buttonText: "Shop Now",
      buttonLink: "/sale",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
      title: "New Arrivals",
      subtitle: "Check out our latest products",
      buttonText: "Discover",
      buttonLink: "/new",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2115&auto=format&fit=crop",
      title: "Special Offers",
      subtitle: "Limited time deals",
      buttonText: "View Offers",
      buttonLink: "/offers",
    },
  ];

  // Handle touch events for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextSlide();
    }
    if (isRightSwipe) {
      goToPrevSlide();
    }
  };

  const goToNextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
  }, [slides.length]);

  const goToPrevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
      );
    }
  }, [slides.length]);

  useEffect(() => {
    let interval;
    if (!isHovering && slides.length > 0) {
      interval = setInterval(() => {
        goToNextSlide();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [goToNextSlide, isHovering, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-12 gap-x-2 my-3 md:my-3">
      <div
        className="relative    w-full col-span-8 overflow-hidden rounded-xl "
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-[200px] sm:h-[180px] md:h-[200px]  lg:h-[300px] transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id || index} className="min-w-full h-full relative">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
                  <div className="text-white p-6 md:p-12 max-w-md">
                    {slide.title && (
                      <h2 className="text-2xl md:text-4xl font-bold mb-2">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-sm md:text-base mb-4">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.buttonText && (
                      <a
                        href={slide.buttonLink || "#"}
                        className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm md:text-base transition"
                      >
                        {slide.buttonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/80 hover:bg-white p-2 shadow-md transition-all duration-200 text-emerald-600"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/80 hover:bg-white p-2 shadow-md transition-all duration-200 text-emerald-600"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-emerald-500"
                  : "w-3 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex border col-span-4 h-[200px] sm:h-[180px] md:h-[200px]  lg:h-[300px] transition-transform duration-500 ease-out"></div>
    </div>
  );
};

export default Banner;
