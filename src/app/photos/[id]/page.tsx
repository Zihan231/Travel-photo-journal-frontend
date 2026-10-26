"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../lib/toast";
import { api } from "../../../lib/api";
import {
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Edit3,
  Trash2,
} from "lucide-react";

interface Photo {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  aiSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PhotoDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { user, isLoading } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
      setPhoto(data);
    } catch (err: any) {
      error(err.message || "Could not load photo");
      router.push("/photos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!photo) return;
    if (!confirm(`Are you sure you want to delete "${photo.name}"? This permanently removes the Cloudinary asset.`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.deletePhoto(photo.id);
      success("Photo deleted successfully.");
      router.push("/photos");
    } catch (err: any) {
      error(err.message || "Failed to delete photo");
      setDeleting(false);
    }
  };

  if (loading || !photo) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <p style={{ color: "var(--primary)" }}>Loading photo details...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Link href="/photos" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Photos</span>
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href={`/photos/${photo.id}/edit`} className="btn btn-secondary btn-sm">
            <Edit3 size={15} />
            <span>Edit</span>
          </Link>
          <button onClick={handleDelete} disabled={deleting} className="btn btn-danger btn-sm">
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        {/* Full Image */}
        <div style={{ width: "100%", maxHeight: "560px", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src={photo.imageUrl}
            alt={photo.name}
            style={{ width: "100%", maxHeight: "560px", objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Content Details */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>
              {photo.name}
            </h1>
            <div className="badge-location" style={{ fontSize: "1rem" }}>
              <MapPin size={18} color="#818cf8" />
              <span>{photo.location}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "24px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} />
              Added {new Date(photo.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* AI Summary Banner */}
          {photo.aiSummary && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Sparkles size={18} color="#34d399" />
                <span className="badge-ai">AI-Generated Travel Summary</span>
              </div>
              <p style={{ color: "#d1fae5", fontSize: "1.05rem", fontStyle: "italic", lineHeight: 1.6 }}>
                &ldquo;{photo.aiSummary}&rdquo;
              </p>
            </div>
          )}

          {/* User's Original Story / Description */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Your Notes & Story
            </h3>
            <p style={{ color: "var(--text-main)", fontSize: "1.05rem", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {photo.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
