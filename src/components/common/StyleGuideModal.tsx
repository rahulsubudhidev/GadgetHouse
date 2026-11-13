import React, { useState } from 'react';
import { X, Check, Copy, Palette, Type, Box, Sparkles, Sun, Moon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const StyleGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useStore();
  const [activeTab, setActiveTab] = useState<'colors' | 'type' | 'cards' | 'buttons'>('colors');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const colors = [
    { name: 'Dark Base', hex: '#07090F', role: 'Main canvas background in dark mode' },
    { name: 'Dark Surface 1', hex: '#0E131D', role: 'Primary cards & modals' },
    { name: 'Dark Surface 2', hex: '#151B28', role: 'Secondary elevation & pills' },
    { name: 'Hairline Border', hex: 'rgba(255,255,255,0.08)', role: 'Apple-spec border hairline' },
    { name: 'Brand Orange', hex: '#FF6B1A', role: 'Primary brand accent' },
    { name: 'Ember High', hex: '#FF8A3D', role: 'Gradient top stop' },
    { name: 'Ember Low', hex: '#FF4D00', role: 'Gradient bottom stop' },
    { name: 'Soft Amber', hex: '#FFC27A', role: 'Warm glows & subtle highlights' },
    { name: 'Text Primary', hex: '#FFFFFF', role: 'Headings & primary copy' },
    { name: 'Text Secondary', hex: '#9AA4B5', role: 'Muted captions & specs' },
    { name: 'Light Base', hex: '#F6F3EE', role: 'Light mode canvas' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#0E131D] text-slate-100 rounded-[28px] border border-white/10 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between bg-[#07090F]/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-brand font-bold">
                Design System v2.0
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Gadget House Style Guide
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Apple & Nothing-inspired industrial product launch aesthetics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-slate-300"
              title="Toggle theme mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 md:px-8 pt-4 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'colors', label: 'Color Palette', icon: Palette },
            { id: 'type', label: 'Typography Scale', icon: Type },
            { id: 'cards', label: 'Card Radii & Glows', icon: Box },
            { id: 'buttons', label: 'Button States', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
                  isActive
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content body */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: Colors */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {colors.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => copyToClipboard(c.hex)}
                    className="p-3.5 rounded-2xl bg-[#07090F] border border-white/10 hover:border-brand/40 transition cursor-pointer group relative overflow-hidden"
                  >
                    <div
                      className="w-full h-12 rounded-xl mb-3 border border-white/10 transition-transform group-hover:scale-105"
                      style={{ background: c.hex }}
                    />
                    <div className="text-xs font-bold text-white group-hover:text-brand transition flex items-center justify-between">
                      <span>{c.name}</span>
                      {copiedHex === c.hex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{c.hex}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{c.role}</div>
                  </div>
                ))}
              </div>

              {/* Ember Gradient Spec */}
              <div className="p-5 rounded-2xl bg-[#07090F] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Signature Ember Gradient</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Linear gradient: <code className="text-brand font-mono">from-[#FF8A3D] via-[#FF6B1A] to-[#FF4D00]</code>
                  </p>
                </div>
                <div className="w-full md:w-64 h-10 rounded-full bg-gradient-to-r from-[#FF8A3D] via-[#FF6B1A] to-[#FF4D00] shadow-[0_0_20px_rgba(255,107,26,0.4)] flex items-center justify-center text-xs font-bold text-white tracking-wide">
                  EMBER SPECTRUM
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Typography Scale */}
          {activeTab === 'type' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#07090F] border border-white/10 space-y-4">
                <div className="border-b border-white/10 pb-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.08em] text-brand">Headline Display Hero</div>
                  <div className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05] text-white mt-1">
                    Dress Your <span className="bg-gradient-to-r from-orange-400 via-brand to-amber-300 bg-clip-text text-transparent">Phone.</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-2">Space Grotesk Bold 700 / 72-120px desktop / tracking -2%</div>
                </div>

                <div className="border-b border-white/10 pb-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.08em] text-brand">Section Headline 1</div>
                  <div className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white mt-1">
                    Architected for Impact & Daily Friction
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">Space Grotesk Bold 700 / 32-40px / tracking -2%</div>
                </div>

                <div className="border-b border-white/10 pb-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.08em] text-brand">Body Text</div>
                  <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed mt-1">
                    Every contour, bevel, and tactile switch is engineered to match the precision of modern flagship phones. Military drop-tested to 12 feet.
                  </p>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">Inter 400 / 16px / line-height 1.6</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.08em] text-brand">Technical Spec Label</div>
                    <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-300 font-bold mt-1">
                      MAGSAFE 15W COMPLIANT
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Inter 600 / 12px uppercase / 8% letter spacing</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.08em] text-brand">Price Tabular Figures</div>
                    <div className="text-xl font-bold font-sans text-brand tabular-nums mt-1">
                      ₹1,299 <span className="line-through text-slate-500 text-sm">₹1,999</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Inter tabular-nums / discount badge</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Cards & Glows */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 28px Large Card */}
              <div className="p-6 rounded-[28px] bg-[#07090F] border border-white/10 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-brand mb-2">Token: radius-28</div>
                <h4 className="text-lg font-bold text-white">Large Container Card (28px)</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Used for hero modules, bento tiles, feature story containers, and modal dialogs. Features hairline 1px borders and subtle inner edge reflections.
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Border: <code>rgba(255,255,255,0.08)</code></span>
                  <span className="text-brand font-bold">28px radius</span>
                </div>
              </div>

              {/* 16px Small Card */}
              <div className="p-6 rounded-[16px] bg-[#07090F] border border-white/10 relative overflow-hidden group">
                <div className="text-[10px] font-mono uppercase tracking-widest text-brand mb-2">Token: radius-16</div>
                <h4 className="text-lg font-bold text-white">Compact Card (16px)</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Used for best-seller product cards, review masonry tiles, trust badges, and floating spec chips.
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Elevation: <code>shadow-xl</code></span>
                  <span className="text-brand font-bold">16px radius</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Button States */}
          {activeTab === 'buttons' && (
            <div className="p-6 rounded-2xl bg-[#07090F] border border-white/10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* White Pill CTA */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">White Pill CTA</span>
                  <div>
                    <button className="px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:scale-105">
                      Explore Armor
                    </button>
                  </div>
                </div>

                {/* Ember Primary CTA */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Ember Gradient CTA</span>
                  <div>
                    <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF8A3D] via-[#FF6B1A] to-[#FF4D00] text-white font-bold text-xs shadow-[0_4px_24px_rgba(255,107,26,0.45)] hover:shadow-[0_6px_30px_rgba(255,107,26,0.65)] hover:scale-105 transition-all">
                      Add to Bag • ₹999
                    </button>
                  </div>
                </div>

                {/* Ghost Pill */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Ghost Glass Pill</span>
                  <div>
                    <button className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs hover:border-brand/40 transition-all">
                      Watch Drop Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

