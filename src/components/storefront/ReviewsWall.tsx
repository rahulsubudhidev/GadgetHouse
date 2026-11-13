import React from 'react';
import { Star, CheckCircle, Quote, ThumbsUp } from 'lucide-react';

const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Aakash Verma',
    country: '🇮🇳 India',
    city: 'Bengaluru',
    device: 'iPhone 17 Pro Max',
    rating: 5,
    title: 'Flawless fit, Blueo tempered glass is extraordinary!',
    comment: 'The speaker dust mesh is a game changer. Absolutely zero dust gets inside, and touch responsiveness with the 120Hz ProMotion display is butter smooth. Delivered in 2 days to Bangalore!',
    photo: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80',
    date: '2 days ago'
  },
  {
    id: 2,
    name: 'Hamdan Al Maktoum',
    country: '🇦🇪 UAE',
    city: 'Dubai',
    device: 'Samsung Galaxy S25 Ultra',
    rating: 5,
    title: 'AeroShield Case with MagSafe has insane magnetic grip',
    comment: 'I use it with a magnetic car mount on dune desert roads, and it does not budge a millimeter. The orange accents look premium and tactile clicky buttons feel just like original titanium.',
    photo: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80',
    date: '3 days ago'
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    country: '🇬🇧 UK',
    city: 'London',
    device: 'Google Pixel 9 Pro',
    rating: 5,
    title: 'Camera protector does not cause flash glare at night',
    comment: 'Took multiple test night photos with flash turned on — pure deep blacks without the purple haze other protectors cause. Top tier quality!',
    photo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
    date: '5 days ago'
  },
  {
    id: 4,
    name: 'David Miller',
    country: '🇺🇸 US',
    city: 'San Francisco',
    device: 'iPhone 16 Pro',
    rating: 5,
    title: 'GaN 65W charger replaced all my travel bricks',
    comment: 'Charges my iPhone and MacBook Air concurrently without thermal throttling. The foldable prongs make it the ultimate minimalist EDC adapter.',
    photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    date: '1 week ago'
  }
];

export const ReviewsWall: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-black uppercase tracking-label text-brand inline-block mb-3">
          GLOBAL REPUTATION
        </span>
        <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white dark:text-white light:text-slate-900 tracking-[-0.03em]">
          Beloved in 42 Countries.
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="font-extrabold text-white dark:text-white light:text-slate-900 text-sm">4.9 / 5.0 Rating</span>
          <span className="text-dark-muted text-xs font-mono">• 3,420+ Verified Reviews</span>
        </div>
      </div>

      {/* Hero Quote Card (Large Featured Quote) */}
      <div className="mb-10 rounded-[28px] bg-gradient-to-r from-[#141B28] via-[#0E131D] to-[#141B28] border border-dark-border dark:border-dark-border light:border-slate-200 p-8 sm:p-12 relative overflow-hidden shadow-floating">
        <Quote className="absolute right-6 top-6 w-24 h-24 text-white/5 pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>

          <h3 className="text-xl sm:text-3xl font-display font-bold text-white dark:text-white light:text-slate-900 leading-snug">
            "Gadget House achieves what few accessory companies manage: Apple-level industrial precision with aggressive drop protection that doesn't feel like a brick."
          </h3>

          <div className="pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold">
              TR
            </div>
            <div>
              <div className="font-bold text-sm text-white dark:text-white light:text-slate-900">TechRadar Hardware Review</div>
              <div className="text-xs text-dark-muted font-mono">Editor's Choice Award 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REVIEWS_DATA.map(rev => (
          <div
            key={rev.id}
            className="rounded-[24px] bg-[#0E131D] dark:bg-[#0E131D] light:bg-white border border-dark-border dark:border-dark-border light:border-slate-200 p-6 flex flex-col justify-between hover:border-brand/60 transition-all duration-300 shadow-card"
          >
            <div>
              {/* Rating & Date */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-dark-muted font-mono">{rev.country}</span>
              </div>

              <h4 className="text-sm font-display font-bold text-white dark:text-white light:text-slate-900 mb-2 leading-snug">
                "{rev.title}"
              </h4>

              <p className="text-xs text-dark-muted dark:text-dark-muted light:text-slate-600 leading-relaxed mb-4">
                {rev.comment}
              </p>
            </div>

            {/* Bottom Customer Info */}
            <div className="pt-4 border-t border-dark-border/60 dark:border-dark-border/60 light:border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white dark:text-white light:text-slate-900">
                  <span>{rev.name}</span>
                  <CheckCircle className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div className="text-[10px] font-mono text-brand">
                  {rev.device}
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg overflow-hidden border border-dark-border shrink-0">
                <img src={rev.photo} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};

