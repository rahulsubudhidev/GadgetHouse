import React from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Aakash Verma',
    verified: true,
    phoneModel: 'iPhone 17 Pro Max',
    rating: 5,
    title: 'Flawless fit, Blueo tempered glass is extraordinary!',
    comment: 'The speaker dust mesh is a game changer. Absolutely zero dust gets inside, and touch responsiveness with the 120Hz ProMotion display is butter smooth. Delivered in 2 days to Bangalore!',
    date: '2 days ago'
  },
  {
    id: 2,
    name: 'Meera Nambiar',
    verified: true,
    phoneModel: 'Samsung Galaxy S25 Ultra',
    rating: 5,
    title: 'AeroShield Case with MagSafe has insane magnetic grip',
    comment: 'I use it with a magnetic car mount on pothole-filled roads, and it does not budge a millimeter. The orange accents look premium and tactile clicky buttons feel just like original titanium.',
    date: '5 days ago'
  },
  {
    id: 3,
    name: 'Tushar Sen',
    verified: true,
    phoneModel: 'iPhone 16 Pro',
    rating: 5,
    title: 'Camera protector does not cause flash glare at night',
    comment: 'Took multiple test night photos with flash turned on — pure deep blacks without the purple haze other protectors cause. Top tier quality!',
    date: '1 week ago'
  }
];

export const ReviewsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-dark-border/40">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Verified Buyer Reviews</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Trusted by over 45,000+ gadget owners
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <span className="text-slate-200 font-bold text-sm">4.9 / 5.0</span>
          <span className="text-slate-500 text-xs">(Based on 3,420+ store reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map(rev => (
          <div 
            key={rev.id}
            className="p-6 rounded-2xl bg-[#0f1725] border border-dark-border flex flex-col justify-between hover:border-slate-600 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500">{rev.date}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-100 mb-2">
                "{rev.title}"
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {rev.comment}
              </p>
            </div>

            <div className="pt-4 border-t border-dark-border/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>{rev.name}</span>
                  {rev.verified && (
                    <span className="text-emerald-400 flex items-center" title="Verified Customer">
                      <CheckCircle className="w-3 h-3 fill-emerald-400/20" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-brand font-medium">
                  Bought for {rev.phoneModel}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <ThumbsUp className="w-3 h-3" />
                <span>Helpful</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

