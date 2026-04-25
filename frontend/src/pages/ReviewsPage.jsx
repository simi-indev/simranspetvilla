import React from "react";
import { api } from "../lib/api";
import { useBusinessInfo } from "../lib/businessInfo";
import { Star, Quote } from "lucide-react";

const GALLERY = [
  "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/13923477/pexels-photo-13923477.jpeg",
  "https://images.pexels.com/photos/6131576/pexels-photo-6131576.jpeg",
  "https://images.pexels.com/photos/35133324/pexels-photo-35133324.jpeg",
  "https://images.pexels.com/photos/8434635/pexels-photo-8434635.jpeg",
  "https://images.unsplash.com/photo-1601880348117-25c1127a95df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxkb2clMjBzbGVlcHxlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/32186519/pexels-photo-32186519.jpeg",
];

export default function ReviewsPage() {
  const { info } = useBusinessInfo();
  const [reviews, setReviews] = React.useState([]);

  React.useEffect(() => {
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
  }, []);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });
  const totalReviews = info.review_count || 500;
  const avg = info.rating || 4.8;

  return (
    <div data-testid="reviews-page">
      <section className="section-pad bg-brand-bg border-b border-brand-border">
        <div className="container-pv">
          <div className="max-w-2xl mb-10">
            <span className="trust-badge mb-3"><Star size={14} className="text-yellow-500" /> Reviews & Gallery</span>
            <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">{totalReviews}+ pet parents trust us. Here's why.</h1>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 card-pv text-center" data-testid="rating-summary">
              <div className="font-display font-black text-7xl text-brand-primary leading-none">{avg}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={20} className={i <= Math.round(avg) ? "text-yellow-500" : "text-brand-border"} fill="currentColor" />)}
              </div>
              <div className="text-brand-muted mt-2">{totalReviews}+ verified reviews</div>
            </div>
            <div className="md:col-span-2 card-pv" data-testid="rating-breakdown">
              <h3 className="font-display font-bold mb-4">Rating breakdown</h3>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown[star] || 0;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : (star === 5 ? 92 : star === 4 ? 8 : 0);
                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <div className="w-12 text-sm text-brand-ink">{star}★</div>
                    <div className="flex-1 h-2 bg-brand-bg rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-10 text-right text-sm text-brand-muted">{Math.round(pct)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" data-testid="reviews-list-section">
        <div className="container-pv">
          <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink mb-10">What pet parents say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.id} className="card-pv relative" data-testid={`review-${r.id}`}>
                <Quote size={28} className="text-brand-secondary opacity-30 mb-3" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="text-yellow-500" fill="currentColor" />)}
                </div>
                <p className="text-brand-ink leading-relaxed mb-5">"{r.text}"</p>
                <div className="border-t border-brand-border pt-4">
                  <div className="font-display font-bold text-brand-ink">{r.name}</div>
                  <div className="text-sm text-brand-muted">{r.pet} · {r.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-brand-sage/40" data-testid="gallery-list-section">
        <div className="container-pv">
          <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink mb-10">Photos from the villa</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {GALLERY.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-3xl aspect-square">
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
