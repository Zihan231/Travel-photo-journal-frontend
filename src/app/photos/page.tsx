"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import {
  Camera,
  PlusCircle,
  MapPin,
  Sparkles,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Calendar,
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

export default function PhotosFeedPage() {
  const { user, isLoading } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadPhotos();
    }
  }, [user, isLoading, router]);

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const data = await api.getPhotos();
      setPhotos(data);
    } catch (err: any) {
      error(err.message || "Failed to load photos");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove the image from Cloudinary.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      success(`"${name}" was deleted successfully.`);
    } catch (err: any) {
      error(err.message || "Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPhotos = photos.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || (loadingPhotos && photos.length === 0)) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <div style={{ display: "inline-block", color: "var(--primary)" }}>Loading your journal...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            My Travel Photos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
            {photos.length} {photos.length === 1 ? "memory" : "memories"} saved in your secure journal
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Search bar */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}
            />
            <input
              type="text"
              placeholder="Search destination or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", height: "42px" }}
            />
          </div>

          <Link href="/photos/new" className="btn btn-primary" style={{ height: "42px" }}>
            <PlusCircle size={18} />
            <span>Add Photo</span>
          </Link>
        </div>
      </div>

      {/* Grid or Empty state */}
      {filteredPhotos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Camera size={32} />
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
            {searchQuery ? "No matching photos found" : "No travel memories yet"}
          </h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto 24px auto", fontSize: "0.95rem" }}>
            {searchQuery
              ? "Try adjusting your search terms or clear the filter."
              : "Upload your first photo to get started."}
          </p>
          {!searchQuery && (
            <Link href="/photos/new" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Upload Your First Photo</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="photo-grid">
          {filteredPhotos.map((photo) => (
            <article
              key={photo.id}
              className="photo-card"
              onClick={() => router.push(`/photos/${photo.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="photo-card-image-wrap">
                <img
                  src={photo.imageUrl}
                  alt={photo.name}
                  className="photo-card-img"
                  loading="lazy"
                />
              </div>

              <div className="photo-card-body">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <h2 className="photo-card-title">{photo.name}</h2>
                </div>

                <div className="badge-location">
                  <MapPin size={14} color="#818cf8" />
                  <span>{photo.location}</span>
                </div>

                <p className="photo-card-desc">{photo.description}</p>

                {photo.aiSummary && (
                  <div className="photo-card-ai-box">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <Sparkles size={14} color="#34d399" />
                      <strong style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        AI Summary
                      </strong>
                    </div>
                    <p style={{ fontStyle: "italic" }}>&ldquo;{photo.aiSummary}&rdquo;</p>
                  </div>
                )}

                <div className="photo-card-actions" onClick={(e) => e.stopPropagation()}>
                  <span style={{ marginRight: "auto", fontSize: "0.75rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={12} />
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/photos/${photo.id}`}
                    className="btn btn-secondary btn-sm"
                    title="View Full Details"
                  >
                    <ExternalLink size={14} />
                    <span>View</span>
                  </Link>

                  <Link
                    href={`/photos/${photo.id}/edit`}
                    className="btn btn-secondary btn-sm"
                    title="Edit Description or Photo"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={(e) => handleDelete(e, photo.id, photo.name)}
                    disabled={deletingId === photo.id}
                    className="btn btn-danger btn-sm"
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
