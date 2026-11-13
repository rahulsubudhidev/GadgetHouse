import React, { useState } from 'react';
import { Smartphone, Search, ChevronRight, Check, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PHONE_BRANDS, PHONE_MODELS } from '../../data/mockData';

export const ShopByPhoneCard: React.FC = () => {
  const { activePhoneModel, setActivePhoneModel, setViewMode } = useStore();
  const [selectedBrand, setSelectedBrand] = useState('apple');
  const [modelSearch, setModelSearch] = useState('');
  const [showAllModels, setShowAllModels] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const brandModels = PHONE_MODELS.filter(m => m.brandId === selectedBrand);

  // Instant fuzzy match: e.g. "17 pro" matches "iPhone 17 Pro"
  const filteredModels = modelSearch.trim()
    ? PHONE_MODELS.filter(m => {
        const query = modelSearch.toLowerCase().replace(/\s+/g, '');
        const name = m.name.toLowerCase().replace(/\s+/g, '');
        return name.includes(query);
      })
    : brandModels;

  const displayModels = showAllModels ? filteredModels : filteredModels.slice(0, 9);

  const handleSelectModel = (model: typeof PHONE_MODELS[0]) => {
    setActivePhoneModel(model);
    setToastMessage(`Showing accessories tailored for ${model.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mb-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setViewMode('catalog')}
            className="underline hover:text-white font-extrabold"
          >
            View Compatible Gear →
          </button>
        </div>
      )}

      {/* Split Card (Matches Screenshot 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[28px] overflow-hidden border border-[#1b2638] shadow-2xl">
        
        {/* Left Orange Split Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#ff6600] to-[#e65500] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle phone outline silhouette */}
          <div className="absolute -right-8 -bottom-10 w-64 h-64 border-[6px] border-white/10 rounded-[44px] pointer-events-none transform rotate-12"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider mb-5 backdrop-blur-sm">
              <Smartphone className="w-3.5 h-3.5" />
              <span>SHOP BY PHONE</span>
            </div>

            <h2 className="text-3xl sm:text-[38px] font-black tracking-tight mb-4 text-white leading-[1.1]">
              Accessories made for <span className="underline decoration-white/40">your phone</span>
            </h2>

            <p className="text-sm text-orange-50 font-medium leading-relaxed mb-8 max-w-md">
              Pick your brand and model — we'll show only the covers, tempered glass and cases that fit perfectly. No more guesswork.
            </p>

            {/* Quick popular tags (matching screenshot 2) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PHONE_MODELS.filter(m => m.popular).slice(0, 4).map(model => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition shadow-sm ${
                    activePhoneModel?.id === model.id
                      ? 'bg-white text-brand shadow-md scale-105'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>

          {activePhoneModel && (
            <div className="mt-8 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-orange-100">
              <span className="font-semibold">Active Selection:</span>
              <span className="font-black text-white bg-black/25 px-3 py-1 rounded-lg">
                {activePhoneModel.name}
              </span>
            </div>
          )}
        </div>

        {/* Right Dark Card ("PICK YOUR MODEL") */}
        <div className="lg:col-span-7 bg-[#101726] p-7 sm:p-8 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PICK YOUR MODEL
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                25 models
              </span>
            </div>

            {/* Search Input (matching screenshot 2) */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Type your model, e.g. 17 Pro"
                className="w-full bg-[#0a0f18] text-sm text-slate-100 placeholder-slate-500 pl-11 pr-4 py-3 rounded-2xl border border-[#1b2638] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition font-medium"
              />
            </div>

            {/* Brand tabs (hidden if searching) */}
            {!modelSearch && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar border-b border-[#1b2638]/70">
                {PHONE_BRANDS.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedBrand === brand.id
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-[#151f32] text-slate-400 hover:text-slate-200 hover:bg-[#1a273e]'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}

            {/* 3-Column Models Grid (Matches Screenshot 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {displayModels.map(model => {
                const isSelected = activePhoneModel?.id === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs transition border group ${
                      isSelected
                        ? 'bg-brand/15 border-brand text-brand font-bold shadow-sm'
                        : 'bg-[#0c121e] border-[#182335] hover:border-slate-500 text-slate-200 hover:bg-[#131d2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-brand bg-brand text-white' 
                          : 'border-slate-600 bg-transparent group-hover:border-slate-400'
                      }`}>
                        {isSelected && <span className="text-[9px] font-black">✓</span>}
                      </div>
                      <span className="truncate font-semibold">{model.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-400">
                No phone models match "{modelSearch}". Try "iPhone 17" or "S25".
              </div>
            )}
          </div>

          {/* Show all 25 models button (matching screenshot 2) */}
          {filteredModels.length > 9 && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowAllModels(!showAllModels)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition py-1 px-3 rounded-lg hover:bg-[#151f32]"
              >
                <span>{showAllModels ? 'Show fewer models' : `Show all 25 models`}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllModels ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
