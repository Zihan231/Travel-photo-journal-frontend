"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { success, error } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const triggerVerify = async (codeToVerify: string, emailToVerify: string) => {
    if (loading) return;

    const trimmedEmail = emailToVerify.trim();
    const trimmedCode = codeToVerify.trim();

    if (!trimmedEmail) {
      error("Email is required");
      return;
    }

    if (trimmedCode.length !== 6) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.verifyEmail({
        email: trimmedEmail,
        code: trimmedCode,
      });

      success(res.message || "Email verified. Please log in.");
      router.push("/login");
    } catch (err: any) {
      error(err.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerVerify(code, email);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !loading) {
      triggerVerify(digits, email);
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      error("Email is required");
      return;
    }
    if (resending || cooldown > 0) return;

    setResending(true);

    try {
      const res = await api.resendCode({ email: trimmedEmail });
      success(res.message || "Verification code sent.");
      setCooldown(60);
    } catch (err: any) {
      const msg = err.message || "Could not resend code";
      error(msg);

      // Parse remaining seconds if backend enforced cooldown
      const minMatch = msg.match(/(\d+)\s*(?:minute|min)/i);
      const secMatch = msg.match(/(\d+)\s*(?:second|sec)/i);
      let waitSecs = 0;
      if (minMatch) waitSecs += parseInt(minMatch[1], 10) * 60;
      if (secMatch) waitSecs += parseInt(secMatch[1], 10);

      if (waitSecs > 0) {
        setCooldown(waitSecs);
      } else if (cooldown === 0) {
        setCooldown(60);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verify Email</h1>
          <p>Enter the 6-digit verification code sent to your email</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              className="input-field"
              placeholder="123456"
              value={code}
              onChange={handleCodeChange}
              style={{ textAlign: "center", letterSpacing: "6px", fontSize: "1.3rem", fontWeight: 700 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={16} />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Email</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {resending ? (
              <>
                <Loader2 className="spin" size={15} />
                <span>Resending Code...</span>
              </>
            ) : cooldown > 0 ? (
              <span>
                {cooldown >= 60
                  ? `Resend in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}`
                  : `Resend in ${cooldown}s`}
              </span>
            ) : (
              <span>Resend Code</span>
            )}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.9rem" }}>
          <Link href="/login" style={{ color: "var(--text-dim)" }}>
            Back to Sign In
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
