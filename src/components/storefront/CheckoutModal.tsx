import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  CreditCard, 
  QrCode, 
  Building2, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Smartphone,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Order, CustomerAddress } from '../../types';
import { PHONE_MODELS } from '../../data/mockData';
import { saveOrderToSupabase } from '../../services/supabaseService';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    clearCart, 
    cartSubtotal, 
    cartDiscount, 
    cartShipping, 
    cartTotal, 
    appliedCoupon, 
    formatPrice,
    setLastCreatedOrder,
    lastCreatedOrder
  } = useStore();

  const { updateOrderStatus } = useAdmin();

  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'confirmed'>('address');
  
  // Address State
  const [address, setAddress] = useState<CustomerAddress>({
    fullName: 'Rohan Mehra',
    phone: '+91 98765 43210',
    addressLine1: 'Flat 402, Royal Palms, Koramangala 4th Block',
    addressLine2: 'Near Sony World Junction',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    country: 'India'
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const finalShipping = shippingMethod === 'express' ? cartShipping + 99 : cartShipping;
  const finalTotal = cartTotal + (shippingMethod === 'express' ? 99 : 0);

  // CGST 9% and SGST 9% calculation for GST compliance (PRD Section 4.5 & 4.7)
  const taxableAmount = (finalTotal / 1.18);
  const totalTax = finalTotal - taxableAmount;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const orderNumber = `GH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        channel: 'online',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        customer: {
          name: address.fullName,
          phone: address.phone,
          email: `${address.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`
        },
        items: cart.map(item => ({
          productId: item.productId,
          productTitle: item.product.title,
          variantSku: item.product.variants[0]?.sku || 'SKU-GEN',
          phoneModelName: PHONE_MODELS.find(m => m.id === item.selectedModelId)?.name,
          color: item.selectedColor,
          price: item.price,
          quantity: item.quantity,
          hsnCode: item.product.hsnCode,
          gstRate: item.product.gstRate,
          image: item.product.images[0]
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        couponCode: appliedCoupon || undefined,
        shipping: finalShipping,
        taxCGST: Number(cgst.toFixed(2)),
        taxSGST: Number(sgst.toFixed(2)),
        taxIGST: 0,
        total: Number(finalTotal.toFixed(2)),
        status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        shippingAddress: address,
        trackingNumber: `SHIP-${Math.floor(10000 + Math.random() * 90000)}-IN`
      };

      // Asynchronously persist to Supabase if configured
      saveOrderToSupabase(newOrder);

      setConfirmedOrder(newOrder);
      setLastCreatedOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      setStep('confirmed');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={() => step !== 'confirmed' && setIsCheckoutOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl text-slate-100 z-10 my-8">
          
          {/* Top Bar */}
          <div className="p-5 border-b border-dark-border flex items-center justify-between bg-[#0b1019]">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
              <div>
                <h3 className="text-base font-bold text-white">Express Checkout</h3>
                <span className="text-[11px] text-slate-400">Powered by Razorpay 256-bit SSL</span>
              </div>
            </div>

            {step !== 'confirmed' && (
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-surface"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stepper Progress */}
          {step !== 'confirmed' && (
            <div className="grid grid-cols-3 text-center border-b border-dark-border/60 text-xs font-semibold bg-[#0d1422]">
              <div className={`py-3 ${step === 'address' ? 'text-brand border-b-2 border-brand bg-brand/5' : 'text-slate-400'}`}>
                1. Delivery Address
              </div>
              <div className={`py-3 ${step === 'shipping' ? 'text-brand border-b-2 border-brand bg-brand/5' : 'text-slate-400'}`}>
                2. Shipping Method
              </div>
              <div className={`py-3 ${step === 'payment' ? 'text-brand border-b-2 border-brand bg-brand/5' : 'text-slate-400'}`}>
                3. Payment
              </div>
            </div>
          )}

          {/* Step 1: Address Form */}
          {step === 'address' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Shipping Destination (Adaptive Form)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-[#121927] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Mobile Number (for SMS & WhatsApp)</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-[#121927] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-medium">Street Address / House No.</label>
                <input
                  type="text"
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  className="w-full bg-[#121927] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-[#121927] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-[#121927] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">PIN / ZIP Code</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full bg-[#121927] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep('shipping')}
                className="w-full mt-4 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
              >
                <span>Continue to Shipping</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Shipping Method Selection */}
          {step === 'shipping' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Select Shipping Speed
              </h4>

              <div className="space-y-3">
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    shippingMethod === 'standard'
                      ? 'border-brand bg-brand/10 ring-1 ring-brand'
                      : 'border-dark-border bg-[#101725] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-brand" />
                    <div>
                      <h5 className="text-sm font-bold text-white">Standard Road Shipping (Bluedart / Delhivery)</h5>
                      <p className="text-xs text-slate-400">Arrives in 3–5 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {cartShipping === 0 ? 'FREE' : formatPrice(cartShipping)}
                  </span>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    shippingMethod === 'express'
                      ? 'border-brand bg-brand/10 ring-1 ring-brand'
                      : 'border-dark-border bg-[#101725] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-brand" />
                    <div>
                      <h5 className="text-sm font-bold text-white">Priority Air Express (Next Day Dispatch)</h5>
                      <p className="text-xs text-slate-400">Guaranteed 24–48 hour delivery</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">+₹99</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setStep('address')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>
                <button
                  onClick={() => setStep('payment')}
                  className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-xl transition flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Options */}
          {step === 'payment' && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Payment Method
                </h4>
                <div className="text-sm font-black text-brand">
                  Total: {formatPrice(finalTotal)}
                </div>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'UPI' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-brand" />
                  <span>UPI Instant</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'Card' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-brand" />
                  <span>Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'NetBanking' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-brand" />
                  <span>NetBanking</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'COD' ? 'border-brand bg-brand/15 text-white ring-1 ring-brand' : 'border-dark-border bg-[#101725] text-slate-400'
                  }`}
                >
                  <Truck className="w-5 h-5 text-brand" />
                  <span>COD</span>
                </button>
              </div>

              {/* UPI Tab Screen with Simulated Dynamic QR Code */}
              {paymentMethod === 'UPI' && (
                <div className="p-5 rounded-2xl bg-[#0c121d] border border-dark-border text-center space-y-3">
                  <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto shadow-lg flex items-center justify-center">
                    {/* Simulated High-Res QR code */}
                    <div className="w-full h-full border-4 border-slate-900 p-2 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-slate-900"></div>
                        <div className="w-8 h-8 bg-slate-900"></div>
                      </div>
                      <div className="text-center font-bold text-[10px] text-slate-900">
                        SCAN & PAY<br/>{formatPrice(finalTotal)}
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-slate-900"></div>
                        <div className="w-4 h-4 bg-brand"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Scan with any UPI app: Google Pay, PhonePe, Paytm, CRED
                  </p>
                  <span className="text-[11px] font-mono text-slate-500 block">
                    VPA: gadgethouse@icici
                  </span>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="p-4 rounded-2xl bg-[#0c121d] border border-dark-border space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8820"
                      defaultValue="4532 8920 1192 8820"
                      className="w-full bg-[#131b28] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/29"
                        className="w-full bg-[#131b28] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        defaultValue="782"
                        className="w-full bg-[#131b28] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <div className="font-bold">Cash on Delivery Verified</div>
                  <p className="text-slate-300">
                    Pay {formatPrice(finalTotal)} in cash or via UPI to the delivery courier when your order arrives.
                  </p>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div className="p-4 rounded-2xl bg-[#0c121d] border border-dark-border text-xs space-y-2">
                  <span className="text-slate-400">Popular Banks:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 rounded-lg bg-[#141e2e] border border-dark-border hover:border-brand text-slate-200 text-left">
                      HDFC Bank
                    </button>
                    <button className="p-2 rounded-lg bg-[#141e2e] border border-dark-border hover:border-brand text-slate-200 text-left">
                      ICICI Bank
                    </button>
                    <button className="p-2 rounded-lg bg-[#141e2e] border border-dark-border hover:border-brand text-slate-200 text-left">
                      State Bank of India
                    </button>
                    <button className="p-2 rounded-lg bg-[#141e2e] border border-dark-border hover:border-brand text-slate-200 text-left">
                      Axis Bank
                    </button>
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-xl transition transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Payment via Razorpay...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay {formatPrice(finalTotal)} & Complete Order</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('shipping')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                Change Shipping Method
              </button>
            </div>
          )}

          {/* Step 4: Order Confirmation with GST Tax Invoice */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white">Order Confirmed!</h3>
                <p className="text-xs text-slate-300">
                  Thank you, <strong className="text-white">{confirmedOrder.customer.name}</strong>. We've sent your order confirmation and tracking link via WhatsApp & Email.
                </p>
                <div className="inline-block bg-[#121927] border border-dark-border px-3 py-1 rounded-full text-xs font-mono text-brand font-bold mt-2">
                  Order ID: {confirmedOrder.orderNumber}
                </div>
              </div>

              {/* GST Tax Invoice Card */}
              <div className="p-5 rounded-2xl bg-[#090d15] border border-dark-border text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                  <div>
                    <div className="font-extrabold text-white text-sm">GADGET HOUSE RETAIL PVT LTD</div>
                    <div className="text-slate-400 text-[11px]">GSTIN: 21AAACG1942M1Z8</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-200">TAX INVOICE</div>
                    <div className="text-slate-400 text-[11px]">{confirmedOrder.createdAt}</div>
                  </div>
                </div>

                <div className="space-y-1 text-slate-300">
                  {confirmedOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{it.quantity}x {it.productTitle} ({it.phoneModelName || 'Universal'})</span>
                      <span className="font-mono">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dark-border/60 pt-2 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Taxable Amount</span>
                    <span className="font-mono">{formatPrice(taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (9%)</span>
                    <span className="font-mono">{formatPrice(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9%)</span>
                    <span className="font-mono">{formatPrice(sgst)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-dark-border/40">
                    <span>Total Paid ({confirmedOrder.paymentMethod})</span>
                    <span className="text-brand font-mono">{formatPrice(confirmedOrder.total)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  Delivery to: {confirmedOrder.shippingAddress?.addressLine1}, {confirmedOrder.shippingAddress?.city} - {confirmedOrder.shippingAddress?.postalCode}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-[#162132] hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border border-dark-border"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-xs transition shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

