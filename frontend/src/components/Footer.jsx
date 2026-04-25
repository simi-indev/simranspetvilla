import React from "react";
import { Link } from "react-router-dom";
import { PawPrint, Phone, MapPin, Mail, Instagram, Facebook } from "lucide-react";
import { WHATSAPP_LINK } from "../lib/api";

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white pt-16 pb-28 md:pb-12" data-testid="site-footer">
      <div className="container-pv grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center">
              <PawPrint size={22} strokeWidth={2.5} />
            </div>
            <div className="font-display font-extrabold text-lg">Simran's PetVilla</div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Pune's most trusted cage-free pet care. Boarding, daycare, grooming, sitting, food and training — under one roof.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/80"><span className="text-yellow-400">★ 4.4</span> · 80+ verified reviews</div>
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
          <h4 className="font-display font-bold mb-4">Visit / Reach</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> Lohegaon, Pune — 411047</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={16} /> hello@simranspetvilla.com</li>
            <li className="pt-2 flex items-center gap-3">
              <a href={WHATSAPP_LINK()} target="_blank" rel="noreferrer" className="hover:text-white" data-testid="footer-whatsapp"><Phone size={18} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white"><Instagram size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white"><Facebook size={18} /></a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-pv mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:justify-between gap-2 text-xs text-white/50">
        <div>© 2026 Simran's PetVilla · All rights reserved</div>
        <div className="flex gap-4">
          <span>simranspetvilla.com</span>
          <Link to="/admin" className="hover:text-white/80" data-testid="footer-admin-link">Owner login</Link>
        </div>
      </div>
    </footer>
  );
}
