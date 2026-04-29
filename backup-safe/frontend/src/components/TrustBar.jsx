import React from "react";
import { Star, Shield, Truck, MapPin, Heart, Clock } from "lucide-react";
import { useBusinessInfo } from "../lib/businessInfo";

export default function TrustBar() {
  const { info } = useBusinessInfo();
  const items = [
    { icon: Star, label: `${info.rating}★ · ${info.review_count}+ reviews`, color: "text-yellow-500" },
    { icon: Heart, label: "100% Cage-free" },
    { icon: Clock, label: "Open 24/7" },
    { icon: Truck, label: "Pickup & Drop" },
    { icon: MapPin, label: "Pune-wide" },
    { icon: Shield, label: "Women-owned" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3" data-testid="trust-bar">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="trust-badge" data-testid={`trust-badge-${i}`}>
            <Icon size={14} className={it.color || ""} strokeWidth={2.4} />
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
