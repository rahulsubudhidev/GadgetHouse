import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PHONE_MODELS } from '../../data/mockData';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    freeShippingProgress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    setIsCheckoutOpen
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
    setTimeout(() => setCouponFeedback(null), 4000);
  };

  const remainingForFreeShipping = Math.max(0, 499 - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-card border-l border-dark-border text-slate-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-bold">Your Bag</h3>
              <span className="text-xs bg-[#1a2333] px-2 py-0.5 rounded-full text-slate-300">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-surface transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#101724] px-5 py-3 border-b border-dark-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Truck className="w-3.5 h-3.5 text-brand" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-400 font-bold">Unlocked FREE Express Delivery!</span>
                ) : (
                  <span>
                    Add <strong className="text-brand">{formatPrice(remainingForFreeShipping)}</strong> more for FREE Shipping!
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-brand transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

            {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-300">Your bag is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Find the ultimate armor and fast chargers tailored specifically for your device model.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-hover transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => {
                  const phoneName = PHONE_MODELS.find(m => m.id === item.selectedModelId)?.name;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3.5 p-3 rounded-2xl bg-[#0c121d] border border-dark-border relative group"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-20 h-20 object-cover rounded-xl bg-slate-900 shrink-0"
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
                            {item.product.title}
                          </h4>
                          
                          {/* Options Info */}
                          <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-slate-400">
                            {phoneName && (
                              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-brand font-medium">
                                {phoneName}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedFinish && (
                              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded">
                                {item.selectedFinish}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-extrabold text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-dark-border rounded-lg bg-[#141d2c] text-xs">
                            <button
                              onClick={() => updateCartQty(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold font-mono text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-red-400 p-1 self-start transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* 1-Click Upsell Card: Add tempered glass for 20% off */}
                <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-brand/15 to-transparent border border-brand/30 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&q=80" 
                          alt="Tempered Glass" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-brand font-bold bg-brand/10 px-1.5 py-0.5 rounded">
                          BUNDLE UPGRADE • 20% OFF
                        </div>
                        <h5 className="text-xs font-bold text-white mt-0.5">
                          9H Armor Tempered Glass
                        </h5>
                        <div className="text-[11px] font-semibold text-slate-300 mt-0.5">
                          <span className="text-brand font-bold">{formatPrice(399)}</span>{' '}
                          <span className="line-through text-slate-500 text-[10px]">{formatPrice(499)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const upsellProduct = {
                          id: 'upsell-tempered-glass',
                          title: '9H Armor Ultra-Clear Tempered Glass',
                          description: 'Military 9H anti-scratch protection with oleophobic coating.',
                          category: 'tempered-glass',
                          basePrice: 399,
                          originalPrice: 499,
                          images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80'],
                          rating: 4.9,
                          reviewCount: 420,
                          accessoryBrand: 'Blueo',
                          compatibleModelIds: ['all'],
                          stock: 100,
                          isFeatured: true
                        } as any;
                        addToCart(upsellProduct, { quantity: 1 });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-lg transition whitespace-nowrap shrink-0 hover:scale-105 active:scale-95"
                    >
                      + Add for 20% OFF
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Area with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-dark-border bg-[#0b1019] space-y-4">
              
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon} applied!</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-red-400 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon: WELCOME10, GADGET50"
                      className="flex-1 bg-dark-surface text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl border border-dark-border focus:border-brand focus:outline-none uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1c273a] hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <div className={`text-[11px] mt-1.5 ${couponFeedback.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {couponFeedback.message}
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-dark-border/50">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-medium">{formatPrice(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cartShipping === 0 ? <strong className="text-emerald-400">FREE</strong> : formatPrice(cartShipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-dark-border">
                  <span>Total (Inc. GST)</span>
                  <span className="text-brand text-base">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-xl transition transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-bit SSL encrypted checkout with Razorpay</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

