import React from 'react';
import { Heart, ShoppingBag, Check, X, Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  rank?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, rank }) => {
  const { 
    activePhoneModel, 
    formatPrice, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    setSelectedProduct 
  } = useStore();

  const isFavorited = wishlist.includes(product.id);

  // Check compatibility with active phone model
  const isCompatible = activePhoneModel 
    ? product.compatibleModelIds.includes(activePhoneModel.id)
    : true;

  const discountPercent = Math.round(
    ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100
  );

  return (
    <div className="group relative bg-[#0e1524] border border-[#1b2638] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-500 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-0.5">
      
      {/* Top Media Area (Matches Screenshot 4) */}
      <div className="relative aspect-square overflow-hidden bg-[#070b12] p-4 flex items-center justify-center">
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {/* Rank Badge #1, #2 (Orange square in Screenshot 4) */}
          {(rank || product.rank) && (
            <span className="w-6 h-6 rounded bg-brand text-white font-extrabold text-xs flex items-center justify-center shadow-md">
              {rank || product.rank}
            </span>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="bg-orange-500/20 border border-orange-500/35 text-orange-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-md">
              {discountPercent}% OFF
            </span>
          )}

          {/* Active Phone Compatibility Chip */}
          {activePhoneModel && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-md ${
              isCompatible 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {isCompatible ? (
                <>
                  <Check className="w-3 h-3" />
                  Fits your phone
                </>
              ) : (
                <>
                  <X className="w-3 h-3" />
                  Not for {activePhoneModel.name.split(' ')[0]}
                </>
              )}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Screenshot 4) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition backdrop-blur-md"
          title="Add to Wishlist"
        >
          <Heart 
            className={`w-4 h-4 transition ${
              isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-300'
            }`} 
          />
        </button>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.title}
          onClick={() => setSelectedProduct(product)}
          className="w-full h-full object-contain cursor-pointer transition-transform duration-500 group-hover:scale-105 filter drop-shadow-lg"
        />

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-4 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => setSelectedProduct(product)}
            className="w-full py-2 bg-white/95 hover:bg-white text-slate-900 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-md transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>

      </div>

      {/* Info Area (Screenshot 4) */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span className="font-bold text-brand uppercase tracking-wider text-[10px]">{product.accessoryBrand}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-bold text-slate-200">{product.rating}</span>
              <span className="text-slate-500 font-mono">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h4 
            onClick={() => setSelectedProduct(product)}
            className="text-xs sm:text-sm font-bold text-slate-100 hover:text-brand line-clamp-2 cursor-pointer leading-snug transition-colors"
          >
            {product.title}
          </h4>
        </div>

        {/* Pricing & Options Pill Button (Matches Screenshot 4) */}
        <div>
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base sm:text-lg font-black text-white font-sans">
              {formatPrice(product.basePrice)}
            </span>
            <span className="text-xs text-slate-500 line-through font-mono">
              {formatPrice(product.compareAtPrice)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Options button (e.g. "19 options >", "10 options >") */}
            <button
              onClick={() => setSelectedProduct(product)}
              className="flex-1 text-[11px] font-bold text-slate-300 hover:text-white bg-[#151f32] hover:bg-[#1a273e] py-2 px-3 rounded-xl border border-[#1f2d43] text-center transition flex items-center justify-center gap-1"
            >
              <span>{product.optionsCount || product.variants.length} options</span>
              <span className="text-slate-400 font-normal">&gt;</span>
            </button>

            {/* Quick Add to Cart Button */}
            <button
              onClick={() => addToCart(product)}
              className="p-2 bg-brand hover:bg-brand-hover text-white rounded-xl transition shadow-md hover:scale-105 shrink-0"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
