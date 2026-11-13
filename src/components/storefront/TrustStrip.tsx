import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Free Express Shipping',
    desc: 'On all orders above ₹499 with live tracking updates'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    desc: 'Protected by Razorpay with 256-bit encryption & UPI'
  },
  {
    icon: RotateCcw,
    title: '7-Day Easy Returns',
    desc: 'Hassle-free instant replacement or full refund'
  },
  {
    icon: Headphones,
    title: '24/7 Phone & WhatsApp Support',
    desc: 'Real human phone accessory experts ready to assist'
  }
];

export const TrustStrip: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#0f1725] border border-dark-border">
        {TRUST_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20 text-brand shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

