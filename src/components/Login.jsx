import { useState } from "react";
import { account } from "../lib/Appwriteconfig";


const D = {
  colors: {
    primary: { DEFAULT: "#0A5C8E", light: "#1E6F9F", dark: "#064663", surface: "#F0F7FC" },
    gray: {
      50: "#F8F9FA", 100: "#F1F3F5", 200: "#E9ECEF", 300: "#DEE2E6",
      400: "#CED4DA", 500: "#ADB5BD", 600: "#6C757D", 700: "#495057",
      800: "#343A40", 900: "#212529",
    },
    accent: { danger: "#EF4444" },
    border: { light: "#E9ECEF", DEFAULT: "#DEE2E6" },
  },
  borderRadius: { sm: "4px", md: "8px", lg: "12px", xl: "16px" },
  typography: {
    sizes: { xs: "11px", sm: "13px", base: "14px", md: "15px", lg: "18px", xl: "24px" },
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    lg: "0 10px 40px rgba(0,0,0,0.10)",
  },
};

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f7fc 0%, #e8f4f8 50%, #ddeef7 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: 16,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{
          background: "white",
          borderRadius: D.borderRadius.xl,
          boxShadow: D.shadows.lg,
          padding: "40px 36px",
          border: `1px solid ${D.colors.border.light}`,
        }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: D.borderRadius.lg,
              background: `linear-gradient(135deg, ${D.colors.primary.DEFAULT} 0%, ${D.colors.primary.dark} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 26,
            }}>
              💰
            </div>
            <h1 style={{
              fontSize: D.typography.sizes.xl,
              fontWeight: D.typography.weights.bold,
              color: D.colors.gray[900],
              margin: "0 0 6px",
            }}>
              Billing Suite
            </h1>
            <p style={{
              fontSize: D.typography.sizes.sm,
              color: D.colors.gray[500],
              margin: 0,
            }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: D.borderRadius.md,
              padding: "10px 14px",
              marginBottom: 18,
              fontSize: D.typography.sizes.sm,
              color: D.colors.accent.danger,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{
                display: "block",
                fontSize: D.typography.sizes.sm,
                fontWeight: D.typography.weights.medium,
                color: D.colors.gray[700],
                marginBottom: 6,
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${D.colors.border.DEFAULT}`,
                  borderRadius: D.borderRadius.md,
                  fontSize: D.typography.sizes.base,
                  color: D.colors.gray[800],
                  outline: "none",
                  boxSizing: "border-box",
                  background: D.colors.gray[50],
                  transition: "border 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = D.colors.primary.DEFAULT}
                onBlur={(e)  => e.target.style.borderColor = D.colors.border.DEFAULT}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontSize: D.typography.sizes.sm,
                fontWeight: D.typography.weights.medium,
                color: D.colors.gray[700],
                marginBottom: 6,
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 42px 10px 14px",
                    border: `1px solid ${D.colors.border.DEFAULT}`,
                    borderRadius: D.borderRadius.md,
                    fontSize: D.typography.sizes.base,
                    color: D.colors.gray[800],
                    outline: "none",
                    boxSizing: "border-box",
                    background: D.colors.gray[50],
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = D.colors.primary.DEFAULT}
                  onBlur={(e)  => e.target.style.borderColor = D.colors.border.DEFAULT}
                />
                {/* Show/Hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: D.colors.gray[500],
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                padding: "11px 0",
                background: loading
                  ? D.colors.gray[300]
                  : `linear-gradient(135deg, ${D.colors.primary.DEFAULT} 0%, ${D.colors.primary.dark} 100%)`,
                color: loading ? D.colors.gray[500] : "white",
                border: "none",
                borderRadius: D.borderRadius.md,
                fontSize: D.typography.sizes.base,
                fontWeight: D.typography.weights.semibold,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: D.typography.sizes.xs,
            color: D.colors.gray[400],
          }}>
            Billing Suite • Enterprise Edition
          </p>
        </div>
      </div>
    </div>
  );
}