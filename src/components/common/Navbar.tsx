import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  User, 
  Heart, 
  ShoppingCart, 
  Globe, 
  LayoutDashboard, 
  ReceiptText,
  X,
  Command,
  Sliders,
  Palette
} from 'lucide-react';
import { useStore, CURRENCY_CONFIG } from '../../context/StoreContext';
import { Currency, Language } from '../../types';

export const Navbar: React.FC<{ onOpenStyleGuide?: () => void }> = ({ onOpenStyleGuide }) => {
  const { 
    theme, 
    toggleTheme, 
    currency, 
    setCurrency, 
    language, 
    setLanguage,
    cart, 
    wishlist, 
    setIsCartOpen,
    viewMode,
    setViewMode,
    setSelectedProduct,
    products,
    setIsAuthOpen,
    currentUser,
    setCurrentUser,
    isStaff
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showLangCurrencyModal, setShowLangCurrencyModal] = useState(false);

  // Shrink glass header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cmd / Ctrl + K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const matchingProducts = searchQuery.trim()
    ? products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.accessoryBrand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'py-1.5 bg-[#07090F]/85 dark:bg-[#07090F]/85 light:bg-[#F6F3EE]/90 backdrop-blur-xl border-b border-dark-border dark:border-dark-border light:border-light-border shadow-xl'
          : 'py-2 bg-[#07090F]/65 dark:bg-[#07090F]/65 light:bg-[#F6F3EE]/75 backdrop-blur-lg border-b border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Logo on Left */}
            <div 
              onClick={() => setViewMode('storefront')}
              className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
              title="Gadget House Home"
            >
              <img 
                src={theme === 'light' ? '/logo-light.png' : '/logo-transparent.png'} 
                alt="Gadget House" 
                className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_10px_rgba(255,107,26,0.35)]"
              />
              <div className="flex flex-col justify-center">
                <span className="font-display font-extrabold text-[17px] sm:text-[18px] tracking-[0.04em] text-white dark:text-white light:text-slate-900 leading-none">
                  GADGET
                </span>
                <div className="flex items-center gap-1 mt-0.5 leading-none">
                  <span className="w-2 h-[1px] bg-brand rounded-full"></span>
                  <span className="font-bold text-[8.5px] tracking-label text-dark-muted dark:text-dark-muted light:text-slate-600">
                    HOUSE
                  </span>
                  <span className="text-[7.5px] font-black bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white px-1 py-[0.5px] rounded-[2px] tracking-tight shadow-sm">
                    .IN
                  </span>
                  <span className="w-2 h-[1px] bg-brand rounded-full"></span>
                </div>
              </div>
            </div>

            {/* Centered Pill Search with Cmd/K Hint */}
            <div className="flex-1 max-w-md hidden md:block mx-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full bg-[#0E131D]/80 dark:bg-[#0E131D]/80 light:bg-white text-xs text-dark-muted dark:text-dark-muted light:text-slate-500 pl-3.5 pr-2.5 py-1.5 rounded-full border border-dark-border dark:border-dark-border light:border-slate-300 hover:border-brand/60 focus:outline-none transition-all flex items-center justify-between shadow-inner group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-dark-muted group-hover:text-brand transition-colors" />
                  <span className="text-[11px] font-medium">Search cases, glass, 65W chargers...</span>
                </div>
                <div className="flex items-center gap-0.5 bg-[#151B28] dark:bg-[#151B28] light:bg-slate-100 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-400 border border-dark-border dark:border-dark-border light:border-slate-200">
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </div>
              </button>
            </div>

            {/* Right Icons: Currency, Theme, Wishlist, Account, Cart */}
            <div className="flex items-center space-x-1 sm:space-x-2 text-slate-300 dark:text-slate-300 light:text-slate-700">
              
              {/* Style Guide Inspector Pill (Optional) */}
              {onOpenStyleGuide && (
                <button
                  onClick={onOpenStyleGuide}
                  className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#151B28] hover:bg-[#1B2335] text-slate-300 border border-dark-border hover:border-brand transition"
                  title="View Design Style Guide"
                >
                  <Palette className="w-3 h-3 text-brand" />
                  <span>Style Guide</span>
                </button>
              )}

              {/* Currency & Language Button */}
              <button
                onClick={() => setShowLangCurrencyModal(true)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition"
                title="Change Currency & Language"
              >
                <Globe className="w-3.5 h-3.5 text-dark-muted" />
                <span className="font-mono text-[11px] font-bold text-white dark:text-white light:text-slate-900">{currency}</span>
              </button>

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-white/5 text-slate-300 hover:text-white border border-transparent hover:border-white/10 transition"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-brand" />
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setViewMode('catalog')}
                className="relative p-1.5 rounded-full hover:bg-white/5 text-slate-300 hover:text-white border border-transparent hover:border-white/10 transition"
                title="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Button with Animated Count */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-bold text-xs shadow-glow-subtle hover:shadow-glow-orange transition-all duration-300 transform hover:scale-[1.02] btn-shine"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Cart</span>
                <span className="bg-black/40 text-white text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {totalCartCount}
                </span>
              </button>

              {/* Staff / Customer Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  className="w-7 h-7 rounded-full bg-[#151B28] border border-dark-border flex items-center justify-center text-slate-300 hover:text-white hover:border-brand transition"
                  title="Account Menu"
                >
                  <User className="w-3.5 h-3.5" />
                </button>

                {showAvatarMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-[#0E131D] border border-dark-border rounded-2xl shadow-floating p-2 z-50 backdrop-blur-xl text-xs space-y-1"
                    onMouseLeave={() => setShowAvatarMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-dark-border text-dark-muted font-medium">
                      Signed in as <strong className="text-white block">{currentUser ? currentUser.name : 'Guest Shopper'}</strong>
                    </div>

                    <button
                      onClick={() => { setIsAuthOpen(true); setShowAvatarMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition flex items-center justify-between"
                    >
                      <span>Customer Account</span>
                      <User className="w-3.5 h-3.5" />
                    </button>

                    {/* Staff Role Privileged Access Links - Only visible to authenticated staff */}
                    {isStaff && (
                      <div className="pt-1 border-t border-dark-border">
                        <div className="text-[10px] uppercase font-bold text-brand px-3 py-1 tracking-label flex items-center justify-between">
                          <span>Staff Portals</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand/20 text-brand font-mono">
                            {currentUser?.role || 'Staff'}
                          </span>
                        </div>

                        {/* Admin Dashboard - Hidden from Cashiers */}
                        {currentUser?.role !== 'Cashier' && (
                          <button
                            onClick={() => { setViewMode('admin'); setShowAvatarMenu(false); }}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-brand/10 hover:text-brand transition flex items-center justify-between"
                          >
                            <span className="font-semibold">Admin Dashboard</span>
                            <LayoutDashboard className="w-3.5 h-3.5 text-brand" />
                          </button>
                        )}

                        {/* POS Billing Counter - Visible to Cashiers, Managers, and Owners */}
                        {(['Cashier', 'Owner', 'Manager'].includes(currentUser?.role || '')) && (
                          <button
                            onClick={() => { setViewMode('pos'); setShowAvatarMenu(false); }}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-brand/10 hover:text-brand transition flex items-center justify-between"
                          >
                            <span className="font-semibold">POS Billing Counter</span>
                            <ReceiptText className="w-3.5 h-3.5 text-brand" />
                          </button>
                        )}
                      </div>
                    )}

                    {currentUser && (
                      <button
                        onClick={() => { setCurrentUser(null); setShowAvatarMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition pt-1 border-t border-dark-border"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Cmd + K Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-20">
          <div className="w-full max-w-2xl bg-[#0E131D] border border-dark-border rounded-3xl p-5 shadow-floating">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accessories, MagSafe cases, tempered glass..."
                className="w-full bg-[#151B28] text-sm text-white placeholder-dark-muted pl-12 pr-10 py-3.5 rounded-2xl border border-dark-border focus:border-brand focus:outline-none"
              />
              <button 
                onClick={() => setShowSearchModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {matchingProducts.length > 0 ? (
                matchingProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#151B28]/60 hover:bg-[#1B2335] cursor-pointer transition border border-transparent hover:border-dark-border"
                  >
                    <img src={p.images[0]} alt="" className="w-12 h-12 object-contain rounded-xl bg-[#07090F] p-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{p.title}</div>
                      <div className="text-[11px] text-dark-muted">{p.accessoryBrand} • {p.category}</div>
                    </div>
                    <div className="font-mono font-bold text-brand text-sm">
                      ₹{p.basePrice}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-dark-muted">
                  {searchQuery ? `No accessories found for "${searchQuery}"` : 'Type a query or phone model (e.g. "17 Pro", "Blueo", "GaN")'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Currency & Language Modal */}
      {showLangCurrencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E131D] border border-dark-border rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-floating">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-5">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-brand" />
                <h3 className="font-display font-bold text-white text-lg">Localization & Currency</h3>
              </div>
              <button onClick={() => setShowLangCurrencyModal(false)} className="text-dark-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-dark-muted uppercase tracking-label block mb-2">
                  Select Currency (PRD 4.7 Multi-Currency)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition ${
                        currency === curr 
                          ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' 
                          : 'border-dark-border bg-[#151B28] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span>{CURRENCY_CONFIG[curr].label}</span>
                      <span className="font-mono text-brand font-black">{CURRENCY_CONFIG[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-dark-muted uppercase tracking-label block mb-2">
                  Display Language (RTL Supported)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition ${
                      language === 'en' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#151B28] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    English (LTR)
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition ${
                      language === 'hi' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#151B28] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition ${
                      language === 'ar' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#151B28] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowLangCurrencyModal(false)}
                className="w-full mt-2 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white py-3 rounded-2xl font-bold text-xs shadow-glow-subtle"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
