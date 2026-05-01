import React from "react";

/**
 * Shared input component for the booking flow.
 */
export function Inp({ label, value, set, ph = "", tid, type = "text", area = false, min }) {
  const Tag = area ? "textarea" : "input";
  return (
    <label className="block" data-testid={`${tid}-field`}>
      <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">{label}</span>
      <Tag
        className={`input-pv ${area ? "resize-none" : ""}`}
        type={type}
        value={value ?? ""}
        onChange={(e) => set(e.target.value)}
        placeholder={ph}
        rows={area ? 3 : undefined}
        min={min}
        data-testid={tid}
      />
    </label>
  );
}

/**
 * Progress bar styling helpers.
 */
export const STATUS_PILL = (i, step) => 
  i < step ? "bg-brand-sage text-brand-primary" : i === step ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-muted";

export const STATUS_BADGE = (i, step) => 
  i < step ? "bg-brand-primary text-white" : i === step ? "bg-white text-brand-primary" : "bg-brand-border text-brand-muted";

/**
 * Constants used across steps.
 */
export const STEPS = ["Service", "Pets", "Dates", "Owner", "Review", "Done"];

export const SPECIES = [
  { value: "Dog", label: "🐕 Dog" },
  { value: "Cat", label: "🐈 Cat" },
  { value: "Bird", label: "🐦 Bird" },
  { value: "Rabbit", label: "🐰 Rabbit" },
  { value: "Turtle", label: "🐢 Turtle" },
  { value: "Other", label: "🐾 Other" },
];

export const DOG_SIZES = [
  { value: "small", label: "Small", desc: "Under 10 kg", examples: "Shih Tzu, Pom, Dachshund" },
  { value: "medium", label: "Medium", desc: "10–25 kg", examples: "Beagle, Cocker, Indie" },
  { value: "large", label: "Large", desc: "25–40 kg", examples: "Lab, Golden, GSD" },
  { value: "giant", label: "Giant", desc: "40 kg+", examples: "Great Dane, Saint Bernard, Rottweiler" },
];

export const PROTEINS = [
  { value: "egg", label: "Egg + Paneer", price: 99, tag: "Budget" },
  { value: "chicken", label: "Chicken & Rice", price: 149, tag: "Popular" },
  { value: "fish", label: "Fish & Quinoa", price: 179, tag: "Skin & Coat" },
  { value: "lamb", label: "Lamb & Pumpkin", price: 219, tag: "Premium" },
];

export const SITTING_MODES = [
  { value: "hourly", label: "A few hours", desc: "₹350/hr per pet · capped at day rate", icon: "⏱️" },
  { value: "fullday", label: "Full day", desc: "Morning to evening", icon: "☀️" },
  { value: "multiday", label: "Multiple days", desc: "Sitter stays with your pet", icon: "🗓️" },
];

export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const match = cleaned.match(/^(?:\+91|91)?(\d{10})$/);
  if (!match) return null;
  const num = match[1];
  if (!/^[6-9]/.test(num)) return null;
  if (/^(\d)\1{9}$/.test(num)) return null;
  if (num === "1234567890" || num === "9876543210") return null;
  return num;
}
