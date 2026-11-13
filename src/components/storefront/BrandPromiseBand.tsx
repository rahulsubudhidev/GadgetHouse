import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const PROMISES = [
  {
    icon: Truck,
    title: 'Global Fast Shipping',
    desc: 'Free express road & air delivery across India over ₹499. DHL/FedEx worldwide.',
    tag: 'FREE DISPATCH'
  },
  {
    icon: ShieldCheck,
    title: 'Razorpay 256-Bit SSL',
    desc: 'Protected by PCI-DSS Level 1 encryption. Instant UPI, NetBanking & cards.',
    tag: '100% SECURE'
  },
  {
    icon: RotateCcw,
    title: '7-Day Hassle-Free Returns',
    desc: 'Reverse pickup from your doorstep with instant replacement or full bank refund.',
    tag: 'ZERO RISK'
  },
  {
    icon: Headphones,
    title: '24/7 Expert Tech Support',
    desc: 'Speak directly with hardware accessory engineers via WhatsApp or phone.',
    tag: 'HUMAN ASSIST'
  }
];

export const BrandPromiseBand: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROMISES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group p-6 rounded-[24px] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-200 transition-all duration-300 hover:border-brand/60 hover:shadow-floating hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-dark-muted dark:text-dark-muted light:text-slate-500 uppercase tracking-label">
                    {item.tag}
                  </span>
                </div>

                <h4 className="text-base font-display font-bold text-white dark:text-white light:text-slate-900 mb-1.5">
                  {item.title}
                </h4>

                <p className="text-xs text-dark-muted dark:text-dark-muted light:text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dark-border/40 dark:border-dark-border/40 light:border-slate-100 flex items-center justify-between text-[11px] font-bold text-brand group-hover:underline">
                <span>Learn more</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

