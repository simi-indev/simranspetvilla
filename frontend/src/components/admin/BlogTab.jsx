import React from "react";
import { api, adminHeaders } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, FileText } from "lucide-react";

const EMPTY_FORM = {
  slug: "",
  title: "",
  excerpt: "",
  service: "",
  author: "Simran",
  date: new Date().toISOString().slice(0, 10),
  read_time: "5 min read",
  image: "",
  content: [""],
  published: true,
};

const SERVICE_OPTIONS = [
  { value: "", label: "— None —" },
  { value: "pet-boarding", label: "Pet Boarding" },
  { value: "pet-daycare", label: "Pet Daycare" },
  { value: "home-grooming", label: "Home Grooming" },
  { value: "pet-sitting", label: "Pet Sitting" },
  { value: "pet-food-delivery", label: "Food Delivery" },
  { value: "pet-training", label: "Pet Training" },
];

export default function BlogTab() {
  const [blogs, setBlogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null); // null | "new" | slug string
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/blogs", { headers: adminHeaders() });
      setBlogs(res.data);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setEditing("new");
  };

  const startEdit = (blog) => {
    setForm({
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      service: blog.service || "",
      author: blog.author,
      date: blog.date,
      read_time: blog.read_time,
      image: blog.image || "",
      content: blog.content || [""],
      published: blog.published !== false,
    });
    setEditing(blog.slug);
  };

  const cancel = () => { setEditing(null); setForm(EMPTY_FORM); };

  const save = async () => {
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        await api.post("/admin/blogs", form, { headers: adminHeaders() });
        toast.success("Blog post created!");
      } else {
        await api.put(`/admin/blogs/${editing}`, form, { headers: adminHeaders() });
        toast.success("Blog post updated!");
      }
      setEditing(null);
      loadBlogs();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (slug) => {
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/blogs/${slug}`, { headers: adminHeaders() });
      toast.success("Blog post deleted");
      loadBlogs();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePublish = async (blog) => {
    try {
      await api.put(`/admin/blogs/${blog.slug}`, { published: !blog.published }, { headers: adminHeaders() });
      toast.success(blog.published ? "Post unpublished" : "Post published!");
      loadBlogs();
    } catch {
      toast.error("Failed to update");
    }
  };

  const slugify = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const updateContent = (idx, val) => {
    const updated = [...form.content];
    updated[idx] = val;
    setForm({ ...form, content: updated });
  };

  const addParagraph = () => setForm({ ...form, content: [...form.content, ""] });
  const removeParagraph = (idx) => setForm({ ...form, content: form.content.filter((_, i) => i !== idx) });

  if (editing) {
    return (
      <div className="space-y-5" data-testid="blog-edit-form">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xl text-brand-ink">
            {editing === "new" ? "New Blog Post" : "Edit Post"}
          </h3>
          <button onClick={cancel} className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted" data-testid="cancel-blog">
            <X size={18} />
          </button>
        </div>

        <div className="card-pv space-y-4">
          <h4 className="font-display font-bold text-brand-ink">Post Details</h4>

          <Field
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v, slug: editing === "new" ? slugify(v) : form.slug })}
            testid="blog-title"
            placeholder="How to choose a pet boarding in Pune"
          />

          <Field
            label="Slug (URL)"
            value={form.slug}
            onChange={(v) => setForm({ ...form, slug: v })}
            testid="blog-slug"
            placeholder="how-to-choose-pet-boarding-pune"
          />

          <div>
            <label className="block text-sm font-display font-bold text-brand-ink mb-1.5">Excerpt (shown in blog list)</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={4}
              className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary resize-none"
              data-testid="blog-excerpt"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} testid="blog-author" />
            <Field label="Date (YYYY-MM-DD)" value={form.date} onChange={(v) => setForm({ ...form, date: v })} testid="blog-date" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-display font-bold text-brand-ink mb-1.5">Related Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary"
                data-testid="blog-service"
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Field label="Read Time" value={form.read_time} onChange={(v) => setForm({ ...form, read_time: v })} testid="blog-readtime" placeholder="5 min read" />
          </div>

          <Field label="Cover Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} testid="blog-image" placeholder="https://..." />
          {form.image && (
            <img src={form.image} alt="preview" className="h-40 w-full object-cover rounded-2xl border border-brand-border" />
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 accent-brand-primary"
              data-testid="blog-published"
            />
            <label htmlFor="published" className="text-sm font-display font-bold text-brand-ink cursor-pointer">
              Published (visible on website)
            </label>
          </div>
        </div>

        {/* Content Editor */}
        <div className="card-pv space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-brand-ink">Content</h4>
            <button
              onClick={addParagraph}
              className="flex items-center gap-1 text-sm text-brand-primary font-bold"
              data-testid="add-paragraph"
            >
              <Plus size={14} /> Add paragraph
            </button>
          </div>
          <p className="text-xs text-brand-muted">Each block is a paragraph. Use ## for headings (e.g. "## Why cage-free"), ** ** for bold, and numbered lists (1. 2. 3.). Add a new block per section.</p>
          <div className="space-y-3">
            {form.content.map((para, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea
                  value={para}
                  onChange={(e) => updateContent(idx, e.target.value)}
                  rows={8}
                  placeholder={idx === 0 ? "Opening paragraph…" : "## Section Heading or paragraph text…"}
                  className="flex-1 p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary resize-none text-sm"
                  data-testid={`content-${idx}`}
                />
                {form.content.length > 1 && (
                  <button
                    onClick={() => removeParagraph(idx)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl self-start mt-1"
                    data-testid={`remove-para-${idx}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-full font-display font-bold hover:bg-brand-primary-hover transition-all disabled:opacity-60"
          data-testid="save-blog"
        >
          <Save size={16} /> {saving ? "Saving…" : editing === "new" ? "Publish post" : "Save changes"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="blog-tab">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-black text-lg text-brand-ink">Blog Posts</h3>
          <p className="text-sm text-brand-muted">{blogs.length} posts · {blogs.filter(b => b.published !== false).length} published</p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-full font-display font-bold text-sm hover:bg-brand-primary-hover transition-all"
          data-testid="new-blog-post"
        >
          <Plus size={16} /> New post
        </button>
      </div>

      {loading ? (
        <div className="card-pv text-center text-brand-muted py-8">Loading…</div>
      ) : blogs.length === 0 ? (
        <div className="card-pv text-center text-brand-muted py-12">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          No blog posts yet.
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div key={blog.slug} className="card-pv" data-testid={`blog-row-${blog.slug}`}>
              <div className="flex items-start gap-4">
                {blog.image && (
                  <img src={blog.image} alt={blog.title} className="w-16 h-16 object-cover rounded-2xl border border-brand-border flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-bold text-brand-ink truncate">{blog.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${blog.published !== false ? "bg-brand-sage text-brand-primary" : "bg-brand-peach text-brand-secondary"}`}>
                      {blog.published !== false ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="text-sm text-brand-muted mt-0.5">{blog.date} · {blog.read_time} · by {blog.author}</div>
                  <div className="text-sm text-brand-muted mt-1 line-clamp-1">{blog.excerpt}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(blog)}
                    className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted"
                    title={blog.published !== false ? "Unpublish" : "Publish"}
                    data-testid={`toggle-publish-${blog.slug}`}
                  >
                    {blog.published !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => startEdit(blog)}
                    className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted"
                    data-testid={`edit-blog-${blog.slug}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteBlog(blog.slug)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-400"
                    data-testid={`delete-blog-${blog.slug}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, testid, placeholder = "" }) {
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