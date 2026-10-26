"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Maximize2,
  X,
  ImageOff,
  Plus,
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
  const { error } = useToast();
  const router = useRouter();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Guard against duplicate fetches in React StrictMode
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
      setPhoto(data);
    } catch (err: any) {
      const msg = err?.message || "";
      if (err?.statusCode === 404 || /not found/i.test(msg)) {
        setNotFound(true);
      } else {
        error(msg || "Could not load photo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!photo) return;
    if (
      !confirm(
        `Are you sure you want to delete "${photo.name}"? This permanently removes the Cloudinary asset.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await api.deletePhoto(photo.id.toString());
      router.push("/photos");
    } catch (err: any) {
      error(err.message || "Failed to delete photo");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <p style={{ color: "var(--primary)" }}>Loading photo...</p>
      </div>
    );
  }

  // Custom minimal Not Found view
  if (notFound || !photo) {
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
            The photo you are looking for does not exist, has been removed, or belongs to another traveler.
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
    <div className="container" style={{ maxWidth: "1160px" }}>
      {/* Top action bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Link href="/photos" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Photos</span>
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setLightboxOpen(true)}
            className="btn btn-secondary btn-sm"
            title="Expand Fullscreen"
          >
            <Maximize2 size={15} />
            <span>Fullscreen</span>
          </button>

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

      {/* Main Big Window Card */}
      <div
        className="card"
        style={{
          padding: "0",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Big Window Image Viewport */}
        <div
          onClick={() => setLightboxOpen(true)}
          style={{
            position: "relative",
            width: "100%",
            height: "clamp(400px, 65vh, 720px)",
            background: "#070b12",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-in",
          }}
        >
          <img
            src={photo.imageUrl}
            alt={photo.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(8px)",
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "none",
            }}
          >
            <Maximize2 size={14} />
            <span>Click image to expand</span>
          </div>
        </div>

        {/* Info Section */}
        <div style={{ padding: "36px 40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: "8px",
                }}
              >
                {photo.name}
              </h1>

              <div
                className="badge-location"
                style={{ fontSize: "1.05rem", fontWeight: 500 }}
              >
                <MapPin size={18} color="#818cf8" />
                <span>{photo.location}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-dim)",
                fontSize: "0.9rem",
              }}
            >
              <Calendar size={15} />
              <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* AI Summary Banner */}
          {photo.aiSummary && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                margin: "24px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <Sparkles size={16} color="#34d399" />
                <span className="badge-ai">AI-Generated Travel Summary</span>
              </div>
              <p
                style={{
                  color: "#d1fae5",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{photo.aiSummary}&rdquo;
              </p>
            </div>
          )}

          {/* User's Original Notes / Story */}
          <div style={{ marginTop: "24px" }}>
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "10px",
              }}
            >
              Description & Notes
            </h2>
            <p
              style={{
                color: "var(--text-main)",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {photo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>

          <img
            src={photo.imageUrl}
            alt={photo.name}
            style={{
              maxWidth: "96vw",
              maxHeight: "92vh",
              objectFit: "contain",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
            }}
          />
        </div>
      )}
    </div>
  );
}
