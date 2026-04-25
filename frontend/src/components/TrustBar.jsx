import React from "react";
import { Star, Shield, Truck, MapPin, Heart } from "lucide-react";

const items = [
  { icon: Star, label: "4.4★ · 80+ reviews", color: "text-yellow-500" },
  { icon: Heart, label: "100% Cage-free" },
  { icon: Truck, label: "Pickup & Drop" },
  { icon: MapPin, label: "Pune-wide" },
  { icon: Shield, label: "Vaccinated only" },
];

export default function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3" data-testid="trust-bar">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="trust-badge" data-testid={`trust-badge-${i}`}>
            <Icon size={14} className={it.color || ""} strokeWidth={2.4} />
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
