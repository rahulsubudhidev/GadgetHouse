import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useStore } from '../../context/StoreContext';

export const TopPicks: React.FC = () => {
  const { products, setViewMode, activePhoneModel } = useStore();

  // Curated picks, prioritizing compatibility if phone model is active
  const topPicks = activePhoneModel
    ? products.filter(p => p.compatibleModelIds.includes(activePhoneModel.id)).slice(0, 4)
    : products.slice(4, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#182335]/60">
      
      {/* Header (Exact Match for Screenshot 4 bottom) */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top Picks for You
            </h2>
            {activePhoneModel && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand/15 text-brand border border-brand/30">
                <Sparkles className="w-3 h-3" />
                For {activePhoneModel.name}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Handpicked favourites, ready to ship.
          </p>
        </div>

        <button
          onClick={() => setViewMode('catalog')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand hover:underline"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(topPicks.length > 0 ? topPicks : products.slice(0, 4)).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </section>
  );
};
