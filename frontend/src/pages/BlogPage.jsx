import React from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [blogs, setBlogs] = React.useState([]);

  React.useEffect(() => {
    api.get("/blog").then((r) => setBlogs(r.data)).catch(() => {});
  }, []);

  const [featured, ...rest] = blogs;

  return (
    <div className="section-pad" data-testid="blog-page">
      <div className="container-pv">
        <div className="max-w-2xl mb-10">
          <span className="trust-badge mb-3">PetVilla Journal</span>
          <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">Pet care, the Pune way.</h1>
          <p className="text-brand-muted mt-4 text-lg">Honest guides, real stories, no fluff.</p>
        </div>

        {featured && (
          <Link to={`/blog/${featured.slug}`} className="block mb-12 group" data-testid={`blog-featured-${featured.slug}`}>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center bg-white border border-brand-border rounded-3xl overflow-hidden shadow-soft hover:shadow-hover transition-all">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 md:p-10">
                <span className="trust-badge mb-3">Featured</span>
                <h2 className="font-display font-black text-2xl md:text-4xl text-brand-ink leading-tight group-hover:text-brand-primary transition-colors">{featured.title}</h2>
                <p className="text-brand-muted mt-3 text-base leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-4 mt-5 text-sm text-brand-muted">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {featured.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {featured.read_time}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 mt-5 text-brand-primary font-display font-bold">Read article <ArrowRight size={16} /></span>
              </div>
            </div>
          </Link>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((b) => (
            <Link key={b.slug} to={`/blog/${b.slug}`} className="card-pv group p-0 overflow-hidden block" data-testid={`blog-card-${b.slug}`}>
              <div className="aspect-[16/10] overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <h3 className="font-display font-extrabold text-lg text-brand-ink leading-tight group-hover:text-brand-primary transition-colors">{b.title}</h3>
                <p className="text-brand-muted mt-2 text-sm leading-relaxed line-clamp-2">{b.excerpt}</p>
                <div className="flex items-center gap-3 mt-4 text-xs text-brand-muted">
                  <span>{b.date}</span>
                  <span>·</span>
                  <span>{b.read_time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
