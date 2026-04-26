import React from "react";
import { api, adminHeaders, API } from "../../lib/api";
import { toast } from "sonner";
import { Upload, Trash2, Image, CheckCircle } from "lucide-react";

const SECTIONS = [
  { value: "hero", label: "Hero (Homepage)" },
  { value: "about", label: "About Page" },
  { value: "gallery", label: "Gallery" },
  { value: "service-pet-boarding", label: "Service: Boarding" },
  { value: "service-pet-daycare", label: "Service: Daycare" },
  { value: "service-home-grooming", label: "Service: Grooming" },
  { value: "service-pet-sitting", label: "Service: Pet Sitting" },
  { value: "service-pet-food-delivery", label: "Service: Food Delivery" },
  { value: "service-pet-training", label: "Service: Training" },
];

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://orange-acorn-97w9gv5pqp95fxjx5-8000.app.github.dev";

export default function MediaTab() {
  const [images, setImages] = React.useState([]);
  const [section, setSection] = React.useState("gallery");
  const [filterSection, setFilterSection] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef();

  React.useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/images", { headers: adminHeaders() });
      setImages(res.data);
    } catch {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", section);

      try {
        await fetch(`${BACKEND_URL}/api/admin/upload`, {
          method: "POST",
          headers: adminHeaders(),
          body: formData,
        }).then((r) => {
          if (!r.ok) throw new Error("Upload failed");
          return r.json();
        });
        successCount++;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded!`);
      loadImages();
    }
    setUploading(false);
  };

  const handleFileChange = (e) => uploadFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/images/${id}`, { headers: adminHeaders() });
      toast.success("Image deleted");
      setImages(images.filter((img) => img.id !== id));
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const assignImage = async (id, assigned_to) => {
    try {
      await api.patch(`/admin/images/${id}`, { assigned_to }, { headers: adminHeaders() });
      toast.success("Image assigned!");
      loadImages();
    } catch {
      toast.error("Failed to assign image");
    }
  };

  const filteredImages = filterSection
    ? images.filter((img) => img.section === filterSection)
    : images;

  const imageUrl = (img) =>
    img.url.startsWith("/static") ? `${BACKEND_URL}${img.url}` : img.url;

  return (
    <div className="space-y-6" data-testid="media-tab">

      {/* Upload Zone */}
      <div className="card-pv space-y-4">
        <h3 className="font-display font-black text-lg text-brand-ink">Upload Photos</h3>

        <div>
          <label className="block text-sm font-display font-bold text-brand-ink mb-1.5">Upload to section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary"
            data-testid="upload-section"
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50 hover:bg-brand-bg"
          }`}
          data-testid="upload-dropzone"
        >
          <Upload size={32} className="mx-auto mb-3 text-brand-muted" />
          <div className="font-display font-bold text-brand-ink mb-1">
            {uploading ? "Uploading…" : "Drop photos here or click to browse"}
          </div>
          <div className="text-sm text-brand-muted">JPG, PNG, WebP up to 10MB · Multiple files supported</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            data-testid="file-input"
          />
        </div>
      </div>

      {/* Image Library */}
      <div className="card-pv space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-display font-black text-lg text-brand-ink">
            Photo Library ({filteredImages.length})
          </h3>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="p-2 px-3 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary"
            data-testid="filter-section"
          >
            <option value="">All sections</option>
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-brand-muted py-8">Loading photos…</div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center text-brand-muted py-12">
            <Image size={32} className="mx-auto mb-3 opacity-40" />
            No photos yet. Upload some above!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredImages.map((img) => (
              <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-brand-border bg-brand-bg" data-testid={`image-${img.id}`}>
                <img
                  src={imageUrl(img)}
                  alt={img.original_name}
                  className="w-full h-36 object-cover"
                />
                {img.assigned_to && (
                  <div className="absolute top-2 left-2">
                    <span className="flex items-center gap-1 text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle size={10} /> {img.assigned_to}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-2">
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) assignImage(img.id, e.target.value); }}
                    className="w-full text-xs p-1.5 rounded-lg border-0 outline-none"
                    data-testid={`assign-${img.id}`}
                  >
                    <option value="" disabled>Assign to…</option>
                    <option value="hero">Hero image</option>
                    <option value="about">About page</option>
                    <option value="gallery">Gallery</option>
                    {SECTIONS.filter(s => s.value.startsWith("service")).map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const fullUrl = imageUrl(img);
                      navigator.clipboard.writeText(fullUrl);
                      toast.success("URL copied!");
                    }}
                    className="flex items-center gap-1 text-xs text-white bg-brand-primary hover:bg-brand-primary-hover px-3 py-1.5 rounded-full font-bold"
                    data-testid={`copy-url-${img.id}`}
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="flex items-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full font-bold"
                    data-testid={`delete-img-${img.id}`}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
                <div className="p-2">
                  <div className="text-xs text-brand-muted truncate">{img.original_name}</div>
                  <div className="text-xs text-brand-primary font-semibold">
                    {SECTIONS.find(s => s.value === img.section)?.label || img.section}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="card-pv bg-brand-sage/30 border-brand-primary/20">
        <h4 className="font-display font-bold text-brand-ink mb-2">How to use uploaded photos on the website</h4>
        <ol className="text-sm text-brand-muted space-y-1 list-decimal list-inside">
          <li>Upload a photo and select the correct section above</li>
          <li>Hover over the photo → click "Copy URL"</li>
          <li>Go to Homepage or Services tab → paste the URL in the image field → Save</li>
        </ol>
      </div>
    </div>
  );
}