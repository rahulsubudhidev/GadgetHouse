import React, { useState } from 'react';
import { Sparkles, Shield, Eye, CheckCircle2, Zap } from 'lucide-react';

const HOTSPOTS = [
  {
    id: 1,
    title: '9H Mohs Hardness Barrier',
    desc: 'Dual-tempered high-alumina silicate glass withstands 1.5-meter steel ball drop impact.',
    metric: '9H Hardness',
    x: '25%',
    y: '30%'
  },
  {
    id: 2,
    title: 'Stainless Speaker Dust Mesh',
    desc: 'Precision micro-laser perforated metal mesh prevents ear-speaker dust clog permanently.',
    metric: '100% Dustproof',
    x: '50%',
    y: '16%'
  },
  {
    id: 3,
    title: 'Electroplated Oleophobic Coating',
    desc: 'Silky 118° water drop contact angle repels skin grease, facial sweat, and fingerprint smudges.',
    metric: '35,000+ Swipes',
    x: '75%',
    y: '45%'
  },
  {
    id: 4,
    title: 'Case-Friendly 2.5D Polished Edges',
    desc: 'Contoured CNC diamond-cut bevel prevents edge chipping and fits 99.8% of phone cases.',
    metric: '0.33mm Thin',
    x: '35%',
    y: '80%'
  }
];

export const FeatureStorySection: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState(HOTSPOTS[0]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-dark-border dark:border-dark-border light:border-slate-200">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black uppercase tracking-label text-brand inline-block mb-3">
          ANATOMY OF PROTECTION
        </span>
        <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white dark:text-white light:text-slate-900 tracking-[-0.03em]">
          Engineered to the Nanometer.
        </h2>
        <p className="text-base text-dark-muted dark:text-dark-muted light:text-slate-600 mt-3">
          Click any hotspot marker on the optical shield to inspect the 4-layer microscopic defense architecture.
        </p>
      </div>

      {/* Interactive Hotspot Stage */}
      <div className="relative rounded-[32px] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-200 p-8 sm:p-14 overflow-hidden shadow-floating">
        
        {/* Ambient Radial Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Glass Shield with Hotspot Pins (7 cols) */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[440px]">
            
            {/* Center Product Image */}
            <div className="relative w-72 sm:w-80 aspect-[9/18] flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=85"
                alt="Optical Shield Inspection"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(255,107,26,0.3)] transition-transform duration-700"
              />

              {/* Hotspot Pulse Pins */}
              {HOTSPOTS.map((spot) => {
                const isActive = activeHotspot.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => setActiveHotspot(spot)}
                    style={{ left: spot.x, top: spot.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                      isActive ? 'scale-125 z-20' : 'scale-100 hover:scale-110 z-10'
                    }`}
                  >
                    <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isActive ? 'bg-brand' : 'bg-white/40'}`}></span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
                      isActive ? 'bg-brand text-white shadow-glow-orange' : 'bg-black/80 text-white border border-white/30'
                    }`}>
                      {spot.id}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right: Active Hotspot Deep Dive Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-8 rounded-[24px] bg-[#151B28] dark:bg-[#151B28] light:bg-slate-50 border border-dark-border dark:border-dark-border light:border-slate-200 shadow-card">
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-label text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                  HOTSPOT 0{activeHotspot.id} / 04
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Spec
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white dark:text-white light:text-slate-900 leading-snug">
                {activeHotspot.title}
              </h3>

              <p className="text-sm text-dark-muted dark:text-dark-muted light:text-slate-600 mt-2 leading-relaxed">
                {activeHotspot.desc}
              </p>

              {/* Animated Metric Block */}
              <div className="mt-6 pt-6 border-t border-dark-border dark:border-dark-border light:border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-dark-muted tracking-label block">Benchmark Metric</span>
                  <span className="text-2xl font-mono font-black text-white dark:text-white light:text-slate-900 mt-0.5 block text-ember">
                    {activeHotspot.metric}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg">
                  <Sparkles className="w-6 h-6 text-brand" />
                </div>
              </div>

            </div>

            {/* Selector Pills */}
            <div className="grid grid-cols-2 gap-2">
              {HOTSPOTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveHotspot(s)}
                  className={`p-3 rounded-xl text-left text-xs font-bold transition border ${
                    activeHotspot.id === s.id
                      ? 'bg-brand/15 border-brand text-brand'
                      : 'bg-[#151B28]/50 dark:bg-[#151B28]/50 light:bg-white border-dark-border dark:border-dark-border light:border-slate-200 text-dark-muted hover:text-white'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-mono block">0{s.id}.</span>
                  <span className="truncate block">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

