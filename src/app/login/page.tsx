"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../lib/toast";
import { api, ApiError } from "../../lib/api";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      } else if ("access_token" in res) {
        loginSuccess(res.access_token, res.user);
        success("Logged in successfully");
        router.push("/photos");
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 403 && err.message.toLowerCase().includes("not verified")) {
        error("Email not verified. Redirecting...");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1000);
      } else {
        error(err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const execute2Fa = async (codeToVerify: string) => {
    if (loading) return;
    const trimmed = codeToVerify.trim();
    if (!trimmed) return;

    setLoading(true);

    try {
      const res = await api.authenticate2Fa({
        twoFactorToken,
        code: trimmed,
      });

      loginSuccess(res.access_token, res.user);
      success("Verified successfully");
      router.push("/photos");
    } catch (err: any) {
      error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await execute2Fa(twoFactorCode);
  };

  const handle2FaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTwoFactorCode(val);
    const digits = val.replace(/\D/g, "");
    if (digits.length === 6 && digits === val.trim() && !loading) {
      execute2Fa(digits);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {!requires2fa ? (
          <>
            <div className="auth-header">
              <h1>Sign In</h1>
            </div>

            <form onSubmit={handleInitialLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              No account?{" "}
              <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Register
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1>Two-Factor Code</h1>
              <p>Enter the 6-digit code or recovery code</p>
            </div>

            <form onSubmit={handle2FaSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  required
                  autoFocus
                  className="input-field"
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={handle2FaCodeChange}
                  style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1.3rem", fontWeight: 700 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequires2fa(false)}
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "10px" }}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
