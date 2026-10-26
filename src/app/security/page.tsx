"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../lib/toast";
import { api } from "../../lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Key,
  Copy,
  Check,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function SecurityPage() {
  const { user, isLoading } = useAuth();
  const { success, error, info } = useToast();
  const router = useRouter();

  const [is2faEnabled, setIs2faEnabled] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Setup Flow
  const [setupStep, setSetupStep] = useState<"idle" | "scan" | "codes">("idle");
  const [secretData, setSecretData] = useState<{
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable Flow
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStatus();
    }
  }, [user, isLoading, router]);

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await api.get2FaStatus();
      setIs2faEnabled(res.isTwoFactorEnabled);
    } catch (err: any) {
      error(err.message || "Failed to load 2FA status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      setActivating(true);
      const res = await api.generate2FaSecret();
      setSecretData(res);
      setSetupStep("scan");
      info("Scan the QR code with your authenticator app.");
    } catch (err: any) {
      error(err.message || "Failed to initialize 2FA setup");
    } finally {
      setActivating(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.trim().length !== 6) {
      error("Please enter a valid 6-digit code");
      return;
    }

    setActivating(true);
    try {
      const res = await api.enable2Fa(verifyCode.trim());
      setIs2faEnabled(true);
      setRecoveryCodes(res.recoveryCodes);
      setSetupStep("codes");
      success("2FA enabled successfully! Please save your recovery codes.");
    } catch (err: any) {
      error(err.message || "Invalid authenticator code");
    } finally {
      setActivating(false);
    }
  };

  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    success("Recovery codes copied to clipboard!");
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  const handleDisable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword || !disableCode) {
      error("Both password and verification code are required to disable 2FA");
      return;
    }

    setDisabling(true);
    try {
      await api.disable2Fa(disableCode.trim(), disablePassword);
      setIs2faEnabled(false);
      setSetupStep("idle");
      setDisablePassword("");
      setDisableCode("");
      success("Two-factor authentication has been disabled.");
    } catch (err: any) {
      error(err.message || "Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  };

  if (loadingStatus && is2faEnabled === null) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <p style={{ color: "var(--primary)" }}>Checking security status...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "760px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
          Security & Two-Factor Authentication
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Protect your account against unauthorized access using Time-based One-Time Passwords (TOTP).
        </p>
      </div>

      {/* Status Banner */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          borderLeft: `4px solid ${is2faEnabled ? "#10b981" : "#f59e0b"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: is2faEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              color: is2faEnabled ? "#34d399" : "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {is2faEnabled ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
          </div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
              {is2faEnabled ? "Two-Factor Authentication is Enabled" : "Two-Factor Authentication is Disabled"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
              {is2faEnabled
                ? "Your account requires an authenticator code or recovery code on every sign-in."
                : "Add an extra layer of protection to your travel journal and photos."}
            </p>
          </div>
        </div>
      </div>

      {/* Flow 1: Setup 2FA */}
      {!is2faEnabled && (
        <div className="card">
          {setupStep === "idle" && (
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                Set Up an Authenticator App
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "20px" }}>
                Use an app like <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong> to scan a QR code. Your TOTP secrets are encrypted at rest with AES-256-GCM.
              </p>

              <button
                type="button"
                onClick={handleStartSetup}
                disabled={activating}
                className="btn btn-primary"
              >
                <QrCode size={18} />
                <span>{activating ? "Generating QR Code..." : "Enable Two-Factor Authentication"}</span>
              </button>
            </div>
          )}

          {setupStep === "scan" && secretData && (
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                1. Scan QR Code
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
                Open your authenticator app and scan this QR code:
              </p>

              <div style={{ textAlign: "center" }}>
                <div className="qr-container">
                  <img
                    src={secretData.qrCodeUrl}
                    alt="2FA QR Code"
                    style={{ width: "200px", height: "200px", display: "block" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px", marginBottom: "24px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: "4px" }}>
                  Can&apos;t scan? Enter this secret manually in your app:
                </p>
                <code
                  style={{
                    display: "block",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-subtle)",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    color: "#38bdf8",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    textAlign: "center",
                    userSelect: "all",
                  }}
                >
                  {secretData.secret}
                </code>
              </div>

              <form onSubmit={handleVerifyAndEnable} style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                  2. Enter 6-Digit Code
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                  Enter the 6-digit code currently displayed in your authenticator app to confirm setup:
                </p>

                <div className="form-group">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    className="input-field"
                    style={{ textAlign: "center", letterSpacing: "6px", fontSize: "1.3rem", fontWeight: 700, maxWidth: "260px", margin: "0 auto" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => setSetupStep("idle")}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={activating || verifyCode.length !== 6}
                    className="btn btn-primary"
                  >
                    {activating ? "Verifying..." : "Verify & Activate 2FA"}
                    {!activating && <ArrowRight size={18} />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {setupStep === "codes" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", marginBottom: "8px" }}>
                <Check size={20} />
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                  Save Your Recovery Codes
                </h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "16px" }}>
                If you ever lose access to your authenticator device, each of these one-time codes can be used once to sign in. <strong>They will not be shown again!</strong>
              </p>

              <div className="recovery-grid">
                {recoveryCodes.map((code, idx) => (
                  <div key={idx} className="recovery-badge">
                    {code}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={handleCopyRecoveryCodes}
                  className="btn btn-secondary"
                >
                  {copiedCodes ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                  <span>{copiedCodes ? "Copied!" : "Copy All Codes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSetupStep("idle")}
                  className="btn btn-primary"
                >
                  I Have Saved My Codes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flow 2: Disable 2FA */}
      {is2faEnabled && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <AlertTriangle size={20} color="#f87171" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
              Disable Two-Factor Authentication
            </h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "20px" }}>
            For your security, disabling 2FA requires verifying both your current account password and a valid 6-digit code or recovery code.
          </p>

          <form onSubmit={handleDisable2Fa}>
            <div className="form-group">
              <label className="form-label">Current Account Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Authenticator Code or Recovery Code</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. 123456 or ABCD-1234"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={disabling}
              className="btn btn-danger"
              style={{ marginTop: "10px" }}
            >
              {disabling ? "Disabling..." : "Confirm & Disable 2FA"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
