import React from 'react';
import { ArrowUpRight, Sparkles, Shield, Zap, Cable, Layers, Camera } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const BENTO_TILES = [
  {
    id: 'bento-1',
    categorySlug: 'back-cases',
    title: 'Shockproof Back Cases',
    subtitle: 'N52 MagSafe array, military certified 12ft drop protection with tactile CNC aluminum buttons.',
    count: '142 Designs',
    colSpan: 'lg:col-span-8',
    rowSpan: 'lg:row-span-2',
    isLarge: true,
    tag: 'FLAGSHIP HERO',
    icon: Shield,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'bento-2',
    categorySlug: 'tempered-glass',
    title: '9H Tempered Glass',
    subtitle: 'Integrated stainless micro-speaker dust barrier & Japanese Asahi optical clarity.',
    count: '88 Fits',
    colSpan: 'lg:col-span-4',
    rowSpan: 'lg:row-span-1',
    isLarge: false,
    tag: 'ULTRA CLEAR',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bento-3',
    categorySlug: 'camera-protectors',
    title: 'Titanium Lens Rings',
    subtitle: 'Grade-5 aviation titanium with zero flash glare.',
    count: '39 Models',
    colSpan: 'lg:col-span-4',
    rowSpan: 'lg:row-span-1',
    isLarge: false,
    tag: 'SAPPHIRE OPTICS',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bento-4',
    categorySlug: 'smart-gadgets',
    title: 'GaN III Fast Power',
    subtitle: '65W pocket chargers & 3-in-1 folding docks.',
    count: '46 Products',
    colSpan: 'lg:col-span-4',
    rowSpan: 'lg:row-span-1',
    isLarge: false,
    tag: '65W TURBO',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bento-5',
    categorySlug: 'accessories',
    title: 'MagSafe Car Mounts',
    subtitle: '1,500g twist-lock air vent hooks.',
    count: '65 Models',
    colSpan: 'lg:col-span-4',
    rowSpan: 'lg:row-span-1',
    isLarge: false,
    tag: 'N52 MAGNETIC',
    icon: Layers,
    image: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bento-6',
    categorySlug: 'accessories',
    title: '240W Braided Cables',
    subtitle: 'Bulletproof ballistic Kevlar weave.',
    count: '28 Varieties',
    colSpan: 'lg:col-span-4',
    rowSpan: 'lg:row-span-1',
    isLarge: false,
    tag: 'PD 3.1 240W',
    icon: Cable,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  }
];

export const BentoCategoryGrid: React.FC = () => {
  const { setSelectedCategorySlug, setViewMode } = useStore();

  const handleTileClick = (slug: string) => {
    setSelectedCategorySlug(slug);
    setViewMode('catalog');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-label text-brand mb-2">
            <span>BENTO ARCHITECTURE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white dark:text-white light:text-slate-900 tracking-[-0.03em]">
            Engineered By Category.
          </h2>
          <p className="text-sm sm:text-base text-dark-muted dark:text-dark-muted light:text-slate-600 mt-2 max-w-lg">
            Every accessory is modeled directly from manufacturer CAD blueprints for guaranteed tolerance within 0.05mm.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategorySlug(null);
            setViewMode('catalog');
          }}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-label text-brand hover:underline self-start"
        >
          <span>View Full Catalogue</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6-Tile Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {BENTO_TILES.map(tile => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile.categorySlug)}
              className={`${tile.colSpan} ${tile.rowSpan} group relative rounded-[28px] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-200 overflow-hidden cursor-pointer transition-all duration-500 hover:border-brand/60 hover:shadow-floating p-6 sm:p-8 flex flex-col justify-between`}
            >
              {/* Radial ambient orange glow behind product on hover */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand/0 group-hover:bg-brand/20 rounded-full blur-[80px] transition-all duration-500 pointer-events-none"></div>

              {/* Card Top Information */}
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-label text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full inline-block mb-3">
                    {tile.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white dark:text-white light:text-slate-900 leading-tight">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-dark-muted dark:text-dark-muted light:text-slate-600 mt-1 max-w-xs leading-relaxed">
                    {tile.subtitle}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 border border-dark-border dark:border-dark-border light:border-slate-200 flex items-center justify-center text-dark-muted group-hover:text-white group-hover:bg-brand transition-all shrink-0">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* Floating Product Cutout in Center/Bottom with 3D Tilt on Hover */}
              <div className="relative z-10 my-6 flex items-center justify-center overflow-hidden">
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="w-full max-h-56 sm:max-h-64 object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1"
                />
              </div>

              {/* Card Bottom Meta */}
              <div className="relative z-10 pt-4 border-t border-dark-border/60 dark:border-dark-border/60 light:border-slate-200 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-dark-muted dark:text-dark-muted light:text-slate-500">
                  {tile.count}
                </span>
                <span className="font-bold text-brand group-hover:underline flex items-center gap-1">
                  <span>Explore fits</span>
                  <span className="text-xs">→</span>
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};

