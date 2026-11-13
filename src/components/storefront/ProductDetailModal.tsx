import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Star, 
  Check, 
  AlertTriangle, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Share2, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PHONE_MODELS } from '../../data/mockData';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    formatPrice, 
    addToCart, 
    activePhoneModel, 
    setActivePhoneModel,
    wishlist, 
    toggleWishlist,
    products
  } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedFinish, setSelectedFinish] = useState<string | undefined>();
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(activePhoneModel?.id);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('760002');
  const [pincodeStatus, setPincodeStatus] = useState<{ checked: boolean; valid: boolean; eta: string } | null>({
    checked: true,
    valid: true,
    eta: 'Delivery in 2–3 business days | COD available'
  });
  const [bundleAdded, setBundleAdded] = useState(false);

  if (!selectedProduct) return null;

  const isFavorited = wishlist.includes(selectedProduct.id);

  // Check compatibility
  const currentModelId = selectedModelId || activePhoneModel?.id;
  const isCompatible = currentModelId 
    ? selectedProduct.compatibleModelIds.includes(currentModelId)
    : true;

  const currentPhoneName = PHONE_MODELS.find(m => m.id === currentModelId)?.name;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setPincodeStatus({
        checked: true,
        valid: true,
        eta: `Express delivery to ${pincode} by Nov 15 | Cash on Delivery available`
      });
    } else {
      setPincodeStatus({
        checked: true,
        valid: false,
        eta: 'Please enter a valid 6-digit Indian PIN code'
      });
    }
  };

  // Find complementary item for bundle
  const bundleComplement = products.find(p => p.id !== selectedProduct.id && p.category !== selectedProduct.category) || products[1];

  const handleAddBundle = () => {
    addToCart(selectedProduct, { quantity: 1, phoneModelId: currentModelId });
    addToCart(bundleComplement, { quantity: 1, phoneModelId: currentModelId });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={() => setSelectedProduct(null)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl text-slate-100 z-10 my-8">
          
          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
            
            {/* Left Image Gallery */}
            <div className="md:col-span-6 space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#0a0e16] border border-dark-border flex items-center justify-center p-6 relative">
                <img
                  src={selectedProduct.images[activeImageIdx] || selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-contain filter drop-shadow-xl"
                />
                {selectedProduct.badge && (
                  <span className="absolute top-4 left-4 bg-brand text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-3">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 p-1 bg-[#090d14] transition ${
                        activeImageIdx === idx ? 'border-brand' : 'border-dark-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Product Details */}
            <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
              
              <div>
                {/* Brand & Reviews */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-brand uppercase tracking-wider">
                    {selectedProduct.accessoryBrand}
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-bold text-white">{selectedProduct.rating}</span>
                    <span className="text-slate-400">({selectedProduct.reviewCount} reviews)</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
                  {selectedProduct.title}
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {selectedProduct.subtitle}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 p-3 rounded-xl bg-[#0f1624] border border-dark-border mb-4">
                  <span className="text-2xl font-black text-white">
                    {formatPrice(selectedProduct.basePrice)}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(selectedProduct.compareAtPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Inclusive of 18% GST (HSN {selectedProduct.hsnCode})
                  </span>
                </div>

                {/* Compatibility Helper (PRD 4.3 Requirement) */}
                <div className="p-3.5 rounded-xl border border-dark-border bg-[#0d1420] mb-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Select Your Phone Model (Fit Guarantee)
                  </label>
                  <select
                    value={currentModelId || ''}
                    onChange={(e) => {
                      setSelectedModelId(e.target.value);
                      const m = PHONE_MODELS.find(item => item.id === e.target.value);
                      if (m) setActivePhoneModel(m);
                    }}
                    className="w-full bg-[#141e2e] text-xs font-medium text-white px-3 py-2.5 rounded-lg border border-dark-border focus:border-brand focus:outline-none"
                  >
                    <option value="">-- Choose phone model --</option>
                    {PHONE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  {/* Compatibility Alert */}
                  {currentModelId && (
                    <div className={`mt-2.5 flex items-center gap-2 text-xs font-semibold p-2 rounded-lg ${
                      isCompatible 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isCompatible ? (
                        <>
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Guaranteed precision fit for {currentPhoneName}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Warning: Not engineered for {currentPhoneName}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Checker by PIN Code */}
                <div className="mb-4">
                  <form onSubmit={handlePincodeCheck} className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Enter 6-digit PIN code"
                        maxLength={6}
                        className="w-full bg-[#0d1420] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-lg border border-dark-border focus:border-brand focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#1c273a] hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition"
                    >
                      Check
                    </button>
                  </form>
                  {pincodeStatus && (
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1.5 ${pincodeStatus.valid ? 'text-slate-300' : 'text-red-400'}`}>
                      <Truck className="w-3.5 h-3.5 text-brand" />
                      {pincodeStatus.eta}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {/* Quantity */}
                  <div className="flex items-center border border-dark-border rounded-xl bg-[#141d2c] text-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold font-mono text-white text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, {
                        quantity,
                        phoneModelId: currentModelId,
                        color: selectedColor,
                        finish: selectedFinish
                      });
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="p-3 rounded-xl bg-[#141d2c] border border-dark-border hover:border-slate-500 text-slate-300 hover:text-white transition"
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-red-500' : ''}`} />
                  </button>
                </div>

              </div>

              {/* Frequently Bought Together Bundle */}
              <div className="mt-5 p-4 rounded-2xl bg-[#090e17] border border-brand/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-brand" />
                    Frequently Bought Together
                  </span>
                  <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                    Save ₹150
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={bundleComplement.images[0]} alt="" className="w-10 h-10 rounded-lg bg-dark-card object-contain p-1" />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{bundleComplement.title}</div>
                      <div className="text-brand font-bold">{formatPrice(bundleComplement.basePrice)}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddBundle}
                    className="px-3 py-1.5 rounded-lg bg-brand/20 hover:bg-brand text-brand hover:text-white font-bold text-xs transition shrink-0"
                  >
                    {bundleAdded ? 'Added!' : '+ Add Both'}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Specs & Features Tab section */}
          <div className="border-t border-dark-border p-6 sm:p-8 bg-[#090d15] text-xs">
            <h4 className="font-bold text-white text-sm mb-3">Key Highlights & Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ul className="space-y-2 text-slate-300">
                {selectedProduct.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="border border-dark-border rounded-xl p-3 bg-[#0d1420] space-y-2">
                {Object.entries(selectedProduct.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-dark-border/40 pb-1">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-semibold text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

