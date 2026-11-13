import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useStore } from '../../context/StoreContext';

export const BestSellers: React.FC = () => {
  const { products, setViewMode, setSelectedCategorySlug } = useStore();

  // Top 4 bestsellers
  const bestSellers = products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header (Exact Match for Screenshot 4) */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Best Sellers
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/35">
              <Flame className="w-3 h-3 text-brand" />
              <span>This week</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Ranked by what everyone's actually buying.
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

      {/* Grid of Best Sellers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {bestSellers.map((product, idx) => (
          <ProductCard key={product.id} product={product} rank={idx + 1} />
        ))}
      </div>

    </section>
  );
};
