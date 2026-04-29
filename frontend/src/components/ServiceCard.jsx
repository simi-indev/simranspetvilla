import React from "react";
import * as LucideIcons from "lucide-react";
import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
  const Icon = LucideIcons[service.icon] || LucideIcons.PawPrint;

  return (
    <Link
      to={`/services/${service.slug}`}
      className="card-pv block group relative overflow-hidden"
      data-testid={`service-card-${service.slug}`}
    >
      {service.image_url && (
        <img
          src={service.image_url}
          alt={service.name}
          className="w-full h-40 object-cover rounded-xl mb-4"
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-sage flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
          <Icon size={24} strokeWidth={2.2} />
        </div>

        <div className="text-right">
          <div className="text-xs text-brand-muted">starts at</div>
          <div className="font-display font-extrabold text-brand-secondary text-lg">
            ₹{service.starting_price}
            <span className="text-sm font-normal text-brand-muted">
              /{service.unit}
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-display font-extrabold text-xl text-brand-ink mb-1.5">
        {service.name}
      </h3>

      <p className="text-sm text-brand-muted leading-relaxed mb-4 min-h-[42px]">
        {service.tagline}
      </p>

      <div className="inline-flex items-center gap-1 text-brand-primary font-display font-bold text-sm group-hover:gap-2 transition-all">
        Learn more <LucideIcons.ArrowRight size={16} />
      </div>
    </Link>
  );
}