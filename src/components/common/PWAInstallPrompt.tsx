import React, { useState } from 'react';
import { X, Download, Check } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  if (isDismissed) return null;

  const handleInstall = () => {
    setIsInstalled(true);
    setTimeout(() => {
      setIsDismissed(true);
    }, 2500);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-[340px] w-full animate-fade-in select-none">
      <div className="bg-[#121927]/95 backdrop-blur-xl border border-[#223147] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 ring-1 ring-white/10">
        
        {/* App Icon using transparent PNG */}
        <div className="w-10 h-10 rounded-xl bg-[#0b1019] border border-[#1e2a3e] p-1.5 flex items-center justify-center shrink-0 shadow-md">
          <img src="/logo.png" alt="Gadget House" className="w-full h-full object-contain" />
        </div>

        {/* Text Details (Matches Screenshot Bottom Right) */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-extrabold text-white tracking-tight">
            Install Gadget House
          </h4>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
            Add it to your home screen — opens instantly, no app store.
          </p>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            disabled={isInstalled}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1 ${
              isInstalled
                ? 'bg-emerald-600 text-white'
                : 'bg-brand hover:bg-brand-hover text-white shadow-orange-500/20'
            }`}
          >
            {isInstalled ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Installed</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-surface transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
