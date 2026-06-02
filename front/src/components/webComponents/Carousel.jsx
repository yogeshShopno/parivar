import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Professional Web Carousel Component
 * - Merged from CarouselDemo & InfiniteCarouselAdvanced
 * - Uses same color scheme as WebHeader (localStorage web_* keys)
 * - Features: Autoplay, Touch/Swipe, Keyboard, Smooth animations
 */
const Carousel = ({
  autoplay = true,
  autoplayInterval = 4000,
  showArrows = true,
  showDots = true,
  showCounter = false,
  images = ['/1.png', '/2.png', '/3.png', '/4.png'],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [theme, setTheme] = useState({});

  // Load theme from localStorage (same as WebHeader)
  useEffect(() => {
    const loadTheme = () => {
      const colorKeys = [
        'backgroundColor', 'borderColor', 'buttonColor', 'fontColor',
        'gradientEnd', 'gradientStart', 'primaryColor', 'secondaryColor', 'textColor',
      ];

      const loadedTheme = {};
      colorKeys.forEach((key) => {
        const value = localStorage.getItem(`web_${key}`);
        if (value) {
          loadedTheme[key] = value;
        }
      });

      // Fallback colors
      const defaultTheme = {
        gradientStart: '#2E7D32',
        gradientEnd: '#0D3B12',
        primaryColor: '#1B5E20',
        secondaryColor: '#66BB6A',
        textColor: '#123524',
        backgroundColor: '#F5FFF7',
        borderColor: '#D7EFD9',
        buttonColor: '#1B5E20',
        fontColor: '#FFFFFF',
      };

      setTheme({ ...defaultTheme, ...loadedTheme });
    };

    loadTheme();
    window.addEventListener('storage', loadTheme);
    return () => window.removeEventListener('storage', loadTheme);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, images.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Touch handlers
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    setTouchEnd(e.changedTouches[0].clientX);
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  return (
    <div
      className="relative w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl group transition-all"
      style={{ backgroundColor: theme.backgroundColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images Container */}
      <div className="relative w-full h-full">
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          const isNext = (index === (currentIndex + 1) % images.length && direction > 0) ||
                        (index === (currentIndex - 1 + images.length) % images.length && direction < 0);

          return (
            <div
              key={index}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                opacity: isActive ? 1 : isNext ? 0 : 0,
                transform: `scale(${isActive ? 1 : 0.95})`,
                zIndex: isActive ? 10 : isNext ? 5 : 0,
              }}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

        

      {/* Left Arrow */}
      {showArrows && images.length > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.primaryColor}cc`,
            color: theme.fontColor,
          }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Right Arrow */}
      {showArrows && images.length > 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.primaryColor}cc`,
            color: theme.fontColor,
          }}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Dots */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="rounded-full transition-all duration-300 hover:scale-125"
              style={{
                backgroundColor:
                  index === currentIndex ? theme.primaryColor : `${theme.secondaryColor}99`,
                width: index === currentIndex ? '36px' : '10px',
                height: '10px',
              }}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

    
    </div>
  );
};

export default Carousel;
