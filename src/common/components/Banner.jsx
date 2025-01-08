import { useEffect, useState } from "react";
import { get, isArray } from "lodash";

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const data = [];
  const slides = isArray(get(data, "data", [])) ? get(data, "data", []) : [];

  const goToNextSlide = () => {
    if (slides.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
  };

  const goToPrevSlide = () => {
    if (slides.length > 0) {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [slides.length]);

  return (
    <div className="relative mx-auto border rounded-xl my-6 h-52 w-full">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex h-full transition-transform duration-500"
          // style={{ transform: `translateX(-${currentIndex * 100 || 0}%)` }}
        >
          {/* {slides?.map((slide, index) => (
            <img
              key={index}
              src={get(slide, "imageUrl")}
              alt={`Slide ${index}`}
              className="h-[200px] w-full flex-shrink-0 object-cover"
            />
          ))} */}
        </div>
      </div>
      <button
        // onClick={goToPrevSlide}
        className="absolute -left-5 top-1/2 -translate-y-1/2 transform rounded-lg border-[2px] border-gray bg-white px-[7px] py-[12px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="10"
          viewBox="0 0 20 10"
          fill="none"
        >
          <path
            d="M5 9L1 5M1 5L5 1M1 5L19 5"
            stroke="#D7D6D6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        // onClick={goToNextSlide}
        className="absolute -right-5 top-1/2 -translate-y-1/2 transform rounded-lg border-[2px] border-gray bg-white px-[7px] py-[12px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="10"
          viewBox="0 0 20 10"
          fill="none"
        >
          <path
            d="M15 1L19 5M19 5L15 9M19 5L1 5"
            stroke="#D7D6D6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="mt-3 flex justify-center">
        {/* {slides?.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`mx-2 h-1 w-14 rounded-full ${
              index === currentIndex ? "bg-gray" : "bg-gray-light"
            } cursor-pointer`}
          ></div>
        ))} */}
      </div>
    </div>
  );
};

export default Banner;
