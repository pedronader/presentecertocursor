import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  slug: string;
  onClick: (slug: string) => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon: Icon,
  slug,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={() => onClick(slug)}
      className={`
        group relative bg-white rounded-xl p-6 border border-gray-200 
        hover:border-red-300 hover:shadow-lg transition-all duration-200 
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 
        focus:ring-offset-2 text-left w-full min-h-[140px] flex flex-col
        ${className}
      `}
      aria-label={`Explorar ${title}`}
    >
      <div className="flex items-start space-x-4 mb-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-red-200 group-hover:to-pink-200 transition-colors">
          <Icon className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors text-sm leading-tight">
            {title}
          </h3>
        </div>
      </div>
      <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors line-clamp-2 flex-1">
        {description}
      </p>
      
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};