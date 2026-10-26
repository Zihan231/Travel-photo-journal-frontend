"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import { MailCheck, ArrowRight, RotateCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { success, error, info } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });

      success(res.message || "Email verified successfully! Please log in.");
      router.push("/login");
    } catch (err: any) {
      error(err.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      error("Please enter your email address first");
      return;
    }
    setResending(true);

    try {
      const res = await api.resendCode({ email: email.trim() });
      success(res.message || "A new 6-digit code has been sent to your email.");
      setCooldown(180); // 3 minutes cooldown
    } catch (err: any) {
      error(err.message || "Could not resend code. Please wait for cooldown.");
      // If error mentions waiting, set a default 60s cooldown
      if (cooldown === 0) setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <MailCheck size={24} />
          </div>
          <h1>Verify Your Email</h1>
          <p>We sent a 6-digit confirmation code to your inbox.</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              className="input-field"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              style={{ textAlign: "center", letterSpacing: "6px", fontSize: "1.3rem", fontWeight: 700 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "10px" }}
          >
            {loading ? "Verifying..." : "Verify Code"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Didn&apos;t receive the code? Check your spam folder or request a new one:
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%" }}
          >
            <RotateCw size={14} className={resending ? "spin" : ""} />
            <span>
              {cooldown > 0
                ? `Resend Code in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}`
                : "Resend 6-Digit Code"}
            </span>
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem" }}>
          <Link href="/login" style={{ color: "var(--text-dim)" }}>
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: "center", padding: "60px 0" }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
