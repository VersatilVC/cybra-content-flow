
import React from 'react';

interface CarouselIndicatorsProps {
  slideCount: number;
  currentSlide: number;
  onSlideClick: (index: number) => void;
}

const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({
  slideCount,
  currentSlide,
  onSlideClick
}) => {
  return (
    <div className="flex justify-center mt-4 gap-2">
      {Array.from({ length: slideCount }, (_, index) => (
        <button
          key={index}
          className={`w-2 h-2 rounded-full transition-colors ${
            index === currentSlide ? 'bg-purple-600' : 'bg-gray-300'
          }`}
          onClick={() => onSlideClick(index)}
        />
      ))}
    </div>
  );
};

export default CarouselIndicators;
