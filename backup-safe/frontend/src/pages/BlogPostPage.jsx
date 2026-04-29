import React from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

function renderBlock(line, i) {
  if (line.startsWith("## ")) return <h2 key={i} className="font-display font-black text-2xl md:text-3xl text-brand-ink mt-8 mb-3">{line.replace(/^##\s+/, "")}</h2>;
  if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-brand-ink my-3">{line.replace(/\*\*/g, "")}</p>;
  return <p key={i} className="text-brand-ink/85 leading-relaxed text-lg my-4">{line}</p>;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(null)).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <div className="container-pv py-20 text-center text-brand-muted" data-testid="blog-loading">Loading…</div>;
  if (!post) return (
    <div className="container-pv py-20 text-center" data-testid="blog-not-found">
      <h1 className="font-display font-bold text-2xl">Post not found</h1>
      <Link to="/blog" className="btn-primary mt-6">Back to blog</Link>
    </div>
  );

  return (
    <article className="section-pad" data-testid={`blog-post-${slug}`}>
      <div className="container-pv max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-primary mb-6 text-sm" data-testid="back-to-blog">
          <ArrowLeft size={16} /> Back to blog
        </Link>
        <h1 className="font-display font-black text-4xl md:text-5xl text-brand-ink leading-tight">{post.title}</h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-brand-muted">
          <span>By {post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} /> {post.read_time}</span>
        </div>
        <div className="aspect-[16/9] rounded-3xl overflow-hidden mt-8 shadow-soft">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="mt-8" data-testid="blog-content">
          <p className="text-xl text-brand-muted leading-relaxed font-display italic mb-6 border-l-4 border-brand-primary pl-5">{post.excerpt}</p>
          {post.content.map((line, i) => renderBlock(line, i))}
        </div>
        <div className="mt-12 bg-brand-sage/40 rounded-3xl p-6 md:p-10 text-center">
          <h3 className="font-display font-black text-2xl md:text-3xl text-brand-ink">Ready to book?</h3>
          <p className="text-brand-muted mt-2">Cage-free, vet-checked, loved. Book in 90 seconds.</p>
          <Link to="/book" className="btn-primary mt-5" data-testid="blog-cta-book">Book a Service</Link>
        </div>
      </div>
    </article>
  );
}
