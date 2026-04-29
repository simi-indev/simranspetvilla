import React from "react";

export function StatCard({ icon: Icon, label, value, accent = "text-brand-ink" }) {
  return (
    <div className="card-pv p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-brand-muted">{label}</span>
        <Icon size={16} className={accent} />
      </div>
      <div className={`font-display font-black text-3xl ${accent}`}>{value}</div>
    </div>
  );
}

export function FilterChip({ label, active, onClick, count, testid }) {
  const cls = active
    ? "bg-brand-primary text-white border-brand-primary"
    : "bg-white text-brand-ink border-brand-border hover:bg-brand-sage/40";
  return (
    <button onClick={onClick} className={`px-3.5 py-1.5 rounded-full text-sm font-display font-bold capitalize transition-all border ${cls}`} data-testid={testid}>
      {label} <span className="opacity-70">({count})</span>
    </button>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-xs font-display font-bold text-brand-muted uppercase tracking-wider mb-1">{label}</div>
      <div className="text-brand-ink">{children}</div>
    </div>
  );
}

export function Input({ label, value, onChange, testid, placeholder = "" }) {
  return (
    <label className="block">
      <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
        data-testid={testid}
      />
    </label>
  );
}
