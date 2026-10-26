"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../lib/toast";
import { api } from "../../../../lib/api";
import {
  ArrowLeft,
  Sparkles,
  Save,
  UploadCloud,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function EditPhotoPage() {
  const params = useParams();
  const id = params?.id as string;

  const { user, isLoading } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (id) {
      loadPhoto(id);
    }
  }, [id, user, isLoading, router]);

  const loadPhoto = async (photoId: string) => {
    try {
      setLoading(true);
      const data = await api.getPhoto(photoId);
      setName(data.name);
      setLocation(data.location);
      setDescription(data.description);
      setCurrentImageUrl(data.imageUrl);
    } catch (err: any) {
      error(err.message || "Failed to load photo");
      router.push("/photos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        error("Please select a valid image file");
        return;
      }
      setNewImageFile(file);
      setNewPreviewUrl(URL.createObjectURL(file));
    }
  };

  const cancelNewFile = () => {
    setNewImageFile(null);
    if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    setNewPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (newImageFile) {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("location", location.trim());
        formData.append("description", description.trim());
        formData.append("image", newImageFile);
        await api.updatePhoto(id, formData);
      } else {
        await api.updatePhoto(id, {
          name: name.trim(),
          location: location.trim(),
          description: description.trim(),
        });
      }

      success("Photo and AI summary updated successfully!");
      router.push(`/photos/${id}`);
    } catch (err: any) {
      error(err.message || "Failed to update photo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <p style={{ color: "var(--primary)" }}>Loading photo...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href={`/photos/${id}`} className="btn btn-secondary btn-sm" style={{ marginBottom: "16px" }}>
          <ArrowLeft size={16} />
          <span>Back to Photo</span>
        </Link>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
          Edit Travel Photo
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Modifying the description will automatically re-generate the AI travel summary.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Current or New Image Preview */}
          <div className="form-group">
            <label className="form-label">Photo</label>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--border-subtle)",
                maxHeight: "340px",
                background: "#0f172a",
                marginBottom: "12px",
              }}
            >
              <img
                src={newPreviewUrl || currentImageUrl}
                alt="Photo preview"
                style={{ width: "100%", maxHeight: "340px", objectFit: "contain", display: "block" }}
              />

              {newPreviewUrl && (
                <button
                  type="button"
                  onClick={cancelNewFile}
                  className="btn btn-danger btn-sm"
                  style={{ position: "absolute", top: "12px", right: "12px" }}
                >
                  <X size={16} />
                  <span>Revert to Original</span>
                </button>
              )}
            </div>

            {!newPreviewUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
              >
                <UploadCloud size={16} />
                <span>Replace Image (Optional)</span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Photo Name / Title</label>
            <input
              type="text"
              required
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              required
              className="input-field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Description</label>
              <span style={{ fontSize: "0.75rem", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={12} />
                AI summary will be updated
              </span>
            </div>
            <textarea
              required
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" }}>
            <Link href={`/photos/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <Sparkles size={18} className="spin" />
                  <span>Saving & Updating Summary...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
