import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const PromoBanners: React.FC = () => {
  const { setViewMode, setSelectedCategorySlug } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Left Orange Card (Screenshot 1) */}
        <div 
          onClick={() => {
            setSelectedCategorySlug('smart-gadgets');
            setViewMode('catalog');
          }}
          className="group relative rounded-[28px] p-8 sm:p-10 bg-gradient-to-br from-[#ff6600] to-[#e65500] text-white overflow-hidden cursor-pointer shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Subtle geometric pattern in background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none flex items-center justify-center">
            <Zap className="w-56 h-56 -mr-16 text-white" />
          </div>

          <div className="relative z-10">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-100/90 block mb-3">
              POWER UP
            </span>
            <h3 className="text-2xl sm:text-[32px] font-extrabold tracking-tight mb-5 max-w-sm leading-[1.15] text-white font-sans">
              Up to 60% off fast chargers & cables
            </h3>
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white group-hover:underline">
              <span>Shop deals</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Right Dark Card with Warm Glow (Screenshot 1) */}
        <div 
          onClick={() => {
            setSelectedCategorySlug('back-cases');
            setViewMode('catalog');
          }}
          className="group relative rounded-[28px] p-8 sm:p-10 bg-gradient-to-br from-[#121927] to-[#0a0f19] border border-[#1b273b] text-white overflow-hidden cursor-pointer shadow-lg hover:shadow-black/70 transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Subtle warm amber ambient spotlight in top-right (matches screenshot 1) */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-600/25 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-brand block mb-3">
              JUST IN
            </span>
            <h3 className="text-2xl sm:text-[32px] font-extrabold tracking-tight mb-5 max-w-sm leading-[1.15] text-slate-100 font-sans">
              New arrivals to keep you charged & protected
            </h3>
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-200 group-hover:text-brand transition-colors">
              <span>Explore new</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
