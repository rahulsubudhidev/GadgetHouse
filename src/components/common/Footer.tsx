import React from 'react';
import { Mail, Clock, MapPin, Globe, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { useStore, CURRENCY_CONFIG } from '../../context/StoreContext';
import { Currency } from '../../types';

export const Footer: React.FC = () => {
  const { 
    theme,
    setViewMode, 
    setSelectedCategorySlug, 
    setIsOrderTrackingOpen,
    currency,
    setCurrency,
    language,
    setLanguage
  } = useStore();

  return (
    <footer className="relative bg-[#05070D] dark:bg-[#05070D] light:bg-[#EFECE6] border-t border-white/5 text-slate-400 text-xs mt-20 pt-16 pb-12 overflow-hidden">
      {/* Warm Orange Glow radiating from the bottom */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-brand/15 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => {
                setViewMode('storefront');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <img 
                src={theme === 'light' ? '/logo-light.png' : '/logo-transparent.png'} 
                alt="Gadget House" 
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_12px_rgba(255,107,26,0.35)]" 
              />
              <div className="flex flex-col justify-center">
                <span className="font-display font-extrabold text-[22px] tracking-[0.05em] text-white dark:text-white light:text-slate-900 leading-none">
                  GADGET
                </span>
                <div className="flex items-center gap-1.5 mt-1 leading-none">
                  <span className="w-2.5 h-[1.5px] bg-brand rounded-full"></span>
                  <span className="font-sans font-bold text-[9px] tracking-[0.2em] text-slate-300 dark:text-slate-300 light:text-slate-700">
                    HOUSE
                  </span>
                  <span className="text-[9px] font-black bg-gradient-to-r from-orange-500 to-brand text-white px-1.5 py-[1px] rounded-[3px] tracking-tight shadow-[0_0_8px_rgba(255,107,26,0.4)]">
                    .IN
                  </span>
                  <span className="w-2.5 h-[1.5px] bg-brand rounded-full"></span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-sm leading-relaxed font-sans">
              Award-winning phone cases, 9H tempered glass, camera armor, and GaN fast chargers engineered for uncompromising daily protection.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand hover:text-white border border-white/10 flex items-center justify-center transition text-slate-300" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand hover:text-white border border-white/10 flex items-center justify-center transition text-slate-300" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand hover:text-white border border-white/10 flex items-center justify-center transition text-slate-300" title="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>

            {/* Region / Currency selector badge */}
            <div className="pt-2 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
                <Globe className="w-3.5 h-3.5 text-brand" />
                <span>Global Store</span>
                <span className="text-slate-600">•</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
                >
                  <option value="INR" className="bg-[#07090F]">INR (₹)</option>
                  <option value="USD" className="bg-[#07090F]">USD ($)</option>
                  <option value="EUR" className="bg-[#07090F]">EUR (€)</option>
                  <option value="GBP" className="bg-[#07090F]">GBP (£)</option>
                  <option value="AED" className="bg-[#07090F]">AED (د.إ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] text-white dark:text-white light:text-slate-900 mb-4 font-bold">
              Shop Armor
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button 
                  onClick={() => { setSelectedCategorySlug(null); setViewMode('catalog'); }}
                  className="hover:text-brand transition text-left flex items-center gap-1.5"
                >
                  <span>All Products</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategorySlug('tempered-glass'); setViewMode('catalog'); }}
                  className="hover:text-brand transition text-left"
                >
                  Tempered Glass (9H)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategorySlug('back-cases'); setViewMode('catalog'); }}
                  className="hover:text-brand transition text-left"
                >
                  Aramid & MagSafe Cases
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategorySlug('smart-gadgets'); setViewMode('catalog'); }}
                  className="hover:text-brand transition text-left"
                >
                  GaN 65W Fast Chargers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategorySlug('camera-protectors'); setViewMode('catalog'); }}
                  className="hover:text-brand transition text-left"
                >
                  Sapphire Lens Rings
                </button>
              </li>
            </ul>
          </div>

          {/* Help & Tracking */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] text-white dark:text-white light:text-slate-900 mb-4 font-bold">
              Support
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button 
                  onClick={() => setIsOrderTrackingOpen(true)}
                  className="hover:text-brand transition text-left flex items-center gap-1 text-brand font-semibold"
                >
                  <span>Track Live Shipment</span>
                </button>
              </li>
              <li><a href="#shipping" className="hover:text-white transition">Global Shipping Policy</a></li>
              <li><a href="#drop-test" className="hover:text-white transition">Drop-Test Certification</a></li>
              <li><a href="#warranty" className="hover:text-white transition">Lifetime Guarantee</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ & Installation Guide</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.08em] text-white dark:text-white light:text-slate-900 mb-4 font-bold">
              HQ Connect
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <a href="mailto:contactgadgethouse@gmail.com" className="hover:text-brand transition font-medium">
                  contactgadgethouse@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 font-medium">
                <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>Mon–Sat, 10am–7pm IST</span>
              </li>
              <li className="flex items-start gap-2.5 font-medium">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span className="leading-relaxed">Gandhi Nagar, Brahmapur, Odisha - 760002</span>
              </li>
            </ul>
          </div>

        </div>

        {/* SECTION 12: Giant Outlined Wordmark GADGET HOUSE */}
        <div className="py-12 select-none pointer-events-none text-center overflow-hidden">
          <div 
            className="text-[13vw] font-display font-black tracking-tighter leading-none uppercase text-transparent opacity-15"
            style={{
              WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.4)',
              textShadow: '0 0 60px rgba(255, 107, 26, 0.2)'
            }}
          >
            GADGET HOUSE
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment simple icons */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>© 2026 Gadget House Inc. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Designed for global flagships</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-slate-400">
            <span className="mr-1">Secure payment via:</span>
            {['RAZORPAY', 'UPI', 'VISA', 'MASTERCARD', 'APPLE PAY', 'RUPAY'].map((badge) => (
              <span 
                key={badge}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono tracking-wider text-slate-300"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
