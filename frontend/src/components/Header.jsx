import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, PawPrint } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/reviews", label: "Reviews" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-border" data-testid="site-header">
      <div className="container-pv flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="logo-link">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-transform">
            <img src="https://res.cloudinary.com/dwtatrpft/image/upload/v1778504101/WhatsApp_Image_2026-05-11_at_6.19.05_PM_zjgida.jpg" alt="Simran's PetVilla" className="w-10 h-10 rounded-2xl object-cover shadow-soft group-hover:rotate-6 transition-transform" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-lg text-brand-ink">Simran's <span className="text-brand-primary">PetVilla</span></div>
            <div className="text-[11px] text-brand-muted -mt-0.5">Cage-free pet care · Pune</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7" data-testid="desktop-nav">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `font-display font-semibold text-[15px] hover:text-brand-primary transition-colors ${isActive ? "text-brand-primary" : "text-brand-ink"}`
              }
              data-testid={`nav-${n.label.toLowerCase()}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/book" className="btn-primary" data-testid="header-book-btn">Book a Service</Link>
        </div>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-brand-sage"
          onClick={() => setOpen((v) => !v)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-brand-border bg-white" data-testid="mobile-nav">
          <div className="container-pv py-4 flex flex-col gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-display font-semibold py-3 px-3 rounded-xl ${isActive ? "bg-brand-sage text-brand-primary" : "text-brand-ink hover:bg-brand-sage/60"}`
                }
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/book" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full" data-testid="mobile-header-book-btn">Book a Service</Link>
          </div>
        </div>
      )}
    </header>
  );
}
