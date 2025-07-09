import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryCard } from './CategoryCard';

interface CategoryItem {
  title: string;
  description: string;
  icon: any;
  slug: string;
}

interface CategoryCarouselProps {
  title: string;
  items: CategoryItem[];
  onCardClick: (slug: string) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  title,
  items,
  onCardClick
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280; // Card width + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        
        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`
              p-2 rounded-full border transition-all
              ${canScrollLeft 
                ? 'border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600' 
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`
              p-2 rounded-full border transition-all
              ${canScrollRight 
                ? 'border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600' 
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-64">
              <CategoryCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                slug={item.slug}
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicators */}
        <div className="md:hidden flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(items.length / 2) }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
};