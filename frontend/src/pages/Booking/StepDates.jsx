import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Inp, SITTING_MODES, PROTEINS } from "./BookingFields";

export default function Step3({ data, setData, selectedSlugs, sitterAcknowledged, onShowSitterPopup }) {
  const d = data.dates;
  const setDates = (u) => setData({ ...data, dates: { ...d, ...u } });
  const hasBoarding = selectedSlugs.includes("pet-boarding");
  const hasDaycare = selectedSlugs.includes("pet-daycare");
  const hasFood = selectedSlugs.includes("pet-food-delivery");
  const hasTraining = selectedSlugs.includes("pet-training");
  const hasSitting = selectedSlugs.includes("pet-sitting");
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});
  return (
    <div data-testid="booking-step-dates">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">When & how?</h2>
      <p className="text-brand-muted text-sm mb-6">Pick your dates and options.</p>
      <div className="space-y-5">

{(hasBoarding || (!hasSitting && !hasDaycare)) && (
  <div className="space-y-4">
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Inp label="Check-in date" type="date" value={d.startDate} set={(v) => setDates({ startDate: v })} tid="start-date" min={new Date().toISOString().split("T")[0]} />
        {hasBoarding && (
          <div>
            <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Check-in time</span>
            <select className="input-pv" value={d.checkInTime || "10:00"} onChange={(e) => setDates({ checkInTime: e.target.value })} data-testid="checkin-time">
              {timeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasBoarding && (
        <div className="space-y-2">
          <Inp label="Check-out date" type="date" value={d.endDate} set={(v) => setDates({ endDate: v })} tid="end-date" min={d.startDate || new Date().toISOString().split("T")[0]} />
          <div>
            <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Check-out time</span>
            <select className="input-pv" value={d.checkOutTime || "10:00"} onChange={(e) => setDates({ checkOutTime: e.target.value })} data-testid="checkout-time">
              {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                <option key={t} value={t}>{new Date(`2000-01-01T${t}`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!hasBoarding && !hasDaycare && !hasSitting && (
        <div>
          <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Preferred time</span>
          <select className="input-pv" value={d.timeSlot} onChange={(e) => setDates({ timeSlot: e.target.value })} data-testid="time-slot">
            <option value="">Select a time</option>
            <option>Morning (9 AM – 12 PM)</option>
            <option>Afternoon (12 – 4 PM)</option>
            <option>Evening (4 – 8 PM)</option>
          </select>
        </div>
      )}
    </div>

    {hasBoarding && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
        <div className="font-bold text-sm">🕙 Check-in & Check-out Policy</div>
        <div>• Standard check-in and check-out: <strong>10:00 AM</strong></div>
        <div>• Stays over 5 hours are charged as a full day</div>
        <div>• Late check-out after 11:00 AM: <strong>₹100/hr</strong> — contact us if needed</div>
      </div>
    )}
  </div>
)}
        {hasDaycare && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-brand-ink flex items-center gap-2">☀️ Daycare</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Inp label="Date" type="date" value={d.startDate} set={(v) => setDates({ startDate: v })} tid="daycare-date" min={new Date().toISOString().split("T")[0]} />
              <Inp label="Hours per day" type="number" value={d.daycareHours} set={(v) => setDates({ daycareHours: Math.max(1, Math.min(24, Number(v))) })} tid="daycare-hours" />
              <Inp label="Number of days" type="number" value={d.daycareDays} set={(v) => setDates({ daycareDays: Math.max(1, Number(v)) })} tid="daycare-days" />
            </div>
            <p className="text-xs text-brand-muted">₹150/hr for dogs, ₹100/hr for others. Capped at boarding rate if exceeded.</p>
          </div>
        )}

        {hasSitting && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-4">
            <h3 className="font-display font-bold text-brand-ink flex items-center gap-2">🏠 Pet Sitting</h3>

            <div className="grid grid-cols-3 gap-2">
              {SITTING_MODES.map((m) => (
                <button key={m.value} type="button" onClick={() => setDates({ sittingMode: m.value })} data-testid={`sitting-mode-${m.value}`}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${d.sittingMode === m.value ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div className="font-display font-bold text-sm text-brand-ink">{m.label}</div>
                  <div className="text-[10px] text-brand-muted">{m.desc}</div>
                </button>
              ))}
            </div>

            {d.sittingMode === "hourly" && (
              <div className="grid md:grid-cols-2 gap-3">
                <Inp label="Date" type="date" value={d.sittingStart || d.startDate} set={(v) => setDates({ sittingStart: v, startDate: v })} tid="sitting-date" min={new Date().toISOString().split("T")[0]} />
                <Inp label="Number of hours" type="number" value={d.sittingHours} set={(v) => setDates({ sittingHours: Math.max(1, Math.min(24, Number(v))) })} tid="sitting-hours" />
              </div>
            )}

            {d.sittingMode === "fullday" && (
              <div className="grid md:grid-cols-2 gap-3">
                <Inp label="Date" type="date" value={d.sittingStart || d.startDate} set={(v) => setDates({ sittingStart: v, startDate: v })} tid="sitting-date-fd" min={new Date().toISOString().split("T")[0]} />
                <Inp label="Number of days" type="number" value={d.sittingDays} set={(v) => setDates({ sittingDays: Math.max(1, Number(v)) })} tid="sitting-days-fd" />
              </div>
            )}

            {d.sittingMode === "multiday" && (
              <div className="grid md:grid-cols-2 gap-3">
                <Inp label="Start date" type="date" value={d.sittingStart} set={(v) => setDates({ sittingStart: v })} tid="sitting-start" min={new Date().toISOString().split("T")[0]} />
                <Inp label="End date" type="date" value={d.sittingEnd} set={(v) => setDates({ sittingEnd: v })} tid="sitting-end" min={d.sittingStart || new Date().toISOString().split("T")[0]} />
              </div>
            )}

            <div className="text-xs text-brand-muted space-y-1 bg-white rounded-xl p-3 border border-brand-border">
              <div>⏱️ <strong>Hourly:</strong> ₹350/hr per pet · capped at day rate</div>
              <div>☀️ <strong>Full day:</strong> ₹1,200/day (dogs) · ₹1,000/day (others)</div>
              <div>🗓️ <strong>Multi-day:</strong> ₹1,500/day (dogs) · ₹1,200/day (others)</div>
              <div className="pt-1 border-t border-brand-border mt-1 text-brand-primary font-semibold">Pet sitters may vary during assignment. Only experienced, verified sitters.</div>
            </div>

            {sitterAcknowledged ? (
              <div className="flex items-center gap-2 text-sm text-brand-primary font-display font-bold">
                <CheckCircle2 size={16} /> Sitter assignment acknowledged
              </div>
            ) : (
              <button type="button" onClick={onShowSitterPopup} className="text-sm text-brand-primary font-display font-bold underline" data-testid="show-sitter-info">
                Read about sitter assignment →
              </button>
            )}
          </div>
        )}

        {hasTraining && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-brand-ink">🎓 Training</h3>
            <Inp label="Number of sessions (₹1,500/session)" type="number" value={d.trainingSessions} set={(v) => setDates({ trainingSessions: Math.max(1, Number(v)) })} tid="training-sessions" />
          </div>
        )}

        {hasFood && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-brand-ink">🍗 Meal Protein</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PROTEINS.map((p) => (
                <button key={p.value} type="button" onClick={() => setData({ ...data, options: { ...data.options, foodProtein: p.value } })} data-testid={`protein-${p.value}`}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${data.options.foodProtein === p.value ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
                  <div className="font-display font-bold text-sm text-brand-ink">{p.label}</div>
                  <div className="text-brand-primary font-bold text-sm">₹{p.price}/meal</div>
                  <div className="text-[10px] text-brand-muted">{p.tag}</div>
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Inp label="Meals per day" type="number" value={d.mealsPerDay} set={(v) => setDates({ mealsPerDay: Math.max(1, Math.min(3, Number(v))) })} tid="meals-per-day" />
              <Inp label="Number of days" type="number" value={d.foodDays} set={(v) => setDates({ foodDays: Math.max(1, Number(v)) })} tid="food-days" />
            </div>
          </div>
        )}

        {(hasBoarding || hasDaycare) && (
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-white border-2 border-brand-border rounded-xl hover:border-brand-primary/50" data-testid="separate-room">
            <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={data.options.separateRoom}
              onChange={(e) => setData({ ...data, options: { ...data.options, separateRoom: e.target.checked } })} />
            <div>
              <div className="font-display font-bold text-brand-ink">My pet needs a separate room</div>
              <div className="text-xs text-brand-muted">+₹100/night if your pet doesn't get along with others</div>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
