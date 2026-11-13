import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, Language, Product, CartItem, Order, PhoneModel, AuthUser } from '../types';
import { PRODUCTS, PHONE_MODELS, COUPONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseProducts, getSupabasePhoneData, getStaffRoleForEmail } from '../services/supabaseService';

export const CURRENCY_CONFIG: Record<Currency, { symbol: string; rate: number; label: string }> = {
  INR: { symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  USD: { symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.011, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.0095, label: 'GBP (£)' },
  AED: { symbol: 'AED ', rate: 0.044, label: 'AED (د.إ)' }
};

interface StoreContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInINR: number) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  activePhoneModel: PhoneModel | null;
  setActivePhoneModel: (model: PhoneModel | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, options?: { phoneModelId?: string; color?: string; finish?: string; quantity?: number }) => void;
  updateCartQty: (lineId: string, delta: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTotal: number;
  freeShippingProgress: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  viewMode: 'storefront' | 'catalog' | 'admin' | 'pos';
  setViewMode: (mode: 'storefront' | 'catalog' | 'admin' | 'pos') => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (o: Order | null) => void;
  isSupabaseOnline: boolean;
  isStaff: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(isSupabaseConfigured());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('gh_theme') as 'dark' | 'light') || 'dark';
  });
  const [currency, setCurrency] = useState<Currency>('INR');
  const [language, setLanguage] = useState<Language>('en');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activePhoneModel, setActivePhoneModelState] = useState<PhoneModel | null>(() => {
    const saved = localStorage.getItem('gh_active_phone_model');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to popular iPhone 17 Pro
    return PHONE_MODELS.find(m => m.id === 'ip-17-p') || null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gh_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('gh_wishlist');
    return saved ? JSON.parse(saved) : ['prod-blueo-clear', 'prod-magsafe-aeroshield'];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'storefront' | 'catalog' | 'admin' | 'pos'>('storefront');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  const isStaff = Boolean(
    currentUser && currentUser.role && currentUser.role !== 'Customer'
  );

  const handleSetCurrentUser = (user: AuthUser | null) => {
    if (!user) {
      setCurrentUser(null);
      return;
    }
    if (!user.role) {
      getStaffRoleForEmail(user.email).then((staffRole) => {
        setCurrentUser({
          ...user,
          role: staffRole || 'Customer'
        });
      });
    } else {
      setCurrentUser(user);
    }
  };

  // Sync Supabase Auth session & initial data
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseOnline(false);
      return;
    }

    const syncUser = async (user: any) => {
      if (!user) {
        setCurrentUser(null);
        return;
      }
      const staffRole = await getStaffRoleForEmail(user.email || '');
      setCurrentUser({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        role: staffRole || (user.user_metadata?.role as any) || 'Customer'
      });
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user);
    });

    // 3. Fetch products and phone data from Supabase
    getSupabaseProducts().then((remoteProds) => {
      if (remoteProds && remoteProds.length > 0) {
        setProducts(remoteProds);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('gh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle RTL for Arabic
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  // Handle theme switching with dual class support (dark & light)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('gh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setActivePhoneModel = (model: PhoneModel | null) => {
    setActivePhoneModelState(model);
    if (model) {
      localStorage.setItem('gh_active_phone_model', JSON.stringify(model));
    } else {
      localStorage.removeItem('gh_active_phone_model');
    }
  };

  const formatPrice = (amountInINR: number): string => {
    const cfg = CURRENCY_CONFIG[currency];
    const converted = amountInINR * cfg.rate;
    if (currency === 'INR') {
      return `${cfg.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${cfg.symbol}${converted.toFixed(2)}`;
  };

  const addToCart = (
    product: Product,
    options?: { phoneModelId?: string; color?: string; finish?: string; quantity?: number }
  ) => {
    const qty = options?.quantity || 1;
    const modelId = options?.phoneModelId || activePhoneModel?.id;
    const color = options?.color || product.variants[0]?.colorName;
    const finish = options?.finish || product.variants[0]?.finish;
    const lineId = `${product.id}-${modelId || 'generic'}-${color || ''}-${finish || ''}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === lineId);
      if (existing) {
        return prev.map(item =>
          item.id === lineId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          product,
          variantId: product.variants[0]?.id || 'v1',
          selectedModelId: modelId,
          selectedColor: color,
          selectedFinish: finish,
          price: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          quantity: qty
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (lineId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === lineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (lineId: string) => {
    setCart(prev => prev.filter(item => item.id !== lineId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const coupon = COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    if (cartSubtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Coupon requires minimum order of ₹${coupon.minOrderValue}`
      };
    }
    setAppliedCoupon(coupon.code);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let cartDiscount = 0;
  if (appliedCoupon) {
    const coupon = COUPONS.find(c => c.code === appliedCoupon);
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        cartDiscount = (cartSubtotal * coupon.discountValue) / 100;
      } else {
        cartDiscount = coupon.discountValue;
      }
    }
  }

  // Free shipping threshold ₹499
  const FREE_SHIPPING_THRESHOLD = 499;
  const cartShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cart.length === 0 ? 0 : 50;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShipping);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatPrice,
        language,
        setLanguage,
        activePhoneModel,
        setActivePhoneModel,
        products,
        setProducts,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,
        freeShippingProgress,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        viewMode,
        setViewMode,
        selectedCategorySlug,
        setSelectedCategorySlug,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isAuthOpen,
        setIsAuthOpen,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        lastCreatedOrder,
        setLastCreatedOrder,
        isSupabaseOnline,
        isStaff
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};

