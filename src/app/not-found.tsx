"use client";

import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function GlobalNotFound() {
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
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#818cf8",
            marginBottom: "4px",
          }}
        >
          <Compass size={34} />
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
          404 &bull; PAGE NOT FOUND
        </div>

        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "#fff",
            margin: 0,
          }}
        >
          Lost in Transit
        </h1>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: "400px",
          }}
        >
          The page you are looking for does not exist, has moved, or the link is invalid.
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
            <span>Go to Journal</span>
          </Link>
          <Link href="/login" className="btn btn-secondary btn-sm">
            <Home size={16} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
