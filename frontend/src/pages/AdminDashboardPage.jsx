import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, adminHeaders, setAdminToken, getAdminToken } from "../lib/api";
import { useBusinessInfo } from "../lib/businessInfo";
import { LogOut, Download, RefreshCw, PawPrint, Calendar, CheckCircle, XCircle, Clock, Phone, Mail, MapPin, MessageSquare, Star, Image, FileText, Home, Settings, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReviewsTab from "../components/admin/ReviewsTab";
import BusinessInfoTab from "../components/admin/BusinessInfoTab";
import ServicesTab from "../components/admin/ServicesTab";
import HomepageTab from "../components/admin/HomepageTab";
import MediaTab from "../components/admin/MediaTab";
import BlogTab from "../components/admin/BlogTab";
import { StatCard, FilterChip, DetailRow } from "../components/admin/AdminUI";

const STATUS_OPTIONS = ["new", "confirmed", "completed", "cancelled"];
const STATUS_COLORS = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-brand-sage text-brand-primary border-brand-primary/30",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const TABS = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "contacts", label: "Leads", icon: MessageSquare },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "services", label: "Services", icon: Settings },
  { id: "homepage", label: "Homepage", icon: Home },
  { id: "media", label: "Media", icon: Image },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "business", label: "Business Info", icon: Settings },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { refresh: refreshBusinessInfo } = useBusinessInfo();
  const [bookings, setBookings] = React.useState([]);
  const [contacts, setContacts] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [businessInfo, setBusinessInfo] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [tab, setTab] = React.useState("bookings");
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [syncingGoogle, setSyncingGoogle] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState(new Set());

  React.useEffect(() => {
    if (!getAdminToken()) { navigate("/admin"); return; }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [b, c, s, r, info] = await Promise.all([
        api.get("/admin/bookings", { headers: adminHeaders() }),
        api.get("/admin/contacts", { headers: adminHeaders() }),
        api.get("/admin/stats", { headers: adminHeaders() }),
        api.get("/admin/reviews", { headers: adminHeaders() }),
        api.get("/business-info"),
      ]);
      setBookings(b.data); setContacts(c.data); setStats(s.data); setReviews(r.data); setBusinessInfo(info.data);
    } catch (e) {
      if (e.response?.status === 401) { setAdminToken(null); navigate("/admin"); }
      else toast.error("Failed to load data");
    } finally { setLoading(false); }
  }, [navigate]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status }, { headers: adminHeaders() });
      toast.success(`Booking marked ${status}`);
      loadAll();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch { toast.error("Failed to update"); }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/bookings/${id}`, { headers: adminHeaders() });
      toast.success("Booking deleted");
      loadAll();
      if (selected?.id === id) setSelected(null);
    } catch { toast.error("Failed to delete booking"); }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact lead?")) return;
    try {
      await api.delete(`/admin/contacts/${id}`, { headers: adminHeaders() });
      toast.success("Lead deleted");
      loadAll();
    } catch { toast.error("Failed to delete lead"); }
  };

  const bulkDeleteBookings = async () => {
    if (selectedRows.size === 0) return;
    if (!window.confirm(`Delete ${selectedRows.size} booking(s)? This cannot be undone.`)) return;
    try {
      await Promise.all([...selectedRows].map((id) => api.delete(`/admin/bookings/${id}`, { headers: adminHeaders() })));
      toast.success(`${selectedRows.size} booking(s) deleted`);
      setSelectedRows(new Set());
      loadAll();
    } catch { toast.error("Failed to delete some bookings"); }
  };

  const syncGoogleReviews = async () => {
    setSyncingGoogle(true);
    try {
      const res = await api.post("/admin/sync-google-reviews", {}, { headers: adminHeaders() });
      if (!res.data.configured) {
        toast.info("Google Places API not configured yet — check the setup instructions below.", { duration: 6000 });
        console.log(res.data.setup_instructions);
      } else {
        toast.success(`Synced ${res.data.synced} reviews · ${res.data.new} new (pending approval)`);
        loadAll();
      }
    } catch { toast.error("Sync failed"); }
    finally { setSyncingGoogle(false); }
  };

  const logout = () => { setAdminToken(null); navigate("/admin"); };
  const filteredBookings = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const exportCsv = () => {
    if (filteredBookings.length === 0) { toast.error("No bookings to export"); return; }
    const rows = [
      ["ID", "Status", "Created", "Pet", "Breed", "Owner", "Phone", "Locality", "Services", "Start", "End", "Estimated Price"],
      ...filteredBookings.map((b) => [
        b.id, b.status, b.created_at, b.pet?.name, b.pet?.breed, b.owner?.name, b.owner?.phone,
        b.owner?.locality, (b.services || []).join("|"), b.start_date, b.end_date || "", b.estimated_price || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `petvilla-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-brand-bg" data-testid="admin-dashboard-page">
      <header className="bg-white border-b border-brand-border sticky top-0 z-20">
        <div className="container-pv flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="https://res.cloudinary.com/dwtatrpft/image/upload/v1778504101/WhatsApp_Image_2026-05-11_at_6.19.05_PM_zjgida.jpg" alt="Simran's PetVilla" className="w-9 h-9 rounded-xl object-cover" />
            <div className="leading-tight">
              <div className="font-display font-extrabold text-base">PetVilla Admin</div>
              <div className="text-[11px] text-brand-muted -mt-0.5">Owner dashboard</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-brand-muted hover:text-brand-primary" data-testid="admin-refresh">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-brand-border hover:bg-brand-bg" data-testid="admin-logout">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="container-pv py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8" data-testid="admin-stats">
            <StatCard icon={Calendar} label="Total Bookings" value={stats.total_bookings} />
            <StatCard icon={Clock} label="New" value={stats.new} accent="text-blue-600" />
            <StatCard icon={CheckCircle} label="Confirmed" value={stats.confirmed} accent="text-brand-primary" />
            <StatCard icon={Star} label="Visible Reviews" value={stats.reviews_visible} accent="text-yellow-600" />
            <StatCard icon={MessageSquare} label="Contact Leads" value={stats.contacts} accent="text-brand-secondary" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 mb-6 bg-white border border-brand-border rounded-2xl p-1 w-fit" data-testid="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl font-display font-bold text-sm flex items-center gap-1.5 ${tab === t.id ? "bg-brand-primary text-white" : "text-brand-ink hover:bg-brand-sage/40"}`}
              data-testid={`tab-${t.id}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} count={bookings.length} testid="filter-all" />
                {STATUS_OPTIONS.map((s) => <FilterChip key={s} label={s} active={filter === s} onClick={() => setFilter(s)} count={bookings.filter((b) => b.status === s).length} testid={`filter-${s}`} />)}
              </div>
              <div className="flex items-center gap-2">
                {selectedRows.size > 0 && (
                  <button onClick={bulkDeleteBookings} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50" data-testid="bulk-delete-btn">
                    <Trash2 size={14} /> Delete ({selectedRows.size})
                  </button>
                )}
                <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-brand-border hover:bg-white" data-testid="admin-export-csv">
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
            {loading ? (
              <div className="card-pv text-center text-brand-muted">Loading bookings…</div>
            ) : filteredBookings.length === 0 ? (
              <div className="card-pv text-center text-brand-muted py-12" data-testid="no-bookings">
                <PawPrint size={32} className="mx-auto mb-3 opacity-50" />
                No bookings yet.
              </div>
            ) : (
              <div className="bg-white border border-brand-border rounded-3xl overflow-hidden" data-testid="bookings-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="bookings-table">
                    <thead className="bg-brand-bg border-b border-brand-border text-brand-muted text-xs uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedRows.size === filteredBookings.length && filteredBookings.length > 0}
                            onChange={(e) => setSelectedRows(e.target.checked ? new Set(filteredBookings.map((b) => b.id ?? b.booking_id)) : new Set())}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left p-4">Pet</th>
                        <th className="text-left p-4 hidden md:table-cell">Owner</th>
                        <th className="text-left p-4 hidden lg:table-cell">Services</th>
                        <th className="text-left p-4">Dates</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-right p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg cursor-pointer" onClick={() => setSelected(b)} data-testid={`booking-row-${b.id}`}>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(b.id ?? b.booking_id)}
                              onChange={(e) => {
                                const next = new Set(selectedRows);
                                e.target.checked ? next.add(b.id) : next.delete(b.id);
                                setSelectedRows(next);
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-4"><div className="font-display font-bold text-brand-ink">{b.pet?.name}</div><div className="text-xs text-brand-muted">{b.pet?.breed}</div></td>
                          <td className="p-4 hidden md:table-cell"><div className="text-brand-ink">{b.owner?.name}</div><div className="text-xs text-brand-muted">{b.owner?.phone}</div></td>
                          <td className="p-4 hidden lg:table-cell"><div className="flex flex-wrap gap-1">{(b.services || []).map((s) => <span key={s} className="text-xs bg-brand-sage text-brand-primary px-2 py-0.5 rounded-full">{s}</span>)}</div></td>
                          <td className="p-4 text-brand-ink whitespace-nowrap">{b.start_date}{b.end_date ? ` → ${b.end_date}` : ""}</td>
                          <td className="p-4"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                          <td className="p-4 text-right"><button className="text-brand-primary hover:underline text-sm font-display font-bold" onClick={(e) => { e.stopPropagation(); setSelected(b); }} data-testid={`view-booking-${b.id}`}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Contacts Tab */}
        {tab === "contacts" && (
          <div className="space-y-3" data-testid="contacts-list">
            {contacts.length === 0 ? (
              <div className="card-pv text-center text-brand-muted py-12"><MessageSquare size={32} className="mx-auto mb-3 opacity-50" />No contact submissions yet.</div>
            ) : contacts.map((c) => (
              <div key={c.id} className="card-pv group relative" data-testid={`contact-row-${c.id}`}>
                <button
                  onClick={() => deleteContact(c.id)}
                  className="absolute top-4 right-4 p-2 text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete lead"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div><div className="font-display font-bold text-brand-ink">{c.name}</div><div className="text-sm text-brand-muted">{c.phone}{c.email && ` · ${c.email}`}</div></div>
                  <div className="text-xs text-brand-muted">{new Date(c.created_at).toLocaleString()}</div>
                </div>
                <p className="text-brand-ink mt-3 leading-relaxed">{c.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {tab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div />
              <button
                onClick={syncGoogleReviews}
                disabled={syncingGoogle}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-full text-sm font-display font-bold hover:bg-[#C96E14] transition-all disabled:opacity-60"
                data-testid="sync-google-reviews"
              >
                <RefreshCcw size={14} className={syncingGoogle ? "animate-spin" : ""} />
                {syncingGoogle ? "Syncing…" : "Sync from Google"}
              </button>
            </div>
            <ReviewsTab reviews={reviews} reload={loadAll} />
          </div>
        )}

        {/* New CMS Tabs */}
        {tab === "services" && <ServicesTab reload={loadAll} />}
        {tab === "homepage" && <HomepageTab reload={loadAll} />}
        {tab === "media" && <MediaTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "business" && businessInfo && (
          <BusinessInfoTab info={businessInfo} reload={() => { loadAll(); refreshBusinessInfo(); }} />
        )}
      </div>

      {/* Booking Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-30 flex" data-testid="booking-detail-drawer">
          <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-xl text-brand-ink">Booking details</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-brand-bg rounded-xl" data-testid="close-drawer"><XCircle size={20} /></button>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${STATUS_COLORS[selected.status]}`}>{selected.status}</div>
            <div className="space-y-4 text-sm">
              <DetailRow label="Booking ID"><code className="text-xs">{selected.id}</code></DetailRow>
              <DetailRow label="Created">{new Date(selected.created_at).toLocaleString()}</DetailRow>
              <DetailRow label="Pet">
                <div><strong>{selected.pet?.name}</strong> · {selected.pet?.species} · {selected.pet?.breed}</div>
                <div className="text-brand-muted text-xs">Age {selected.pet?.age || "—"} · {selected.pet?.weight || "—"}kg · Vaccinated: {selected.pet?.vaccinated ? "Yes" : "No"}</div>
                {selected.pet?.special_needs && <div className="mt-1 text-brand-muted text-xs">Special: {selected.pet.special_needs}</div>}
              </DetailRow>
              <DetailRow label="Services"><div className="flex flex-wrap gap-1">{(selected.services || []).map((s) => <span key={s} className="text-xs bg-brand-sage text-brand-primary px-2 py-0.5 rounded-full">{s}</span>)}</div></DetailRow>
              <DetailRow label="Dates">{selected.start_date}{selected.end_date ? ` → ${selected.end_date}` : ""} {selected.time_slot && `· ${selected.time_slot}`}</DetailRow>
              <DetailRow label="Owner">
                <div><strong>{selected.owner?.name}</strong></div>
                <div className="flex items-center gap-1.5 text-brand-muted mt-1"><Phone size={12} /> {selected.owner?.phone}</div>
                {selected.owner?.email && <div className="flex items-center gap-1.5 text-brand-muted"><Mail size={12} /> {selected.owner?.email}</div>}
                {selected.owner?.locality && <div className="flex items-center gap-1.5 text-brand-muted"><MapPin size={12} /> {selected.owner?.locality}</div>}
                {selected.owner?.address && <div className="text-brand-muted text-xs mt-1">{selected.owner.address}</div>}
                {selected.owner?.pickup_drop && <div className="text-brand-secondary text-xs mt-1 font-bold">+ Pickup & Drop</div>}
              </DetailRow>
              {selected.notes && <DetailRow label="Notes">{selected.notes}</DetailRow>}
              {selected.estimated_price && <DetailRow label="Estimated price">₹{selected.estimated_price}</DetailRow>}
            </div>
            <div className="mt-6 pt-6 border-t border-brand-border">
              <div className="text-xs font-display font-bold text-brand-muted uppercase tracking-wider mb-2">Update status</div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={selected.status === s}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selected.status === s ? "bg-brand-primary text-white border-brand-primary" : "bg-white border-brand-border hover:bg-brand-sage/40"}`}
                    data-testid={`status-btn-${s}`}>{s}</button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => deleteBooking(selected.id)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-full text-sm font-display font-bold hover:bg-red-50 transition-all"
                  data-testid="delete-booking-btn"
                >
                  Delete Booking
                </button>
                {selected.owner?.phone && (
                  <a href={`https://wa.me/${selected.owner.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${selected.owner.name}! This is Simran from PetVilla. Confirming your booking for ${selected.pet?.name} on ${selected.start_date}.`)}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-display font-bold justify-center"
                    data-testid="whatsapp-customer"><Phone size={14} /> WhatsApp customer</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}