import React from "react";
import { Link } from "react-router-dom";
import { PawPrint, Phone, MapPin, Mail, Instagram, Facebook, Clock } from "lucide-react";
import { buildWhatsAppLink, useBusinessInfo } from "../lib/businessInfo";

export default function Footer() {
  const { info } = useBusinessInfo();
  return (
    <footer className="bg-brand-ink text-white pt-16 pb-28 md:pb-12" data-testid="site-footer">
      <div className="container-pv grid grid-cols-1 md:grid-cols-5 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center">
              <img src="https://res.cloudinary.com/dwtatrpft/image/upload/v1778504101/WhatsApp_Image_2026-05-11_at_6.19.05_PM_zjgida.jpg" alt="Simran's PetVilla" className="w-10 h-10 rounded-2xl object-cover" />
            </div>
            <div className="font-display font-extrabold text-lg">{info.name}</div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            {info.tagline}. Cage-free home boarding, daycare, grooming, sitting, food and training in Pune.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/80"><span className="text-yellow-400">★ {info.rating}</span> · {info.review_count}+ happy pet parents</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(info.tags || []).slice(0, 3).map((t) => (
              <span key={t} className="text-[11px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/services/pet-boarding" className="hover:text-white" data-testid="footer-link-boarding">Pet Boarding</Link></li>
            <li><Link to="/services/pet-daycare" className="hover:text-white" data-testid="footer-link-daycare">Pet Daycare</Link></li>
            <li><Link to="/services/home-grooming" className="hover:text-white" data-testid="footer-link-grooming">Home Grooming</Link></li>
            <li><Link to="/services/pet-sitting" className="hover:text-white" data-testid="footer-link-sitting">Pet Sitting</Link></li>
            <li><Link to="/services/pet-food-delivery" className="hover:text-white" data-testid="footer-link-food">Food Delivery</Link></li>
            <li><Link to="/services/pet-training" className="hover:text-white" data-testid="footer-link-training">Pet Training</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/reviews" className="hover:text-white">Reviews & Gallery</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/book" className="hover:text-white">Book Now</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4">Visit / Reach</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {info.address}</li>
            <li className="flex items-center gap-2"><Phone size={16} /> {info.phone_primary}{info.phone_secondary ? ` / ${info.phone_secondary}` : ""}</li>
            <li className="flex items-center gap-2"><Mail size={16} /> <a href={`mailto:${info.email}`} className="hover:text-white">{info.email}</a></li>
            <li className="flex items-center gap-2"><Clock size={16} /> {info.hours}</li>
            <li className="pt-2 flex items-center gap-3">
              <a href={buildWhatsAppLink(info.whatsapp_number)} target="_blank" rel="noreferrer" className="hover:text-white" data-testid="footer-whatsapp"><Phone size={18} /></a>
              {info.instagram_url && <a href={info.instagram_url} target="_blank" rel="noreferrer" className="hover:text-white"><Instagram size={18} /></a>}
              {info.facebook_url && <a href={info.facebook_url} target="_blank" rel="noreferrer" className="hover:text-white"><Facebook size={18} /></a>}
            </li>
          </ul>
        </div>
      </div>

      <div className="container-pv mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:justify-between gap-2 text-xs text-white/50">
        <div>© 2026 {info.name} · All rights reserved · Founded by {info.founder_name}</div>
        <div className="flex gap-4">
          <span>simranspetvilla.com</span>
          <Link to="/privacy-policy" className="hover:text-white/80">Privacy</Link>
          <Link to="/terms" className="hover:text-white/80">Terms</Link>
          <Link to="/refund-policy" className="hover:text-white/80">Refunds</Link>
          
        </div>
      </div>
    </footer>
  );
}