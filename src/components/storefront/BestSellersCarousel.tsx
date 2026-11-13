import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Check, 
  Eye, 
  Flame, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const BestSellersCarousel: React.FC = () => {
  const { 
    products, 
    activePhoneModel, 
    formatPrice, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    setSelectedProduct,
    setViewMode 
  } = useStore();

  const [activeColors, setActiveColors] = useState<Record<string, string>>({});

  const colorPalette = [
    { name: 'Space Black', hex: '#1C1D21' },
    { name: 'Sunset Orange', hex: '#FF6B1A' },
    { name: 'Desert Titanium', hex: '#8C857B' },
    { name: 'Alpine Frost', hex: '#4B5E53' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-label text-brand flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              COMMUNITY BEST SELLERS
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white dark:text-white light:text-slate-900 tracking-[-0.03em]">
            Most Coveted Armor.
          </h2>
          <p className="text-sm text-dark-muted dark:text-dark-muted light:text-slate-600 mt-1">
            Ranked by verified buyer volume and precision drop-test ratings.
          </p>
        </div>

        <button
          onClick={() => setViewMode('catalog')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-label text-brand hover:underline self-start"
        >
          <span>View All 142 Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll-Snap Carousel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product, idx) => {
          const isFavorited = wishlist.includes(product.id);
          const isCompatible = activePhoneModel 
            ? product.compatibleModelIds.includes(activePhoneModel.id)
            : true;

          const discountPercent = Math.round(
            ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100
          );

          const currentColor = activeColors[product.id] || colorPalette[0].hex;

          return (
            <div
              key={product.id}
              className="group relative rounded-[28px] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-brand/70 hover:shadow-floating hover:-translate-y-1.5"
            >
              {/* Product Gradient Plate */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-[#141B28] to-[#0A0D15] p-6 flex items-center justify-center">
                
                {/* Ambient Radial Spotlight */}
                <div className="absolute inset-4 rounded-full bg-brand/10 blur-xl pointer-events-none group-hover:bg-brand/25 transition-all duration-500"></div>

                {/* Rank Badge & Discount Tags */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white font-display font-extrabold text-xs flex items-center justify-center shadow-md">
                    #{idx + 1}
                  </span>
                  {discountPercent > 0 && (
                    <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {activePhoneModel && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-md ${
                      isCompatible 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      <Check className="w-3 h-3" />
                      Fits your phone
                    </span>
                  )}
                </div>

                {/* Wishlist Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition backdrop-blur-md"
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-red-500' : ''}`} />
                </button>

                {/* 3D Product Image Render with Tilt */}
                <img
                  src={product.images[0]}
                  alt={product.title}
                  onClick={() => setSelectedProduct(product)}
                  className="w-full h-full object-contain cursor-pointer filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-105"
                />

                {/* Quick View Button Hover */}
                <div className="absolute inset-x-5 bottom-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2.5 bg-white/95 hover:bg-white text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-floating backdrop-blur-md transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick Preview</span>
                  </button>
                </div>
              </div>

              {/* Product Info & Slide-Up Add to Cart */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                
                <div>
                  {/* Brand & Reviews */}
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <span className="font-bold text-brand uppercase tracking-label text-[10px]">
                      {product.accessoryBrand}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-extrabold text-white dark:text-white light:text-slate-900">{product.rating}</span>
                      <span className="text-dark-muted font-mono text-[11px]">({product.reviewCount})</span>
                    </div>
                  </div>

                  <h3 
                    onClick={() => setSelectedProduct(product)}
                    className="text-sm font-display font-bold text-white dark:text-white light:text-slate-900 hover:text-brand line-clamp-2 cursor-pointer leading-snug transition-colors"
                  >
                    {product.title}
                  </h3>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-dark-muted font-semibold">Finish:</span>
                  <div className="flex items-center gap-1.5">
                    {colorPalette.map((col, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => setActiveColors({ ...activeColors, [product.id]: col.hex })}
                        style={{ backgroundColor: col.hex }}
                        className={`w-4 h-4 rounded-full border transition-transform ${
                          currentColor === col.hex ? 'border-brand scale-125 ring-1 ring-brand' : 'border-dark-border'
                        }`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Price Tag & Sliding Add to Cart Button */}
                <div className="pt-2 border-t border-dark-border/60 dark:border-dark-border/60 light:border-slate-200">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-white dark:text-white light:text-slate-900 price-tag font-sans">
                        {formatPrice(product.basePrice)}
                      </span>
                      <span className="text-xs text-dark-muted line-through font-mono">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-dark-muted">
                      Inclusive of GST
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-3 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white rounded-xl font-bold text-xs shadow-glow-subtle transition-all duration-300 transform group-hover:scale-[1.02] flex items-center justify-center gap-2 btn-shine"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};

