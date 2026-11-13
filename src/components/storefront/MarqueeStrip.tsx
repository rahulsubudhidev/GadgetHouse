import React from 'react';

const BRANDS_AND_PAYMENTS = [
  { name: 'Apple iPhone', type: 'device' },
  { name: 'Samsung Galaxy', type: 'device' },
  { name: 'Google Pixel', type: 'device' },
  { name: 'OnePlus Pro', type: 'device' },
  { name: 'Nothing Phone', type: 'device' },
  { name: 'Xiaomi Ultra', type: 'device' },
  { name: 'Motorola Edge', type: 'device' },
  { name: 'Razorpay Verified', type: 'payment' },
  { name: 'Instant UPI', type: 'payment' },
  { name: 'Apple Pay', type: 'payment' },
  { name: 'Google Pay', type: 'payment' },
  { name: 'Visa Secure', type: 'payment' },
  { name: 'Mastercard ID Check', type: 'payment' }
];

export const MarqueeStrip: React.FC = () => {
  return (
    <div className="w-full py-4 bg-[#0A0D15]/80 dark:bg-[#0A0D15]/80 light:bg-[#ECE8E0] border-y border-dark-border dark:border-dark-border light:border-light-border overflow-hidden select-none">
      <div className="flex w-max animate-marquee space-x-10 items-center">
        {[...BRANDS_AND_PAYMENTS, ...BRANDS_AND_PAYMENTS, ...BRANDS_AND_PAYMENTS].map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.12em] text-dark-muted dark:text-dark-muted light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-black transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'device' ? 'bg-brand' : 'bg-emerald-400'}`}></span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

