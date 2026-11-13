import React, { useState, useEffect } from 'react';
import { Timer, Zap, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const FlashDealBanner: React.FC = () => {
  const { products, addToCart, formatPrice } = useStore();
  const dealProduct = products.find(p => p.id === 'prod-gan-65w') || products[0];

  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18,
    ms: 9
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.ms > 0) return { ...prev, ms: prev.ms - 1 };
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1, ms: 9 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59, ms: 9 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59, ms: 9 };
        return { hours: 24, minutes: 0, seconds: 0, ms: 0 };
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-brand-emberStart via-brand-500 to-brand-emberEnd p-8 sm:p-14 text-white shadow-glow-orange">
        
        {/* Tech diagonal stripe pattern texture */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 16px)'
          }}
        ></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Info & Giant Countdown Digits (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/25 text-white text-xs font-black uppercase tracking-label backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>FLASH EMBER SALE • 35% OFF</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white leading-tight tracking-[-0.03em]">
              VoltPulse 65W GaN III Turbo Fast Charger
            </h2>

            <p className="text-sm sm:text-base text-orange-100 font-medium max-w-lg leading-relaxed">
              Pocket-sized GaN III architecture charges iPhone 17 Pro to 60% in 28 minutes. Dual USB-C PD 3.0 + USB-A ports.
            </p>

            {/* Giant Countdown Digits */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-label text-orange-200 mb-2">
                <Timer className="w-4 h-4 animate-spin" />
                <span>LIMITED TIME OFFER EXPIRES IN:</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 font-mono">
                <div className="bg-black/35 backdrop-blur-md rounded-2xl px-4 py-3 text-center min-w-[65px] border border-white/10">
                  <span className="text-2xl sm:text-4xl font-black block">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] text-orange-200 uppercase font-sans font-bold">Hours</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black">:</span>

                <div className="bg-black/35 backdrop-blur-md rounded-2xl px-4 py-3 text-center min-w-[65px] border border-white/10">
                  <span className="text-2xl sm:text-4xl font-black block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] text-orange-200 uppercase font-sans font-bold">Mins</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black">:</span>

                <div className="bg-black/35 backdrop-blur-md rounded-2xl px-4 py-3 text-center min-w-[65px] border border-white/10">
                  <span className="text-2xl sm:text-4xl font-black block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] text-orange-200 uppercase font-sans font-bold">Secs</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black">:</span>

                <div className="bg-black/35 backdrop-blur-md rounded-2xl px-3 py-3 text-center min-w-[50px] border border-white/10">
                  <span className="text-2xl sm:text-4xl font-black block text-amber-200">{timeLeft.ms}</span>
                  <span className="text-[10px] text-orange-200 uppercase font-sans font-bold">Ms</span>
                </div>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => addToCart(dealProduct)}
                className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.03] shadow-floating flex items-center gap-2 btn-shine"
              >
                <span>Claim Deal for {formatPrice(dealProduct.basePrice)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs font-semibold text-orange-100">
                <span className="line-through mr-2 font-mono">{formatPrice(dealProduct.compareAtPrice)}</span>
                <span className="bg-black/30 px-2 py-1 rounded-md text-[11px] font-bold">Save ₹800</span>
              </div>
            </div>

          </div>

          {/* Right Product Breaking Out of Frame (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-72 sm:w-88 aspect-square flex items-center justify-center">
              <img
                src={dealProduct.images[0]}
                alt={dealProduct.title}
                className="w-full h-full object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)] transform scale-110 lg:scale-125 hover:rotate-3 transition-transform duration-500"
              />
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};

