import React, { useState, useEffect } from 'react';
import { Timer, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const FlashSale: React.FC = () => {
  const { products, addToCart, formatPrice } = useStore();
  const dealProduct = products.find(p => p.id === 'prod-gan-65w') || products[0];

  // Countdown timer: 07h 42m 18s
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-3xl overflow-hidden border border-brand/40 bg-gradient-to-r from-[#191008] via-[#121927] to-[#0d1320] p-6 sm:p-10 shadow-2xl">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>FLASH DEAL OF THE DAY</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {dealProduct.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {dealProduct.subtitle}
            </p>

            {/* Timer Blocks */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-2">
                <Timer className="w-4 h-4 text-brand animate-pulse" />
                <span>Ends in:</span>
              </div>
              
              <div className="flex items-center gap-2 font-mono">
                <div className="bg-[#1e293b] border border-dark-border px-3 py-2 rounded-xl text-center min-w-[50px]">
                  <span className="text-xl font-bold text-white block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                </div>
                <span className="text-xl font-bold text-brand">:</span>
                <div className="bg-[#1e293b] border border-dark-border px-3 py-2 rounded-xl text-center min-w-[50px]">
                  <span className="text-xl font-bold text-white block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Mins</span>
                </div>
                <span className="text-xl font-bold text-brand">:</span>
                <div className="bg-[#1e293b] border border-dark-border px-3 py-2 rounded-xl text-center min-w-[50px]">
                  <span className="text-xl font-bold text-white block">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Secs</span>
                </div>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="max-w-md pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span className="font-semibold text-orange-400">🔥 Almost Sold Out</span>
                <span className="text-slate-400">86% Claimed</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-brand rounded-full w-[86%]"></div>
              </div>
            </div>

          </div>

          {/* Right Product Spotlight card */}
          <div className="lg:col-span-5 bg-[#0f1725] border border-dark-border rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            <div className="w-44 h-44 mb-4 relative">
              <img
                src={dealProduct.images[0]}
                alt={dealProduct.title}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
              <span className="absolute top-0 right-0 bg-brand text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                35% OFF
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-white">
                {formatPrice(dealProduct.basePrice)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(dealProduct.compareAtPrice)}
              </span>
            </div>

            <button
              onClick={() => addToCart(dealProduct)}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Claim Deal Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

