import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAdminToken } from "../lib/api";
import { Lock, PawPrint } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { password });
      setAdminToken(res.data.token);
      toast.success("Welcome back!");
      navigate("/admin/dashboard");
    } catch (e) {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-soft">
            <PawPrint size={22} strokeWidth={2.5} />
          </div>
          <div className="font-display font-extrabold text-lg">Simran's <span className="text-brand-primary">PetVilla</span></div>
        </Link>
        <div className="card-pv">
          <div className="w-12 h-12 rounded-2xl bg-brand-sage text-brand-primary flex items-center justify-center mb-4">
            <Lock size={22} />
          </div>
          <h1 className="font-display font-black text-2xl text-brand-ink">Owner login</h1>
          <p className="text-brand-muted text-sm mt-1">Manage bookings, customers and contacts.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Admin password</span>
              <input
                type="password"
                className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                data-testid="admin-password-input"
                required
              />
            </label>
            <button type="submit" className="btn-primary w-full" disabled={loading} data-testid="admin-login-btn">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="mt-6 text-xs text-brand-muted text-center">
            For demo: password is <code className="bg-brand-bg px-2 py-0.5 rounded">petvilla2026</code>
          </div>
        </div>
        <Link to="/" className="mt-4 block text-center text-sm text-brand-muted hover:text-brand-primary" data-testid="admin-back-home">← Back to website</Link>
      </div>
    </div>
  );
}
