import React from "react";
import { AlertTriangle } from "lucide-react";
import { Inp, validatePhone } from "./BookingFields";

export default function StepOwner({ owner, setOwner, notes, setNotes, hasSitting }) {
  const set = (u) => setOwner({ ...owner, ...u });
  return (
    <div data-testid="booking-step-owner">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Your details</h2>
      <p className="text-brand-muted text-sm mb-6">So we can confirm on WhatsApp.</p>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Inp label="Your Name" value={owner.name} set={(v) => set({ name: v })} ph="Anjali Mehta" tid="owner-name" />
          <div>
            <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">WhatsApp Number</span>
            <div className="flex">
              <span className="flex items-center px-3 bg-brand-bg border-2 border-r-0 border-brand-border rounded-l-2xl text-sm text-brand-muted font-bold">+91</span>
              <input className="input-pv rounded-l-none" value={owner.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="98765 43210" maxLength={14} data-testid="owner-phone" />
            </div>
            {owner.phone && !validatePhone(owner.phone) && (
              <p className="text-red-500 text-xs mt-1">Enter a valid 10-digit mobile number</p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Inp label="Email (optional)" type="email" value={owner.email} set={(v) => set({ email: v })} ph="you@example.com" tid="owner-email" />
          <Inp label="Locality" value={owner.locality} set={(v) => set({ locality: v })} ph="Viman Nagar, Kharadi…" tid="owner-locality" />
        </div>
        <Inp label="Full Address (for home services / pickup)" value={owner.address} set={(v) => set({ address: v })} ph="Flat No, Society, Street" tid="owner-address" area />

        {!hasSitting && (
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-brand-bg rounded-xl border-2 border-brand-border" data-testid="pickup-drop">
            <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={owner.pickup_drop} onChange={(e) => set({ pickup_drop: e.target.checked })} />
            <div>
              <div className="font-display font-bold text-brand-ink">I'd like pickup & drop</div>
              <div className="text-xs text-brand-muted">₹150–300 based on locality</div>
            </div>
          </label>
        )}

        <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-brand-secondary" />
            <span className="font-display font-bold text-sm text-brand-ink">Emergency & Vet Details</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Inp label="Emergency Contact Name" value={owner.emergency_name} set={(v) => set({ emergency_name: v })} ph="Spouse, parent, friend" tid="emergency-name" />
            <Inp label="Emergency Phone" value={owner.emergency_phone} set={(v) => set({ emergency_phone: v })} ph="98765 43210" tid="emergency-phone" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Inp label="Your Vet's Name (optional)" value={owner.vet_name} set={(v) => set({ vet_name: v })} ph="Dr. Sharma" tid="vet-name" />
            <Inp label="Vet Phone (optional)" value={owner.vet_phone} set={(v) => set({ vet_phone: v })} ph="020-12345678" tid="vet-phone" />
          </div>
        </div>

        <Inp label="Anything else? (optional)" value={notes} set={setNotes} ph="Special requests, food preferences…" tid="notes" area />
      </div>
    </div>
  );
}
