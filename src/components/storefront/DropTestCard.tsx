import React, { useState } from 'react';
import { Play, Shield, Award, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const DropTestCard: React.FC = () => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <div className="relative rounded-[32px] overflow-hidden bg-[#0A0E17] dark:bg-[#0A0E17] light:bg-[#0E131D] border border-dark-border shadow-floating">
        
        {/* Background Video Simulator Poster */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1600&q=85"
            alt="Laboratory Drop Test"
            className="w-full h-full object-cover opacity-25 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/70 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-14 lg:p-16 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-label mb-6">
            <Award className="w-4 h-4" />
            <span>LABORATORY RIGOROUS TESTING</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-[-0.03em] max-w-3xl leading-tight mb-4">
            Survives 12-Foot Concrete Impacts. Repeatedly.
          </h2>

          <p className="text-sm sm:text-base text-dark-muted max-w-xl mb-10 leading-relaxed">
            Every case and screen protector undergoes 26 multi-angle drop cycles from 12 feet onto raw polished industrial granite.
          </p>

          {/* Glowing Play Button */}
          <button
            onClick={() => setIsPlayingVideo(true)}
            className="group relative w-20 h-20 rounded-full bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white flex items-center justify-center shadow-glow-orange transition-all duration-300 transform hover:scale-110 mb-12"
          >
            <span className="absolute inset-0 rounded-full animate-ping opacity-35 bg-brand"></span>
            <Play className="w-8 h-8 fill-current ml-1 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* 3 Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl border-t border-dark-border/80 pt-10">
            <div className="p-6 rounded-2xl bg-[#0E131D]/80 border border-dark-border/60 backdrop-blur-md">
              <span className="text-4xl sm:text-5xl font-mono font-black text-white text-ember block mb-1">
                12 Feet
              </span>
              <span className="text-xs font-bold uppercase tracking-label text-white block">Drop Height Rating</span>
              <span className="text-[11px] text-dark-muted mt-1 block">Certified MIL-STD-810G 516.6</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E131D]/80 border border-dark-border/60 backdrop-blur-md">
              <span className="text-4xl sm:text-5xl font-mono font-black text-white text-ember block mb-1">
                35,000+
              </span>
              <span className="text-xs font-bold uppercase tracking-label text-white block">Scratch Resistance Swipes</span>
              <span className="text-[11px] text-dark-muted mt-1 block">Tested with 0000 steel wool pads</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E131D]/80 border border-dark-border/60 backdrop-blur-md">
              <span className="text-4xl sm:text-5xl font-mono font-black text-white text-ember block mb-1">
                Lifetime
              </span>
              <span className="text-xs font-bold uppercase tracking-label text-white block">Fit Guarantee</span>
              <span className="text-[11px] text-dark-muted mt-1 block">Free replacement if fit fails</span>
            </div>
          </div>

        </div>

      </div>

      {/* Video Modal Simulation */}
      {isPlayingVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#0E131D] border border-dark-border rounded-3xl p-6 text-white shadow-floating">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-brand" />
                <h4 className="font-display font-bold text-sm">Gadget House Lab Drop Test (12ft Slow-Mo)</h4>
              </div>
              <button onClick={() => setIsPlayingVideo(false)} className="text-dark-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl relative overflow-hidden flex items-center justify-center border border-dark-border">
              <img
                src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80"
                alt=""
                className="w-full h-full object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-brand/30 border border-brand text-brand flex items-center justify-center mb-3 animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h5 className="font-display font-bold text-lg text-white">Impact Deceleration Analysis</h5>
                <p className="text-xs text-slate-300 max-w-md mt-1">
                  Polycarbonate corner air-cushions absorb 92.4% of kinetic rebound energy, preserving camera sensor glass.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

