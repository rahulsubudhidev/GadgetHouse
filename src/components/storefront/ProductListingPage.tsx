import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Smartphone, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES, PHONE_MODELS } from '../../data/mockData';

export const ProductListingPage: React.FC = () => {
  const { 
    products, 
    activePhoneModel, 
    setActivePhoneModel, 
    selectedCategorySlug, 
    setSelectedCategorySlug, 
    setViewMode,
    formatPrice 
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [magsafeOnly, setMagsafeOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategorySlug && product.category !== selectedCategorySlug) {
        return false;
      }
      // Phone model compatibility filter
      if (activePhoneModel && !product.compatibleModelIds.includes(activePhoneModel.id)) {
        return false;
      }
      // Price filter
      if (product.basePrice > maxPrice) {
        return false;
      }
      // MagSafe filter
      if (magsafeOnly && !product.isMagSafe) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (a.rank || 99) - (b.rank || 99);
    });
  }, [products, selectedCategorySlug, activePhoneModel, maxPrice, magsafeOnly, sortBy]);

  const activeCategory = CATEGORIES.find(c => c.slug === selectedCategorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <button onClick={() => setViewMode('storefront')} className="hover:text-white">Home</button>
            <span>/</span>
            <span className="text-white font-medium">{activeCategory ? activeCategory.name : 'All Accessories'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{activeCategory ? activeCategory.name : 'Browse Phone Accessories'}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-dark-card border border-dark-border text-slate-400">
              {filteredProducts.length} items
            </span>
          </h1>
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-xs font-semibold text-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs bg-[#111724] border border-dark-border px-3 py-2 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-dark-card">Featured & Popular</option>
              <option value="price-low" className="bg-dark-card">Price: Low to High</option>
              <option value="price-high" className="bg-dark-card">Price: High to Low</option>
              <option value="rating" className="bg-dark-card">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Filter Sidebar */}
        <aside className={`md:col-span-3 space-y-6 ${showMobileFilter ? 'block' : 'hidden md:block'}`}>
          <div className="bg-[#0f1725] border border-dark-border rounded-2xl p-5 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-brand" />
                Filters
              </span>
              {(selectedCategorySlug || magsafeOnly || maxPrice < 3000) && (
                <button
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setMagsafeOnly(false);
                    setMaxPrice(3000);
                  }}
                  className="text-[11px] text-brand hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Active Phone Model Filter Badge */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                Active Phone Filter
              </label>
              {activePhoneModel ? (
                <div className="p-3 rounded-xl bg-brand/10 border border-brand/40 flex items-center justify-between text-xs text-brand">
                  <div className="flex items-center gap-2 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>{activePhoneModel.name}</span>
                  </div>
                  <button 
                    onClick={() => setActivePhoneModel(null)}
                    className="p-1 hover:bg-brand/20 rounded"
                    title="Remove phone filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const first = PHONE_MODELS.find(m => m.id === 'ip-17-p');
                    if (first) setActivePhoneModel(first);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-dashed border-dark-border hover:border-brand text-xs text-slate-400 hover:text-white transition flex items-center justify-between"
                >
                  <span>Select phone for fit guarantee</span>
                  <span className="text-brand font-bold">+</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                Categories
              </label>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setSelectedCategorySlug(null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition font-medium ${
                    selectedCategorySlug === null
                      ? 'bg-brand text-white font-bold'
                      : 'text-slate-300 hover:bg-[#162030]'
                  }`}
                >
                  All Products ({products.length})
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition font-medium flex items-center justify-between ${
                      selectedCategorySlug === cat.slug
                        ? 'bg-brand text-white font-bold'
                        : 'text-slate-300 hover:bg-[#162030]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-500">{cat.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-2">
                <span>Max Price</span>
                <span className="text-white font-mono">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="400"
                max="3000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-2 border-t border-dark-border/50 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={magsafeOnly}
                  onChange={(e) => setMagsafeOnly(e.target.checked)}
                  className="rounded bg-[#121927] border-dark-border text-brand focus:ring-0"
                />
                <span>MagSafe Ready Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded bg-[#121927] border-dark-border text-brand focus:ring-0"
                />
                <span>In Stock & Ready to Ship</span>
              </label>
            </div>

          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#0f1725] rounded-3xl border border-dark-border p-8">
              <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No compatible accessories match your filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Try widening your price range or clearing phone model restrictions.
              </p>
              <button
                onClick={() => {
                  setSelectedCategorySlug(null);
                  setActivePhoneModel(null);
                  setMaxPrice(3000);
                  setMagsafeOnly(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  );
};

