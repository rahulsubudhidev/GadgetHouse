import React, { useState } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, Home, ArrowRight, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';
import { searchOrderInSupabase } from '../../services/supabaseService';

export const OrderTrackingModal: React.FC = () => {
  const { isOrderTrackingOpen, setIsOrderTrackingOpen, formatPrice } = useStore();
  const { orders } = useAdmin();
  
  const [query, setQuery] = useState('GH-2026-1042');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(orders[0] || null);
  const [returnRequested, setReturnRequested] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOrderTrackingOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setReturnRequested(false);

    // 1. Try Supabase lookup
    const remoteOrder = await searchOrderInSupabase(query);
    if (remoteOrder) {
      setSearchedOrder(remoteOrder);
      setIsSearching(false);
      return;
    }

    // 2. Fallback to local admin orders
    const found = orders.find(
      o => o.orderNumber.toLowerCase() === query.trim().toLowerCase() ||
           o.customer.phone.includes(query.trim())
    );
    setSearchedOrder(found || null);
    setIsSearching(false);
  };

  const steps = [
    { label: 'Order Confirmed', time: 'Nov 13, 11:45 AM', completed: true, icon: CheckCircle2 },
    { label: 'Packed at Hub', time: 'Nov 13, 01:20 PM', completed: true, icon: Package },
    { label: 'Dispatched (Bluedart)', time: 'Nov 13, 03:40 PM', completed: true, icon: Truck },
    { label: 'Out for Delivery', time: 'Expected Nov 15', completed: false, icon: Clock },
    { label: 'Delivered', time: 'Expected Nov 15', completed: false, icon: Home }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={() => setIsOrderTrackingOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl text-slate-100 z-10 my-8">
          
          {/* Header */}
          <div className="p-5 border-b border-dark-border flex items-center justify-between bg-[#0b1019]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-brand" />
              <h3 className="text-base font-bold text-white">Track Your Shipment</h3>
            </div>
            <button
              onClick={() => setIsOrderTrackingOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-surface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. GH-2026-1042) or Mobile Number"
                  className="w-full bg-[#0d1422] text-xs text-white placeholder-slate-500 pl-10 pr-3 py-3 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition"
              >
                Track
              </button>
            </form>

            {/* Order Details Found */}
            {searchedOrder ? (
              <div className="space-y-6">
                
                {/* Status Card */}
                <div className="p-4 rounded-2xl bg-[#0b1019] border border-dark-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Current Status</span>
                    <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      In Transit • On Schedule
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      AWB: <strong className="text-white font-mono">{searchedOrder.trackingNumber || 'BLUEDART-88290'}</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Amount</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {formatPrice(searchedOrder.total)}
                    </span>
                    <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded font-bold uppercase block mt-1">
                      {searchedOrder.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {steps.map((st, i) => {
                    const Icon = st.icon;
                    return (
                      <div key={i} className="relative flex items-start gap-4">
                        <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          st.completed ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 border border-slate-600'
                        }`}>
                          ✓
                        </div>
                        <div className="flex-1">
                          <div className={`text-xs font-bold ${st.completed ? 'text-white' : 'text-slate-400'}`}>
                            {st.label}
                          </div>
                          <div className="text-[11px] text-slate-500">{st.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items in shipment */}
                <div className="p-4 rounded-2xl bg-[#090d15] border border-dark-border text-xs space-y-2">
                  <div className="font-bold text-slate-300 mb-1">Items in this package:</div>
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-400">
                      <span>{item.quantity}x {item.productTitle}</span>
                      <span className="font-mono text-slate-200">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Return / Exchange Workflow (PRD Section 4.6) */}
                <div className="pt-2 border-t border-dark-border/40">
                  {returnRequested ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                      ✓ Return request logged for {searchedOrder.orderNumber}. Our reverse logistics pickup agent will arrive within 24 hours.
                    </div>
                  ) : (
                    <button
                      onClick={() => setReturnRequested(true)}
                      className="w-full py-2.5 bg-[#141e2e] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-dark-border flex items-center justify-center gap-2 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-brand" />
                      <span>Request 7-Day Return / Exchange</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active orders found for "{query}". Try checking with order ID <strong className="text-white">GH-2026-1042</strong>.
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

