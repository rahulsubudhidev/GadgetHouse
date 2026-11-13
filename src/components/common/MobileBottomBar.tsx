import React from 'react';
import { Home, Compass, Search, ShoppingBag, Palette } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileBottomBarProps {
  onOpenSearch: () => void;
  onOpenStyleGuide?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenSearch, onOpenStyleGuide }) => {
  const { viewMode, setViewMode, cart, setIsCartOpen } = useStore();
  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090F]/95 dark:bg-[#07090F]/95 light:bg-[#F6F3EE]/95 backdrop-blur-2xl border-t border-white/10 dark:border-white/10 light:border-slate-300/60 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => {
            setViewMode('storefront');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            viewMode === 'storefront'
              ? 'text-brand font-bold'
              : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </button>

        {/* Shop / Explore */}
        <button
          onClick={() => setViewMode('catalog')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            viewMode === 'catalog'
              ? 'text-brand font-bold'
              : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <Compass className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] tracking-tight mt-1">Shop</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition"
        >
          <div className="w-9 h-9 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
            <Search className="w-4 h-4" strokeWidth={2} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-slate-300 dark:text-slate-300 light:text-slate-700">Search</span>
        </button>

        {/* Style Guide preview */}
        <button
          onClick={onOpenStyleGuide}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-amber-400 transition"
          title="Design Style Guide"
        >
          <Palette className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] tracking-tight mt-1">Design</span>
        </button>

        {/* Bag */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-brand text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-lg animate-pulse">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Bag</span>
        </button>
      </div>
    </nav>
  );
};

