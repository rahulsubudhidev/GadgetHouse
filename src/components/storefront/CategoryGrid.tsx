import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/mockData';

export const CategoryGrid: React.FC = () => {
  const { setSelectedCategorySlug, setViewMode } = useStore();

  const handleCategoryClick = (slug: string) => {
    setSelectedCategorySlug(slug);
    setViewMode('catalog');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
      
      {/* Header (Exact Match for Screenshot 3) */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shop by category
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Everything for your phone, sorted.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategorySlug(null);
            setViewMode('catalog');
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand hover:underline"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Cards Grid (Matches Screenshot 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATEGORIES.map(category => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className="group relative rounded-2xl overflow-hidden border border-[#1b2638] bg-[#0c121e] aspect-[3/4] flex flex-col justify-end p-4 cursor-pointer transition-all duration-300 hover:border-brand/70 hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1"
          >
            {/* Background Image with Dark Vignette & Orange Glow on hover */}
            <div className="absolute inset-0 z-0">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 filter brightness-[0.7] contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d14] via-[#090d14]/40 to-transparent"></div>
              {/* Subtle ambient orange reflection on hover */}
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent opacity-90 group-hover:opacity-100 transition"></div>
            </div>

            {/* Bottom Label Content */}
            <div className="relative z-10 text-center">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand transition-colors">
                {category.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 opacity-80 group-hover:opacity-100 font-medium">
                {category.itemCount}+ designs
              </p>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
