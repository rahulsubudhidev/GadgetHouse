import React, { useState } from 'react';
import { 
  Smartphone, 
  ChevronDown, 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Flame, 
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PHONE_BRANDS, PHONE_MODELS, CATEGORIES, PRODUCTS } from '../../data/mockData';

export const SubNavbar: React.FC = () => {
  const { 
    activePhoneModel, 
    setActivePhoneModel, 
    setViewMode, 
    setSelectedCategorySlug,
    setSelectedProduct
  } = useStore();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('apple');
  const [modelSearch, setModelSearch] = useState('');

  const brandModels = PHONE_MODELS.filter(m => m.brandId === selectedBrand);
  const filteredModels = modelSearch.trim()
    ? PHONE_MODELS.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
    : brandModels;

  const featuredProduct = PRODUCTS[2] || PRODUCTS[0];

  return (
    <div className="bg-[#0A0D15]/95 dark:bg-[#0A0D15]/95 light:bg-[#ECE8E0] border-b border-dark-border dark:border-dark-border light:border-light-border text-xs relative z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9 overflow-x-auto no-scrollbar gap-3">
          
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* Shop by Phone Mega Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition border ${
                  activePhoneModel
                    ? 'bg-brand/15 border-brand text-brand shadow-glow-subtle'
                    : 'bg-[#151B28] dark:bg-[#151B28] light:bg-white border-dark-border dark:border-dark-border light:border-slate-300 text-white dark:text-white light:text-slate-900 hover:border-brand/70'
                }`}
              >
                <Smartphone className="w-3 h-3 text-brand" />
                <span>Shop by Phone</span>
                <ChevronDown className={`w-3 h-3 text-dark-muted transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Full Featured Mega-Menu (Brand logos, model grid, featured product image, trending list) */}
              {isMegaMenuOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-[760px] max-w-[90vw] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-300 rounded-[28px] shadow-floating p-6 z-50 text-slate-200 dark:text-slate-200 light:text-slate-800 backdrop-blur-2xl animate-fade-in"
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <div className="grid grid-cols-12 gap-6">
                    
                    {/* Left: Brand Picker & Model Grid (8 cols) */}
                    <div className="col-span-8 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-dark-border dark:border-dark-border light:border-slate-200">
                        <div className="font-display font-bold text-sm text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand" />
                          <span>Select Your Device Model</span>
                        </div>
                        {activePhoneModel && (
                          <button
                            onClick={() => setActivePhoneModel(null)}
                            className="text-[11px] text-red-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <X className="w-3 h-3" /> Clear selection
                          </button>
                        )}
                      </div>

                      {/* Brand Logo Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {PHONE_BRANDS.map(brand => (
                          <button
                            key={brand.id}
                            onClick={() => {
                              setSelectedBrand(brand.id);
                              setModelSearch('');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                              selectedBrand === brand.id
                                ? 'bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white shadow-sm'
                                : 'bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 text-dark-muted hover:text-white dark:hover:text-white light:hover:text-black'
                            }`}
                          >
                            {brand.name}
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div>
                        <input
                          type="text"
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          placeholder="Search model, e.g. 17 Pro Max, S25 Ultra..."
                          className="w-full bg-[#151B28] dark:bg-[#151B28] light:bg-slate-50 text-xs text-white dark:text-white light:text-slate-900 placeholder-dark-muted px-3.5 py-2 rounded-xl border border-dark-border dark:border-dark-border light:border-slate-200 focus:border-brand focus:outline-none"
                        />
                      </div>

                      {/* 2-Column Model Buttons */}
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {filteredModels.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setActivePhoneModel(model);
                              setIsMegaMenuOpen(false);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition border ${
                              activePhoneModel?.id === model.id
                                ? 'bg-brand/15 border-brand text-brand font-bold'
                                : 'bg-[#151B28]/60 dark:bg-[#151B28]/60 light:bg-slate-50 border-dark-border/60 hover:border-brand/50 text-slate-300 dark:text-slate-300 light:text-slate-700'
                            }`}
                          >
                            <span className="truncate">{model.name}</span>
                            {activePhoneModel?.id === model.id && (
                              <Check className="w-3.5 h-3.5 text-brand shrink-0 ml-1" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Trending Quick Links */}
                      <div className="pt-2 border-t border-dark-border dark:border-dark-border light:border-slate-200 flex items-center gap-2 text-[11px] text-dark-muted">
                        <TrendingUp className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span className="font-bold">Trending:</span>
                        {['iPhone 17 Pro', 'Galaxy S25 Ultra', 'Pixel 9 Pro'].map(t => (
                          <button 
                            key={t}
                            onClick={() => {
                              const found = PHONE_MODELS.find(m => m.name.includes(t));
                              if (found) { setActivePhoneModel(found); setIsMegaMenuOpen(false); }
                            }}
                            className="hover:text-brand underline"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right: Featured Product Cut-out Preview (4 cols) */}
                    <div className="col-span-4 bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 rounded-2xl p-4 flex flex-col justify-between border border-dark-border dark:border-dark-border light:border-slate-200">
                      <div>
                        <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-label text-brand bg-brand/10 px-2 py-0.5 rounded mb-2">
                          <Flame className="w-3 h-3" />
                          <span>Staff Pick</span>
                        </div>
                        <h4 className="text-xs font-bold text-white dark:text-white light:text-slate-900 line-clamp-2">
                          {featuredProduct.title}
                        </h4>
                        <p className="text-[10px] text-dark-muted mt-1 line-clamp-2">
                          {featuredProduct.subtitle}
                        </p>
                      </div>

                      <div className="my-3 aspect-square rounded-xl bg-[#07090F] dark:bg-[#07090F] light:bg-white p-3 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={featuredProduct.images[0]} 
                          alt="" 
                          className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(255,107,26,0.3)] transition-transform hover:scale-105"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProduct(featuredProduct);
                          setIsMegaMenuOpen(false);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-glow-subtle"
                      >
                        <span>View Accessory</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Category Links */}
            <button
              onClick={() => {
                setSelectedCategorySlug(null);
                setViewMode('catalog');
              }}
              className="text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-black px-2 py-0.5 text-[11px] font-medium transition"
            >
              All Products
            </button>

            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategorySlug(cat.slug);
                  setViewMode('catalog');
                }}
                className="text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-black px-2 py-0.5 text-[11px] font-medium transition whitespace-nowrap flex items-center gap-1 group"
              >
                <span>{cat.name}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
            ))}

          </div>

          {/* Persistent "My phone: iPhone 17 Pro ✕" Chip on the Right */}
          {activePhoneModel ? (
            <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/40 px-2.5 py-0.5 rounded-full text-brand shrink-0 shadow-sm">
              <span className="text-[10px] font-bold flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-brand" />
                My phone: <strong className="text-white dark:text-white light:text-slate-900">{activePhoneModel.name}</strong>
              </span>
              <button
                onClick={() => setActivePhoneModel(null)}
                className="hover:bg-brand/20 rounded-full p-0.5 text-brand hover:text-white transition"
                title="Clear selected phone filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center text-[10px] text-dark-muted gap-1.5 shrink-0 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Precision model fit guarantee
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
