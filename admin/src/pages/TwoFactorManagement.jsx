import React, { useEffect, useState } from "react";
import { api } from "../lib/index.js";
import { SettingsForm } from "../components/SettingsForm.jsx";

export default function TwoFactorManagement() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<"app" | "sms" | "email">("app");
  const [phone, setPhone] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/admin/two-factor");
      setIsEnabled(res.isEnabled || false);
      setMethod(res.method || "app");
      setTotpSecret(res.totpSecret || "");
      setBackupCodes(res.backupCodes || []);
    } catch (err) {
      setFeedback("Failed to load 2FA settings.");
    }
  };
  useEffect(load, []);

  const handleEnable = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.post("/admin/two-factor/enable", {
        method,
        phone: method === "sms" ? phone : undefined,
      });
      setIsEnabled(res.isEnabled || false);
      setMethod(res.method || "app");
      setTotpSecret(res.totpSecret || "");
      setBackupCodes(res.backupCodes || []);
      setFeedback("Two-factor authentication enabled successfully!");
    } catch (err) {
      setFeedback(error?.data?.message || "Failed to enable 2FA.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await api.post("/admin/two-factor/disable");
      setIsEnabled(false);
      setTotpSecret("");
      setBackupCodes([]);
      setShowBackupCodes(false);
      setFeedback("Two-factor authentication disabled.");
    } catch (err) {
      setFeedback(error?.data?.message || "Failed to disable 2FA.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // In a real app, use the Clipboard API
    setFeedback(`Copied: ${text}`);
  };

  return (
    <div>
      <h2>Two-Factor Authentication</h2>

      {isEnabled ? (
        <div>
          <p>Two-factor authentication is <strong>enabled</strong>.</p>
          <p>Method: {method === "app" ? "Authenticator App" : method === "sms" ? "SMS" : "Email"}</p>
          {totpSecret && (
            <div>
              <p>Secret Key: <span>{showSecret ? totpSecret : "••••••••••••••••"}</span></p>
              <button onClick={() => setShowSecret(!showSecret)}>Show/Hide</button>
              <button onClick={() => copyToClipboard(totpSecret)}>Copy Secret</button>
            </div>
          )}
          {backupCodes.length > 0 && (
            <div>
              <p>Backup Codes:</p>
              {backupCodes.map((code, index) => (
                <div key={index}>
                  <code>{code}</code>
                  <button onClick={() => copyToClipboard(code)}>Copy</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleDisable} className="danger">
            Disable Two-Factor Authentication
          </button>
        </div>
      ) : (
        <div>
          <p>Two-factor authentication is <strong>disabled</strong>.</p>
          <SettingsForm
            section="twofactor"
            heading="Enable Two-Factor Authentication"
            fields={[
              {
                name: "method",
                label: "Verification Method",
                type: "select",
                options: [
                  { value: "app", label: "Authenticator App" },
                  { value: "sms", label: "SMS" },
                  { value: "email", label: "Email" },
                ],
                onChange: (v: string) => setMethod(v as any),
              },
              {
                name: "phone",
                label: "Phone Number (SMS)",
                type: "phone",
                onChange: (v: string) => setPhone(v as any),
                required: false,
              },
              {
                name: "email",
                label: "Email Address",
                type: "email",
                required: false,
              },
            ]}
          />
          <button onClick={handleEnable} className="primary">Enable Two-Factor Authentication</button>
        </div>
      }

      {feedback && <div className="alert {feedback.includes("Failed") ? "error" : "success"}">{feedback}</div>}
    </div>
  );
}