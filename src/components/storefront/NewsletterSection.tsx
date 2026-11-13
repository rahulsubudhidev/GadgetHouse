import React, { useState } from 'react';
import { Mail, ArrowRight, Check, Tag, Sparkles } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-[#0E131D] via-[#141B28] to-[#0A0D15] border border-dark-border dark:border-dark-border light:border-slate-200 p-8 sm:p-14 lg:p-20 text-center shadow-floating">
        
        {/* Subtle orange glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-label">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JOIN THE INNER CIRCLE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white dark:text-white light:text-slate-900 tracking-[-0.03em] leading-tight">
            Get 10% off your first order.
          </h2>

          <p className="text-sm sm:text-base text-dark-muted dark:text-dark-muted light:text-slate-600 leading-relaxed">
            Subscribe for early access to flagship launches, private ember discounts, and phone compatibility blueprint alerts.
          </p>

          {/* Form / Success state */}
          {subscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold max-w-md mx-auto flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You're subscribed! Use code:</span>
              </div>
              <span className="font-mono bg-black/40 px-2 py-1 rounded text-white text-sm font-black border border-white/20">
                WELCOME10
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto pt-2">
              <div className="relative flex-1 w-full">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-[#07090F] dark:bg-[#07090F] light:bg-white text-xs sm:text-sm text-white dark:text-white light:text-slate-900 placeholder-dark-muted pl-11 pr-4 py-4 rounded-full border border-dark-border dark:border-dark-border light:border-slate-300 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-emberStart to-brand-emberEnd text-white rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.03] shadow-glow-subtle flex items-center justify-center gap-2 shrink-0 btn-shine"
              >
                <span>Unlock 10%</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-[11px] text-dark-muted flex items-center justify-center gap-4 pt-2">
            <span>🔒 No spam. Instant 10% discount coupon.</span>
            <span>•</span>
            <span>Unsubscribe anytime.</span>
          </div>

        </div>

      </div>

    </section>
  );
};

