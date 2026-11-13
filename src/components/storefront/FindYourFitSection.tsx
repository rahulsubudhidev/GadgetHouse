import React, { useState } from 'react';
import { Smartphone, Check, ArrowRight, Sparkles, Layers, Sliders } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PHONE_BRANDS, PHONE_MODELS } from '../../data/mockData';

export const FindYourFitSection: React.FC = () => {
  const { activePhoneModel, setActivePhoneModel, setViewMode } = useStore();
  const [selectedBrand, setSelectedBrand] = useState('apple');
  const [activeSilhouetteColor, setActiveSilhouetteColor] = useState('#25282F');

  const brandModels = PHONE_MODELS.filter(m => m.brandId === selectedBrand);
  const currentModel = activePhoneModel || brandModels[0];

  const accessoryCount = 128; // Dynamic fit count

  const deviceFinishes = [
    { name: 'Natural Titanium', hex: '#8C857B' },
    { name: 'Space Black', hex: '#1C1D21' },
    { name: 'Desert Titanium', hex: '#9E8E7D' },
    { name: 'White Ceramic', hex: '#E5E7EB' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <div className="rounded-[32px] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-200 overflow-hidden shadow-floating p-8 sm:p-12 lg:p-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Interactive 3D Phone Silhouette Viewport (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Ambient orange backlight spot */}
            <div className="absolute w-72 h-72 rounded-full bg-brand/25 blur-[100px] pointer-events-none"></div>

            {/* Phone Silhouette Blueprint Box */}
            <div className="relative w-64 sm:w-72 aspect-[9/19] rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/60 bg-[#07090F] flex flex-col items-center justify-between transition-all duration-500 transform hover:scale-105">
              
              {/* Dynamic Island / Camera Punch Hole */}
              <div className="w-24 h-5 rounded-full bg-black border border-white/10 mt-2 flex items-center justify-end px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#151B28] border border-blue-500/40"></span>
              </div>

              {/* Center Silhouette Screen Content */}
              <div className="flex-1 w-full flex flex-col items-center justify-center text-center p-4">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-colors duration-500 shadow-inner"
                  style={{ backgroundColor: activeSilhouetteColor }}
                >
                  <Smartphone className="w-12 h-12 text-white/80" />
                </div>
                <h4 className="text-base font-display font-extrabold text-white">
                  {currentModel.name}
                </h4>
                <p className="text-[11px] font-mono text-brand font-bold mt-1">
                  Blueprint Verified • ±0.05mm
                </p>
              </div>

              {/* Bottom Speaker Cutout Line */}
              <div className="w-16 h-1 rounded-full bg-slate-800 mb-2"></div>
            </div>

            {/* Finish Switcher Swatches */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs text-dark-muted font-bold">Chassis Finish:</span>
              <div className="flex gap-2">
                {deviceFinishes.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSilhouetteColor(f.hex)}
                    style={{ backgroundColor: f.hex }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      activeSilhouetteColor === f.hex ? 'border-brand scale-110' : 'border-dark-border'
                    }`}
                    title={f.name}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right: Brand Tabs, Model Chips, Live Count & CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-label">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRECISION FIT WORKBENCH</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white dark:text-white light:text-slate-900 leading-tight tracking-[-0.03em]">
              Find accessories tailored to your phone.
            </h2>

            <p className="text-sm sm:text-base text-dark-muted dark:text-dark-muted light:text-slate-600 leading-relaxed max-w-xl">
              Zero guessing. Select your phone model once, and every case, tempered glass, camera protector, and MagSafe mount across the entire site is filtered strictly for certified precision fit.
            </p>

            {/* Brand Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {PHONE_BRANDS.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedBrand === brand.id
                      ? 'bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white shadow-glow-subtle'
                      : 'bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 text-dark-muted hover:text-white dark:hover:text-white light:hover:text-black border border-dark-border dark:border-dark-border light:border-slate-200'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>

            {/* Interactive Model Chips Grid */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {brandModels.map(model => {
                const isSelected = (activePhoneModel?.id || brandModels[0]?.id) === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => setActivePhoneModel(model)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-brand/20 border-brand text-brand ring-1 ring-brand shadow-glow-subtle'
                        : 'bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 border-dark-border dark:border-dark-border light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>{model.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
                  </button>
                );
              })}
            </div>

            {/* Live Count Bar & CTA */}
            <div className="pt-6 border-t border-dark-border dark:border-dark-border light:border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-display font-extrabold text-white dark:text-white light:text-slate-900">
                  <span className="text-brand font-mono">{accessoryCount}</span> accessories ready
                </div>
                <div className="text-xs text-dark-muted font-medium">
                  Guaranteed fit for <strong className="text-white dark:text-white light:text-slate-800">{currentModel.name}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePhoneModel(currentModel);
                  setViewMode('catalog');
                }}
                className="px-7 py-3.5 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white rounded-full font-extrabold text-xs uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.03] shadow-glow-subtle flex items-center gap-2 btn-shine"
              >
                <span>View All {accessoryCount} Fits</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

