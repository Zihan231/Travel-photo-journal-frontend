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
  Copy,
  Check,
  Loader2,
} from "lucide-react";

export default function SecurityPage() {
  const { user, isLoading } = useAuth();
  const { success, error } = useToast();
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
    } catch (err: any) {
      error(err.message || "Failed to generate 2FA secret");
    } finally {
      setActivating(false);
    }
  };

  const executeEnable2Fa = async (codeToVerify: string) => {
    if (activating) return;
    const trimmed = codeToVerify.trim();
    if (trimmed.length !== 6) {
      error("Enter a 6-digit code");
      return;
    }

    setActivating(true);
    try {
      const res = await api.enable2Fa(trimmed);
      setIs2faEnabled(true);
      setRecoveryCodes(res.recoveryCodes);
      setSetupStep("codes");
      success("2FA enabled successfully");
    } catch (err: any) {
      error(err.message || "Invalid code");
    } finally {
      setActivating(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeEnable2Fa(verifyCode);
  };

  const handleVerifyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerifyCode(digits);
    if (digits.length === 6 && !activating) {
      executeEnable2Fa(digits);
    }
  };

  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    success("Recovery codes copied");
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const executeDisable2Fa = async (codeToVerify: string) => {
    if (disabling) return;
    const trimmedCode = codeToVerify.trim();
    if (!disablePassword) {
      error("Password is required");
      return;
    }
    if (!trimmedCode) {
      error("Code is required");
      return;
    }

    setDisabling(true);
    try {
      await api.disable2Fa(trimmedCode, disablePassword);
      setIs2faEnabled(false);
      setSetupStep("idle");
      setDisablePassword("");
      setDisableCode("");
      success("2FA disabled successfully");
    } catch (err: any) {
      error(err.message || "Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  };

  const handleDisable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeDisable2Fa(disableCode);
  };

  const handleDisableCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisableCode(val);
    const digits = val.replace(/\D/g, "");
    if (digits.length === 6 && digits === val.trim() && disablePassword.trim().length > 0 && !disabling) {
      executeDisable2Fa(digits);
    }
  };

  if (isLoading || loadingStatus) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <Loader2 className="spin" size={32} style={{ margin: "0 auto 12px auto", color: "var(--primary)" }} />
        <p style={{ color: "var(--text-muted)" }}>Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>
          Two-Factor Authentication
        </h1>
      </div>

      {/* Status */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          borderLeft: `4px solid ${is2faEnabled ? "#10b981" : "#f59e0b"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: is2faEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              color: is2faEnabled ? "#34d399" : "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {is2faEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>
              Status: {is2faEnabled ? "Enabled" : "Disabled"}
            </h2>
          </div>
        </div>
      </div>

      {/* Setup */}
      {!is2faEnabled && (
        <div className="card">
          {setupStep === "idle" && (
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "16px" }}>
                Scan a QR code using your authenticator app (Google Authenticator, Authy, etc.) to enable 2FA.
              </p>

              <button
                type="button"
                onClick={handleStartSetup}
                disabled={activating}
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                {activating ? <Loader2 className="spin" size={18} /> : <QrCode size={18} />}
                <span>{activating ? "Generating..." : "Enable 2FA"}</span>
              </button>
            </div>
          )}

          {setupStep === "scan" && secretData && (
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>
                Scan with Authenticator App
              </h2>

              <div style={{ textAlign: "center" }}>
                <div className="qr-container">
                  <img
                    src={secretData.qrCodeUrl}
                    alt="2FA QR Code"
                    style={{ width: "190px", height: "190px", display: "block" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: "4px" }}>
                  Manual key:
                </p>
                <code
                  style={{
                    display: "block",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-subtle)",
                    padding: "6px 10px",
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

              <form onSubmit={handleVerifyAndEnable} style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <label className="form-label">Enter 6-digit code</label>
                <div className="form-group">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verifyCode}
                    onChange={handleVerifyCodeChange}
                    className="input-field"
                    style={{ textAlign: "center", letterSpacing: "6px", fontSize: "1.3rem", fontWeight: 700, maxWidth: "240px", margin: "0 auto" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
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
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    {activating && <Loader2 className="spin" size={16} />}
                    <span>{activating ? "Verifying..." : "Confirm & Enable"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {setupStep === "codes" && (
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                Backup Recovery Codes
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                Save these codes. Each code can be used once if you lose your authenticator app.
              </p>

              <div className="recovery-grid">
                {recoveryCodes.map((code, idx) => (
                  <div key={idx} className="recovery-badge">
                    {code}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={handleCopyRecoveryCodes}
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {copiedCodes ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                  <span>{copiedCodes ? "Copied" : "Copy Codes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSetupStep("idle")}
                  className="btn btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disable */}
      {is2faEnabled && (
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
            Disable 2FA
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Enter your current account password and code to disable two-factor authentication.
          </p>

          <form onSubmit={handleDisable2Fa}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Code / Recovery Code</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="6-digit code or recovery code"
                value={disableCode}
                onChange={handleDisableCodeChange}
              />
            </div>

            <button
              type="submit"
              disabled={disabling}
              className="btn btn-danger"
              style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {disabling && <Loader2 className="spin" size={16} />}
              <span>{disabling ? "Disabling..." : "Disable 2FA"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
