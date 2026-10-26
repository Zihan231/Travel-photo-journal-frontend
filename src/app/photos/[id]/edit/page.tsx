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
  Loader2,
  ImageOff,
  Plus,
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
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (id && fetchedIdRef.current !== id) {
      fetchedIdRef.current = id;
      loadPhoto(id);
    }
  }, [id, user, isLoading]);

  const loadPhoto = async (photoId: string) => {
    try {
      setLoading(true);
      setNotFound(false);
      const data = await api.getPhoto(photoId);
      setName(data.name);
      setLocation(data.location);
      setDescription(data.description);
      setCurrentImageUrl(data.imageUrl);
    } catch (err: any) {
      const msg = err?.message || "";
      if (err?.statusCode === 404 || /not found/i.test(msg)) {
        setNotFound(true);
      } else {
        error(msg || "Failed to load photo");
      }
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

  const removeNewImage = () => {
    setNewImageFile(null);
    setNewPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !description.trim()) {
      error("Please fill in all text fields");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("location", location.trim());
      formData.append("description", description.trim());

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      await api.updatePhoto(id, formData);
      success("Photo updated successfully!");
      router.push(`/photos/${id}`);
    } catch (err: any) {
      error(err.message || "Failed to update photo");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <p style={{ color: "var(--primary)" }}>Loading photo details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="container"
        style={{
          maxWidth: "560px",
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            padding: "52px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
              marginBottom: "4px",
            }}
          >
            <ImageOff size={34} />
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-color)",
              fontSize: "0.8rem",
              color: "var(--text-dim)",
              letterSpacing: "0.08em",
            }}
          >
            PHOTO NOT FOUND
          </div>

          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
            }}
          >
            Memory Not Found
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "420px",
            }}
          >
            The photo you are trying to edit does not exist, has been removed, or belongs to another user.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link href="/photos" className="btn btn-primary btn-sm">
              <ArrowLeft size={16} />
              <span>Back to Photos</span>
            </Link>
            <Link href="/photos/new" className="btn btn-secondary btn-sm">
              <Plus size={16} />
              <span>Upload New Photo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "780px" }}>
      {/* Loading Overlay while saving */}
      {saving && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>
            Updating photo and refreshing AI summary...
          </p>
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <Link href={`/photos/${id}`} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to View</span>
        </Link>
      </div>

      <div className="card">
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Edit Photo Entry
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            marginBottom: "28px",
          }}
        >
          Update details, change description (auto-regenerates summary), or replace the photo.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Photo Title
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunset in Santorini"
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Oia, Greece"
              required
              disabled={saving}
            />
          </div>

          {/* Current / Replace Image Section */}
          <div className="form-group">
            <label className="form-label">Photo Image</label>

            {newPreviewUrl ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                }}
              >
                <img
                  src={newPreviewUrl}
                  alt="New Preview"
                  style={{ width: "100%", maxHeight: "360px", objectFit: "contain", background: "#0a0e17" }}
                />
                <button
                  type="button"
                  onClick={removeNewImage}
                  disabled={saving}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(0, 0, 0, 0.75)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={20} />
                </button>
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    background: "rgba(16, 185, 129, 0.85)",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  New Replacement Selected
                </div>
              </div>
            ) : currentImageUrl ? (
              <div>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={currentImageUrl}
                    alt={name}
                    style={{ width: "100%", maxHeight: "360px", objectFit: "contain", background: "#0a0e17" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                    }}
                  >
                    Current Photo
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%" }}
                >
                  <UploadCloud size={16} />
                  <span>Choose Replacement Image (Optional)</span>
                </button>
              </div>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" htmlFor="description" style={{ margin: 0 }}>
                Description & Notes
              </label>
              <span style={{ fontSize: "0.8rem", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={13} />
                <span>AI will refresh summary</span>
              </span>
            </div>
            <textarea
              id="description"
              className="form-textarea"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your journey, thoughts, or memorable moments..."
              required
              disabled={saving}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <Link href={`/photos/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
