"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../lib/toast";
import { api } from "../../../lib/api";
import { Camera, UploadCloud, X, ArrowLeft } from "lucide-react";

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
        error("Please select a valid image file");
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
      error("Please select an image");
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
      success("Photo uploaded successfully");
      router.push(`/photos/${created.id}`);
    } catch (err: any) {
      error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/photos" className="btn btn-secondary btn-sm" style={{ marginBottom: "12px" }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>
          Upload Photo
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Image</label>
            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "36px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(17, 24, 39, 0.4)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px auto",
                  }}
                >
                  <UploadCloud size={24} />
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff" }}>
                  Select or drag image here
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle)",
                  maxHeight: "340px",
                  background: "#0f172a",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  style={{ width: "100%", maxHeight: "340px", objectFit: "contain", display: "block" }}
                />
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="btn btn-danger btn-sm"
                  style={{ position: "absolute", top: "12px", right: "12px" }}
                >
                  <X size={16} />
                  <span>Remove</span>
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
            <label className="form-label">Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Photo title"
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
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              required
              className="input-field"
              placeholder="Write a description (summary will auto-generate)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Link href="/photos" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !imageFile}
              className="btn btn-primary"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
