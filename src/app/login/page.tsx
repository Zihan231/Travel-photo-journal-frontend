"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../lib/toast";
import { api, ApiError } from "../../lib/api";
import { LogIn, KeyRound, Shield, ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requires2fa, setRequires2fa] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const { loginSuccess } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.login({ email, password });

      if ("requires2fa" in res && res.requires2fa) {
        setRequires2fa(true);
        setTwoFactorToken(res.twoFactorToken);
        success("Credentials verified. Please enter your 2FA code.");
      } else if ("access_token" in res) {
        loginSuccess(res.access_token, res.user);
        success("Logged in successfully!");
        router.push("/photos");
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 403 && err.message.toLowerCase().includes("not verified")) {
        error("Your email is not verified yet. Redirecting to verification page...");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1200);
      } else {
        error(err.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.authenticate2Fa({
        twoFactorToken,
        code: twoFactorCode.trim(),
      });

      loginSuccess(res.access_token, res.user);
      success("Two-factor authentication verified!");
      router.push("/photos");
    } catch (err: any) {
      error(err.message || "Invalid authenticator code or recovery code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {!requires2fa ? (
          <>
            <div className="auth-header">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <LogIn size={24} />
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your Travel Photo Journal</p>
            </div>

            <form onSubmit={handleInitialLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "10px" }}
              >
                {loading ? "Verifying credentials..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <>
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
                <Shield size={24} />
              </div>
              <h1>Two-Factor Auth</h1>
              <p>Enter the 6-digit code from your authenticator app or an 8-character recovery code.</p>
            </div>

            <form onSubmit={handle2FaSubmit}>
              <div className="form-group">
                <label className="form-label">Security Code / Recovery Code</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="input-field"
                  placeholder="e.g. 123456 or ABCD-1234"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  style={{ textAlign: "center", letterSpacing: "2px", fontSize: "1.2rem", fontWeight: 700 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "10px" }}
              >
                {loading ? "Verifying..." : "Verify & Complete Login"}
                {!loading && <ArrowRight size={18} />}
              </button>

              <button
                type="button"
                onClick={() => setRequires2fa(false)}
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "12px" }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
