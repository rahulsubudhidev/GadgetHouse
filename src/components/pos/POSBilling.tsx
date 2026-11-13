import React, { useState, useRef, useEffect } from 'react';
import { 
  Barcode, 
  Search, 
  Smartphone, 
  Trash2, 
  Plus, 
  Minus, 
  PauseCircle, 
  PlayCircle, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Sparkles, 
  Printer, 
  User, 
  Check, 
  Store,
  Layers,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Product, CartItem, Order, PosParkedBill } from '../../types';
import { PHONE_MODELS, CATEGORIES } from '../../data/mockData';
import { POSReceiptModal } from './POSReceiptModal';

export const POSBilling: React.FC = () => {
  const { setViewMode, formatPrice } = useStore();
  const { 
    posShift, 
    recordPosSale, 
    holdBill, 
    parkedBills, 
    resumeBill, 
    deleteParkedBill,
    closePosShift,
    currentRole 
  } = useAdmin();

  const { products } = useStore();

  // POS State
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhoneModel, setCustomerPhoneModel] = useState<string>('');
  
  // Discount
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountPinModal, setDiscountPinModal] = useState(false);
  const [managerPin, setManagerPin] = useState('');

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
  const [cashTendered, setCashTendered] = useState<number>(1000);
  const [cardRef, setCardRef] = useState('TXN-88219');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Parked bills modal
  const [parkedModalOpen, setParkedModalOpen] = useState(false);

  // Focus barcode input on mount
  const barcodeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // Filter products by category, search, and customer's phone model
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (customerPhoneModel && !p.compatibleModelIds.includes(customerPhoneModel)) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.variants.some(v => v.sku.toLowerCase().includes(q) || v.barcode.includes(q));
    }
    return true;
  });

  // Add product to POS cart
  const handleAddToCart = (product: Product) => {
    const variant = product.variants[0];
    const lineId = `${product.id}-${customerPhoneModel || 'pos'}`;

    setPosCart(prev => {
      const existing = prev.find(item => item.id === lineId);
      if (existing) {
        return prev.map(item =>
          item.id === lineId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          product,
          variantId: variant?.id || 'v1',
          selectedModelId: customerPhoneModel || undefined,
          price: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          quantity: 1
        }
      ];
    });
  };

  // Barcode / SKU scan handler on Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const term = barcodeInput.trim().toLowerCase();
    const match = products.find(p => 
      p.variants.some(v => v.barcode === term || v.sku.toLowerCase() === term) ||
      p.title.toLowerCase().includes(term)
    );

    if (match) {
      handleAddToCart(match);
      setBarcodeInput('');
    } else {
      alert(`No product found with barcode / SKU: "${barcodeInput}"`);
    }
  };

  // Cart Totals
  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalPayable = Math.max(0, subtotal - discountAmount);

  // GST 18% split (CGST 9% + SGST 9%)
  const taxableAmount = totalPayable / 1.18;
  const totalTax = totalPayable - taxableAmount;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  // Change calculation
  const changeDue = Math.max(0, cashTendered - totalPayable);

  // Park active bill
  const handleHoldBill = () => {
    if (posCart.length === 0) return;
    const parked: PosParkedBill = {
      id: `park-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: posCart,
      customerPhone,
      customerName,
      selectedPhoneModel: customerPhoneModel
    };
    holdBill(parked);
    setPosCart([]);
    setCustomerPhone('');
    setCustomerName('Walk-in Customer');
  };

  // Recall parked bill
  const handleResumeBill = (id: string) => {
    const bill = resumeBill(id);
    if (bill) {
      setPosCart(bill.items);
      setCustomerPhone(bill.customerPhone || '');
      setCustomerName(bill.customerName || 'Walk-in Customer');
      setCustomerPhoneModel(bill.selectedPhoneModel || '');
      setParkedModalOpen(false);
    }
  };

  // Finalize POS Bill
  const handleFinalizeBill = () => {
    if (posCart.length === 0) return;

    const billNumber = `POS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: billNumber,
      channel: 'POS',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customer: {
        name: customerName,
        phone: customerPhone || '+91 94371 00000'
      },
      items: posCart.map(it => ({
        productId: it.productId,
        productTitle: it.product.title,
        variantSku: it.product.variants[0]?.sku || 'SKU-POS',
        phoneModelName: PHONE_MODELS.find(m => m.id === it.selectedModelId)?.name,
        price: it.price,
        quantity: it.quantity,
        hsnCode: it.product.hsnCode,
        gstRate: it.product.gstRate,
        image: it.product.images[0]
      })),
      subtotal,
      discount: discountAmount,
      shipping: 0,
      taxCGST: Number(cgst.toFixed(2)),
      taxSGST: Number(sgst.toFixed(2)),
      taxIGST: 0,
      total: totalPayable,
      status: 'Delivered',
      paymentMethod: paymentMode === 'Split' ? 'Split' : paymentMode,
      paymentStatus: 'Paid'
    };

    // Deduct stock from Shop Counter in memory
    posCart.forEach(it => {
      const v = it.product.variants[0];
      if (v) {
        v.stockShop = Math.max(0, v.stockShop - it.quantity);
      }
    });

    recordPosSale(newOrder);
    setCompletedOrder(newOrder);
    setPaymentModalOpen(false);
    setPosCart([]);
    setDiscountPercent(0);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Header Bar */}
      <header className="bg-[#0b1019] border-b border-dark-border px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('admin')}
            className="p-1.5 rounded-lg bg-dark-card hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin</span>
          </button>

          <div className="flex items-center gap-2 border-l border-dark-border pl-3">
            <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
            <span className="font-black text-sm tracking-wide text-white">POS BILLING COUNTER</span>
            <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">
              ● Shift Active ({posShift.cashierName})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Parked Bills Button */}
          <button
            onClick={() => setParkedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141e2e] hover:bg-slate-800 text-slate-300 font-semibold border border-dark-border transition"
          >
            <PauseCircle className="w-4 h-4 text-brand" />
            <span>Parked Bills</span>
            {parkedBills.length > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold px-1.5 rounded-full">
                {parkedBills.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode('storefront')}
            className="text-slate-400 hover:text-white"
          >
            Storefront
          </button>
        </div>
      </header>

      {/* Main 2-Panel Billing Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Product Catalogue & Fast Tap Tiles (7 Columns) */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between border-r border-dark-border overflow-y-auto space-y-4">
          
          <div>
            {/* Top Search & Barcode Scan Bar (PRD 7.1) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
              
              {/* Barcode Scanner Input */}
              <form onSubmit={handleBarcodeSubmit} className="sm:col-span-6 relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or type SKU + Enter..."
                  className="w-full bg-[#101725] text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none font-mono"
                />
              </form>

              {/* Product Keyword Search */}
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter name, e.g. Blueo, MagSafe..."
                  className="w-full bg-[#101725] text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                />
              </div>

            </div>

            {/* Customer Phone Compatibility Helper (PRD 7.2) */}
            <div className="p-3 rounded-2xl bg-[#0f1725] border border-dark-border flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand" />
                <span className="text-xs font-bold text-slate-200">Customer's Phone Model:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={customerPhoneModel}
                  onChange={(e) => setCustomerPhoneModel(e.target.value)}
                  className="bg-[#141f30] text-xs text-white px-3 py-1.5 rounded-lg border border-dark-border focus:border-brand focus:outline-none font-semibold"
                >
                  <option value="">-- All models (Show all accessories) --</option>
                  {PHONE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {customerPhoneModel && (
                  <button
                    onClick={() => setCustomerPhoneModel('')}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === 'all' ? 'bg-brand text-white shadow' : 'bg-[#101725] text-slate-400 hover:text-white'
                }`}
              >
                All Gear
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    selectedCategory === cat.slug ? 'bg-brand text-white shadow' : 'bg-[#101725] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Tap Product Tiles Grid (PRD 7.1) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredProducts.map(product => {
                const stock = product.variants[0]?.stockShop || 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    className="p-3 rounded-2xl bg-[#0f1725] border border-dark-border hover:border-brand cursor-pointer transition flex flex-col justify-between group shadow-sm active:scale-95"
                  >
                    <div className="aspect-square rounded-xl bg-[#0a0e16] p-2 mb-2 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                      />
                      <span className="absolute bottom-1 right-1 text-[10px] font-mono font-bold bg-black/60 px-1.5 rounded text-slate-300">
                        {stock} in shop
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight mb-1">
                        {product.title}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="font-black text-brand text-xs font-mono">
                          ₹{product.basePrice}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {product.hsnCode}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right Side: Active Cart & GST Invoice Panel (5 Columns) */}
        <div className="lg:col-span-5 bg-[#0b1019] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
          
          <div>
            {/* Customer Details Box */}
            <div className="p-3 rounded-2xl bg-[#101725] border border-dark-border mb-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand" />
                  Customer (Optional)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">GST B2C Bill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="bg-[#141f30] text-xs text-white px-2.5 py-1.5 rounded-lg border border-dark-border focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile (WhatsApp bill)"
                  className="bg-[#141f30] text-xs text-white px-2.5 py-1.5 rounded-lg border border-dark-border focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Cart Table */}
            <div className="bg-[#0f1725] border border-dark-border rounded-2xl overflow-hidden mb-3">
              <div className="p-3 bg-[#121c2d] text-slate-400 font-bold text-[10px] uppercase tracking-wider flex justify-between">
                <span>Items ({posCart.reduce((s, it) => s + it.quantity, 0)})</span>
                <span>Price / Qty</span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-dark-border/50 text-xs">
                {posCart.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Scan items or tap tiles on the left to start billing.
                  </div>
                ) : (
                  posCart.map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-xs truncate">{item.product.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          HSN: {item.product.hsnCode} • ₹{item.price} each
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-dark-border rounded-lg bg-[#141e2e]">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                setPosCart(prev => prev.map(x => x.id === item.id ? { ...x, quantity: x.quantity - 1 } : x));
                              } else {
                                setPosCart(prev => prev.filter(x => x.id !== item.id));
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              setPosCart(prev => prev.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-white text-xs w-16 text-right">
                          ₹{item.price * item.quantity}
                        </span>

                        <button
                          onClick={() => setPosCart(prev => prev.filter(x => x.id !== item.id))}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Totals & Tender Panel */}
          <div className="space-y-3 pt-2 border-t border-dark-border">
            
            {/* Discount & Hold Buttons */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleHoldBill}
                disabled={posCart.length === 0}
                className="flex-1 py-2 bg-[#121c2d] hover:bg-slate-800 text-slate-300 rounded-xl font-semibold border border-dark-border flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <PauseCircle className="w-4 h-4 text-brand" />
                <span>Hold / Park Bill</span>
              </button>

              <button
                onClick={() => {
                  const val = prompt('Enter Discount % (0 - 50):', String(discountPercent));
                  if (val !== null) {
                    const num = Number(val);
                    if (num > 10 && currentRole === 'Cashier') {
                      alert('Discounts over 10% require Manager PIN approval (PRD 6.2). Please ask manager.');
                      return;
                    }
                    setDiscountPercent(num);
                  }
                }}
                className="px-4 py-2 bg-[#121c2d] hover:bg-slate-800 text-slate-300 rounded-xl font-semibold border border-dark-border transition"
              >
                Discount: {discountPercent}%
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3.5 rounded-2xl bg-[#0f1725] border border-dark-border space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="font-mono">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>CGST (9.0%) + SGST (9.0%)</span>
                <span className="font-mono">₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-white text-base pt-1.5 border-t border-dark-border/60">
                <span>PAYABLE TOTAL</span>
                <span className="text-brand font-mono">₹{totalPayable}</span>
              </div>
            </div>

            {/* Charge / Pay Button */}
            <button
              onClick={() => setPaymentModalOpen(true)}
              disabled={posCart.length === 0}
              className="w-full py-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-sm shadow-xl transition transform hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>CHARGE ₹{totalPayable} (F12)</span>
            </button>

          </div>

        </div>

      </div>

      {/* POS Payment Dialog Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setPaymentModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-dark-border pb-4">
                <div>
                  <h3 className="text-base font-black text-white">Select POS Payment Mode</h3>
                  <span className="text-xs text-slate-400">Bill Amount: <strong className="text-brand font-mono text-sm">₹{totalPayable}</strong></span>
                </div>
                <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {/* Payment Mode Tabs */}
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  onClick={() => setPaymentMode('Cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMode === 'Cash' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-brand" />
                  <span>Cash</span>
                </button>

                <button
                  onClick={() => setPaymentMode('UPI')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMode === 'UPI' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-brand" />
                  <span>UPI Dynamic QR</span>
                </button>

                <button
                  onClick={() => setPaymentMode('Card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMode === 'Card' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-brand" />
                  <span>Card POS</span>
                </button>
              </div>

              {/* Cash Calculator (PRD 7.1) */}
              {paymentMode === 'Cash' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#0b1019] border border-dark-border text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Cash Tendered by Customer</label>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono text-base font-bold"
                    />
                  </div>

                  {/* Quick Note Buttons */}
                  <div className="flex gap-2">
                    {[500, 1000, 2000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setCashTendered(amt)}
                        className="flex-1 py-1.5 bg-[#172336] hover:bg-slate-700 rounded-lg text-slate-300 font-mono font-bold"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-dark-border/40 text-sm">
                    <span className="font-bold text-slate-300">Change Return to Customer:</span>
                    <span className="font-black text-emerald-400 font-mono text-base">
                      ₹{changeDue}
                    </span>
                  </div>
                </div>
              )}

              {/* UPI Dynamic QR Code on Counter Screen (PRD 7.1) */}
              {paymentMode === 'UPI' && (
                <div className="p-4 rounded-2xl bg-[#0b1019] border border-dark-border text-center space-y-2">
                  <div className="w-36 h-36 bg-white p-2 rounded-2xl mx-auto shadow-xl flex items-center justify-center">
                    <div className="w-full h-full border-4 border-slate-900 p-2 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 bg-slate-900"></div>
                        <div className="w-6 h-6 bg-slate-900"></div>
                      </div>
                      <div className="text-center font-bold text-[9px] text-slate-900">
                        GADGET HOUSE<br/>₹{totalPayable}
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 bg-slate-900"></div>
                        <div className="w-3 h-3 bg-brand"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">Customer scans with GPay / PhonePe / Paytm</p>
                </div>
              )}

              {/* Card Reference */}
              {paymentMode === 'Card' && (
                <div className="p-4 rounded-2xl bg-[#0b1019] border border-dark-border text-xs space-y-2">
                  <label className="text-slate-400 block">External POS Terminal Reference / RRN</label>
                  <input
                    type="text"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                    className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              )}

              <button
                onClick={handleFinalizeBill}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl transition"
              >
                Complete Sale & Print Thermal Bill
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Parked Bills Modal (Hold & Resume Bills) */}
      {parkedModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setParkedModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-3xl p-6 text-white z-10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <h3 className="font-bold text-sm">Parked Bills ({parkedBills.length})</h3>
                <button onClick={() => setParkedModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                {parkedBills.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No held bills currently.</div>
                ) : (
                  parkedBills.map(b => (
                    <div key={b.id} className="p-3 rounded-xl bg-[#0f1725] border border-dark-border flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{b.customerName || 'Walk-in'}</div>
                        <div className="text-[11px] text-slate-400">{b.createdAt} • {b.items.length} items</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResumeBill(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white font-bold"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => deleteParkedBill(b.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Receipt Modal on Bill Generation */}
      {completedOrder && (
        <POSReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

    </div>
  );
};

