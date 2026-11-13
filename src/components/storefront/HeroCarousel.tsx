import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const SLIDES = [
  {
    id: 1,
    tag: 'NEW COLLECTION 2026',
    title: 'Dress Your Phone',
    subtitle: 'Slim, shockproof, MagSafe-ready',
    ctaText: 'Shop Now',
    linkCategory: 'back-cases',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1400&q=85',
    accentColor: '#ff6600'
  },
  {
    id: 2,
    tag: 'JAPANESE ASAHI 9H',
    title: 'Crystal Clear Shield',
    subtitle: 'Speaker dust mesh & optical HD clarity',
    ctaText: 'Shop Glass',
    linkCategory: 'tempered-glass',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1400&q=85',
    accentColor: '#0ea5e9'
  },
  {
    id: 3,
    tag: 'SUPERCHARGED',
    title: 'Fast Chargers & Docks',
    subtitle: 'GaN III semiconductor with 65W Turbo Power',
    ctaText: 'Explore Chargers',
    linkCategory: 'smart-gadgets',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1400&q=85',
    accentColor: '#ff6600'
  }
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setViewMode, setSelectedCategorySlug } = useStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
      <div className="relative rounded-[32px] overflow-hidden border border-[#1b2638] bg-[#0c121e] min-h-[420px] sm:min-h-[490px] flex items-center shadow-2xl">
        
        {/* Background Backdrop Image with Rich Moody Lighting */}
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-right opacity-35 sm:opacity-45 scale-105 transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090d14] via-[#090d14]/85 to-transparent"></div>
          {/* Subtle warm amber ambient spotlight in background (matches screenshot) */}
          <div 
            className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none"
            style={{ backgroundColor: slide.accentColor }}
          ></div>
        </div>

        {/* Content Box (Matches Screenshot 2) */}
        <div className="relative z-10 p-8 sm:p-14 md:p-16 max-w-2xl flex flex-col justify-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-brand mb-4 backdrop-blur-md w-fit">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="tracking-wide uppercase text-[10px]">{slide.tag}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-[-0.03em] leading-none mb-4 font-sans">
            {slide.title}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal mb-8 max-w-lg leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="flex items-center gap-4">
            {/* White rounded pill button with black text (exact match for Screenshot 2) */}
            <button
              onClick={() => {
                setSelectedCategorySlug(slide.linkCategory);
                setViewMode('catalog');
              }}
              className="group inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-3.5 rounded-full text-sm sm:text-base transition-all transform hover:scale-[1.02] shadow-xl"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                setSelectedCategorySlug(null);
                setViewMode('catalog');
              }}
              className="hidden sm:inline-flex items-center gap-2 text-slate-300 hover:text-white px-5 py-3 rounded-full text-sm font-semibold border border-dark-border hover:border-slate-500 transition"
            >
              Browse All
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows (matching screenshot 2 circles) */}
        <button
          onClick={() => setCurrentSlide(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1))}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition hover:scale-105"
          title="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % SLIDES.length)}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition hover:scale-105"
          title="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Centered Dots Pagination (Screenshot 2) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
