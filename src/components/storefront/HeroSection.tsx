import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Star, 
  Smartphone, 
  Search, 
  Check, 
  Globe2 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PHONE_BRANDS, PHONE_MODELS } from '../../data/mockData';

export const HeroSection: React.FC<{ onOpenDropTest?: () => void }> = ({ onOpenDropTest }) => {
  const { 
    activePhoneModel, 
    setActivePhoneModel, 
    setViewMode, 
    setSelectedCategorySlug 
  } = useStore();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedBrand, setSelectedBrand] = useState('apple');
  const [modelSearch, setModelSearch] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 16;
    const y = ((clientY - top) / height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const handleResetMouse = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const availableModels = PHONE_MODELS.filter(m => m.brandId === selectedBrand);
  const matchingModel = availableModels.find(m => 
    modelSearch ? m.name.toLowerCase().includes(modelSearch.toLowerCase()) : true
  ) || availableModels[0];

  const handleApplyPhoneBar = () => {
    if (matchingModel) {
      setActivePhoneModel(matchingModel);
      setViewMode('catalog');
    }
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleResetMouse}
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden tech-grid pt-12 pb-8"
    >
      {/* Background Radial Glow & Ambient Flares */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand/20 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/3 left-10 w-96 h-96 rounded-full bg-brand-amberSoft/10 blur-[130px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center my-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 z-10">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151B28]/90 dark:bg-[#151B28]/90 light:bg-white border border-dark-border dark:border-dark-border light:border-slate-300 text-xs font-semibold backdrop-blur-md shadow-card">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
              <span className="text-[11px] font-black uppercase tracking-label text-brand">2026 FLAGSHIP ARMOR</span>
              <span className="text-dark-muted">•</span>
              <span className="text-dark-muted dark:text-dark-muted light:text-slate-600 text-[11px]">Engineered for iPhone 17 & Galaxy S25</span>
            </div>

            {/* Award-level Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-display font-extrabold text-white dark:text-white light:text-slate-900 leading-[0.98] tracking-[-0.035em]">
              Dress Your <br />
              <span className="text-ember drop-shadow-[0_10px_35px_rgba(255,107,26,0.4)]">
                Phone.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-dark-muted dark:text-dark-muted light:text-slate-600 max-w-xl font-normal leading-relaxed">
              Engineered armor, MagSafe precision, and optical-grade Japanese Asahi glass for the devices you love. Tested to withstand 12ft concrete drops.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setSelectedCategorySlug(null);
                  setViewMode('catalog');
                }}
                className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-4 rounded-full text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.03] shadow-floating flex items-center gap-2.5 btn-shine"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={onOpenDropTest}
                className="group px-6 py-4 rounded-full text-sm sm:text-base font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 bg-[#151B28]/80 dark:bg-[#151B28]/80 light:bg-white border border-dark-border dark:border-dark-border light:border-slate-300 hover:border-brand/60 transition-all flex items-center gap-2.5 backdrop-blur-md"
              >
                <div className="w-7 h-7 rounded-full bg-brand/15 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>Watch Drop Test</span>
              </button>
            </div>

            {/* Trust Metrics Row (4.8 stars, 50k+ customers, ships worldwide) */}
            <div className="pt-6 border-t border-dark-border dark:border-dark-border light:border-slate-200/80 flex flex-wrap items-center gap-6 sm:gap-10 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-extrabold text-white dark:text-white light:text-slate-900">4.8 / 5.0</span>
                <span className="text-dark-muted">(3,420+ verified reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-dark-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white dark:text-white light:text-slate-900 font-bold">50,000+</strong> Protected Phones</span>
              </div>

              <div className="flex items-center gap-2 text-dark-muted">
                <Globe2 className="w-4 h-4 text-brand" />
                <span>Worldwide Dispatch in 48h</span>
              </div>
            </div>

          </div>

          {/* Right Column: Giant Floating 3D Phone Render with Interactive Tilt & Spec Chips */}
          <div className="lg:col-span-5 relative flex items-center justify-center z-10">
            
            {/* Parallax Container */}
            <div 
              style={{
                transform: `perspective(1000px) rotateX(${-mousePos.y * 0.8}deg) rotateY(${mousePos.x * 0.8}deg) translateZ(20px)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="relative w-full max-w-md aspect-[4/5] flex items-center justify-center"
            >
              
              {/* Backlight Ambient Plate */}
              <div className="absolute inset-8 rounded-[44px] bg-gradient-to-tr from-brand-emberStart/30 via-transparent to-brand/10 blur-2xl pointer-events-none"></div>

              {/* 3D Phone Cut-Out Render */}
              <img
                src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=90"
                alt="AeroShield Shockproof Titanium Case"
                className="w-full h-full object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] select-none pointer-events-none transform scale-110"
              />

              {/* Floating Glass Spec Chip 1: MagSafe Qi2 (Top Left) */}
              <div 
                style={{ transform: `translate3d(${-mousePos.x * 1.2}px, ${-mousePos.y * 1.2}px, 40px)` }}
                className="absolute top-10 -left-4 sm:-left-8 p-3 rounded-2xl bg-[#0E131D]/85 border border-white/10 backdrop-blur-xl shadow-floating text-left flex items-center gap-3 transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-brand/15 text-brand flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-brand tracking-label">Qi2 Ready</div>
                  <div className="text-xs font-bold text-white">MagSafe 15W Fast Charge</div>
                </div>
              </div>

              {/* Floating Glass Spec Chip 2: 12ft Drop Certified (Bottom Left) */}
              <div 
                style={{ transform: `translate3d(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px, 50px)` }}
                className="absolute bottom-16 -left-6 sm:-left-10 p-3 rounded-2xl bg-[#0E131D]/85 border border-white/10 backdrop-blur-xl shadow-floating text-left flex items-center gap-3 transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-emerald-400 tracking-label">MIL-STD 810G</div>
                  <div className="text-xs font-bold text-white">12ft Concrete Drop Tested</div>
                </div>
              </div>

              {/* Floating Glass Spec Chip 3: 9H Sapphire Hardness (Top Right) */}
              <div 
                style={{ transform: `translate3d(${-mousePos.x * 0.7}px, ${mousePos.y * 0.7}px, 35px)` }}
                className="absolute top-24 -right-4 sm:-right-8 p-3 rounded-2xl bg-[#0E131D]/85 border border-white/10 backdrop-blur-xl shadow-floating text-left flex items-center gap-3 transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-blue-400 tracking-label">Japanese Asahi</div>
                  <div className="text-xs font-bold text-white">9H Mohs Hardness</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Floating "Pick Your Phone" Bar (Requirement 1) */}
      <div className="max-w-4xl mx-auto px-4 w-full mt-10 z-20">
        <div className="bg-[#0E131D]/90 dark:bg-[#0E131D]/90 light:bg-white border border-dark-border dark:border-dark-border light:border-slate-300 rounded-[24px] p-3 shadow-floating backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-3">
          
          <div className="flex items-center gap-2 pl-3 shrink-0 text-xs font-extrabold text-white dark:text-white light:text-slate-900">
            <Smartphone className="w-4 h-4 text-brand" />
            <span>PICK YOUR PHONE:</span>
          </div>

          {/* Brand Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 text-xs text-white dark:text-white light:text-slate-900 font-bold px-3 py-2.5 rounded-xl border border-dark-border dark:border-dark-border light:border-slate-200 focus:border-brand focus:outline-none cursor-pointer"
            >
              {PHONE_BRANDS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Model Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder={`Search in ${selectedBrand} models (e.g. 17 Pro, Ultra)...`}
              className="w-full bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 text-xs text-white dark:text-white light:text-slate-900 placeholder-dark-muted pl-10 pr-3 py-2.5 rounded-xl border border-dark-border dark:border-dark-border light:border-slate-200 focus:border-brand focus:outline-none"
            />
          </div>

          {/* "Show My Fit" Action Button */}
          <button
            onClick={handleApplyPhoneBar}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.02] shadow-glow-subtle flex items-center justify-center gap-1.5 shrink-0 btn-shine"
          >
            <span>Show My Fit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>

    </section>
  );
};

