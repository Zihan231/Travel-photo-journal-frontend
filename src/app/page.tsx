"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Camera, Sparkles, ShieldCheck, ArrowRight, Image as ImageIcon } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/photos");
    }
  }, [user, isLoading, router]);

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 60px auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "6px 16px",
            borderRadius: "9999px",
            fontSize: "0.85rem",
            color: "#a5b4fc",
            marginBottom: "24px",
          }}
        >
          <Sparkles size={16} color="#818cf8" />
          <span>Automated AI Travel Summaries & TOTP Two-Factor Security</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            background: "linear-gradient(135deg, #ffffff 40%, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Preserve your journeys with intelligence and security.
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: "36px",
          }}
        >
          An organized travel photo journal. Upload travel memories, let OpenRouter AI craft captivating summaries from your notes, and keep your data safe with authenticator-based 2FA.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            <span>Start Your Journal</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            <span>Sign In</span>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginTop: "20px",
        }}
      >
        <div className="card">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <ImageIcon size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
            Cloudinary Storage
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Photos are saved and delivered through Cloudinary with per-user scoped directory isolation.
          </p>
        </div>

        <div className="card">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
            AI-Powered Summaries
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            OpenRouter generates concise 1-2 sentence travel summaries whenever you upload or edit photo descriptions.
          </p>
        </div>

        <div className="card">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
            Two-Factor Auth (TOTP)
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Scan a QR code in Google Authenticator or Authy. Encrypted secrets, replay prevention, and backup recovery codes included.
          </p>
        </div>
      </div>
    </div>
  );
}
