import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "../lib/api";

export default function MobileBottomBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border p-3 flex gap-3 shadow-[0_-4px_20px_rgba(27,123,138,0.08)]" data-testid="mobile-bottom-bar">
      <Link to="/book" className="flex-1 btn-primary py-3" data-testid="mobile-bar-book">
        <Calendar size={18} /> Book Now
      </Link>
      <a href={WHATSAPP_LINK()} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full px-6 py-3 font-display font-bold shadow-soft" data-testid="mobile-bar-whatsapp">
        <MessageCircle size={18} /> WhatsApp
      </a>
    </div>
  );
}
