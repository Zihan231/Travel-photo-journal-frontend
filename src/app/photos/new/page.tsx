"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../lib/toast";
import { api } from "../../../lib/api";
import { Camera, Sparkles, UploadCloud, X, ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function NewPhotoPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      error("Please choose a photo to upload");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("location", location.trim());
      formData.append("description", description.trim());
      formData.append("image", imageFile);

      const created = await api.uploadPhoto(formData);
      success("Photo uploaded to Cloudinary and AI summary generated!");
      router.push(`/photos/${created.id}`);
    } catch (err: any) {
      error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/photos" className="btn btn-secondary btn-sm" style={{ marginBottom: "16px" }}>
          <ArrowLeft size={16} />
          <span>Back to Photos</span>
        </Link>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
          Upload New Travel Photo
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Your image will be saved to your private Cloudinary folder, and OpenRouter will summarize your description.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Image Drag & Drop Area */}
          <div className="form-group">
            <label className="form-label">Photo File</label>
            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "40px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(17, 24, 39, 0.4)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px auto",
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                  Click to browse or drag & drop image
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
                  Supports JPEG, PNG, WebP, GIF (Max 10MB)
                </p>
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle)",
                  maxHeight: "360px",
                  background: "#0f172a",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  style={{ width: "100%", maxHeight: "360px", objectFit: "contain", display: "block" }}
                />
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="btn btn-danger btn-sm"
                  style={{ position: "absolute", top: "12px", right: "12px" }}
                >
                  <X size={16} />
                  <span>Change Photo</span>
                </button>
              </div>
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
              placeholder="e.g. Sunset over Santorini"
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
              placeholder="e.g. Oia, Santorini, Greece"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Description</label>
              <span style={{ fontSize: "0.75rem", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={12} />
                AI will summarize this text
              </span>
            </div>
            <textarea
              required
              className="input-field"
              placeholder="Share the story behind this photo... (e.g. Watching the vibrant orange and pink sun dip below the caldera while listening to the Aegean sea waves.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" }}>
            <Link href="/photos" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !imageFile}
              className="btn btn-primary"
            >
              {uploading ? (
                <>
                  <Sparkles size={18} className="spin" />
                  <span>Uploading & Generating Summary...</span>
                </>
              ) : (
                <>
                  <Camera size={18} />
                  <span>Upload Photo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
