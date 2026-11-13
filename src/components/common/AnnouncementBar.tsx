import React from 'react';

const SCROLLER_ITEMS = [
  { text: 'APPLE IPHONE 17 PRO & 16 SERIES', type: 'device' },
  { text: 'FREE EXPRESS SHIPPING ON ORDERS OVER ₹499', type: 'perk' },
  { text: 'SAMSUNG GALAXY S25 ULTRA', type: 'device' },
  { text: '12FT MILITARY DROP-TEST CERTIFIED', type: 'perk' },
  { text: 'GOOGLE PIXEL 9 PRO', type: 'device' },
  { text: '9H SAPPHIRE TEMPERED GLASS', type: 'perk' },
  { text: 'ONEPLUS & NOTHING PHONE', type: 'device' },
  { text: 'RAZORPAY VERIFIED 256-BIT ENCRYPTION', type: 'payment' },
  { text: 'INSTANT UPI & ZERO-FEE EMI', type: 'payment' },
  { text: '7-DAY HASSLE-FREE REPLACEMENTS', type: 'perk' },
  { text: 'XIAOMI ULTRA & MOTOROLA EDGE', type: 'device' },
  { text: 'APPLE PAY • GOOGLE PAY • VISA • MASTERCARD', type: 'payment' }
];

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="w-full bg-[#05070D] dark:bg-[#05070D] light:bg-[#EBE7DF] border-b border-white/10 dark:border-white/10 light:border-slate-300/80 py-1 overflow-hidden select-none z-50 relative">
      <div className="flex w-max animate-marquee space-x-8 items-center text-[10px] font-mono uppercase tracking-[0.12em] font-semibold">
        {[...SCROLLER_ITEMS, ...SCROLLER_ITEMS, ...SCROLLER_ITEMS].map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 whitespace-nowrap text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition-colors"
          >
            <span 
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                item.type === 'device' 
                  ? 'bg-brand shadow-[0_0_6px_rgba(255,107,26,0.8)]' 
                  : item.type === 'payment'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
              }`}
            />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
