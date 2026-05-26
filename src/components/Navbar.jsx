// components/Navbar.jsx
import { useState, useEffect } from "react";
import Logo from "./Logo";

const D = {
  colors: {
    primary: { DEFAULT: "#0A5C8E", light: "#1E6F9F", dark: "#064663", surface: "#F0F7FC" },
    accent:  { danger: "#EF4444", warning: "#F59E0B" },
    gray: {
      50: "#F8F9FA", 100: "#F1F3F5", 200: "#E9ECEF", 300: "#DEE2E6",
      400: "#CED4DA", 500: "#ADB5BD", 600: "#6C757D", 700: "#495057",
      800: "#343A40", 900: "#212529",
    },
    border: { light: "#E9ECEF", DEFAULT: "#DEE2E6" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.07)",
    lg: "0 8px 24px rgba(0,0,0,0.12)",
    xl: "0 20px 60px rgba(0,0,0,0.2)",
  },
  radius: { sm: "4px", md: "8px", lg: "12px", xl: "16px", pill: "9999px" },
  font: {
    sizes: { xs: "11px", sm: "13px", base: "14px", md: "15px", lg: "17px", xl: "20px" },
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  transition: { default: "all 0.2s cubic-bezier(0.4,0,0.2,1)", fast: "all 0.15s ease" },
};

const TABS = [
  { label: "Bills",    icon: "📄", description: "Invoice history & tracking", color: "#3B82F6" },
  { label: "Clients",  icon: "👥", description: "Manage client accounts",     color: "#10B981" },
  { label: "New Bill", icon: "💰", description: "Create new invoice",         color: "#0A5C8E" },
];

export default function Navbar({ activeTab, onTabChange, onLogout }) {
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const [showDrawer,     setShowDrawer]     = useState(false);
  const [loggingOut,     setLoggingOut]     = useState(false);
  const [windowWidth,    setWindowWidth]    = useState(window.innerWidth);

  useEffect(() => {
    const handle = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Close drawer on resize to desktop
  useEffect(() => {
    if (windowWidth >= 1024) setShowDrawer(false);
  }, [windowWidth]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDrawer]);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDrawer = windowWidth < 1024; // mobile + tablet

  const handleTabChange = (label) => {
    onTabChange(label);
    setShowDrawer(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await onLogout();
    setLoggingOut(false);
    setShowUserMenu(false);
    setShowDrawer(false);
  };

  const isNewBill = (label) => label === "New Bill";

  const currentPeriod = () => {
    const now = new Date();
    return `${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;
  };

  return (
    <>
      {/* ════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════ */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 300,
        background: "white",
        borderBottom: `1px solid ${D.colors.border.light}`,
        boxShadow: D.shadows.sm,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: isMobile ? 58 : 68,
          }}>

            {/* ── Left: Hamburger (drawer) + Logo ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Hamburger — only on mobile/tablet */}
              {isDrawer && (
                <button
                  onClick={() => setShowDrawer((v) => !v)}
                  aria-label="Open menu"
                  style={{
                    background: showDrawer ? D.colors.gray[100] : "transparent",
                    border: "none", cursor: "pointer",
                    padding: 8, borderRadius: D.radius.md,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: D.colors.gray[700], transition: D.transition.fast,
                  }}
                >
                  {showDrawer ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6"  x2="6"  y2="18" />
                      <line x1="6"  y1="6"  x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="3" y1="6"  x2="21" y2="6"  />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )}
                </button>
              )}

              <Logo />

              {!isMobile && (
                <div style={{
                  marginLeft: 6, paddingLeft: 12,
                  borderLeft: `1px solid ${D.colors.border.DEFAULT}`,
                }}>
                  <div style={{ fontSize: D.font.sizes.xs, color: D.colors.gray[500], letterSpacing: "0.5px" }}>
                    BILLING SUITE
                  </div>
                  <div style={{ fontSize: D.font.sizes.xs, color: D.colors.gray[400], fontWeight: D.font.weights.medium }}>
                    Enterprise • {currentPeriod()}
                  </div>
                </div>
              )}
            </div>

            {/* ── Center: Desktop Tabs ── */}
            {!isDrawer && (
              <div style={{
                display: "flex", gap: 4, alignItems: "center",
                background: D.colors.gray[50], padding: "4px",
                borderRadius: D.radius.lg,
              }}>
                {TABS.map(({ label, icon }) => {
                  const isActive = activeTab === label;
                  return (
                    <button
                      key={label}
                      onClick={() => handleTabChange(label)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: D.radius.md, border: "none",
                        background: isActive
                          ? isNewBill(label)
                            ? `linear-gradient(135deg, ${D.colors.primary.DEFAULT} 0%, ${D.colors.primary.dark} 100%)`
                            : "white"
                          : "transparent",
                        color: isActive
                          ? isNewBill(label) ? "white" : D.colors.primary.DEFAULT
                          : D.colors.gray[600],
                        fontWeight: isActive ? D.font.weights.semibold : D.font.weights.medium,
                        cursor: "pointer", fontSize: D.font.sizes.sm,
                        transition: D.transition.default,
                        display: "flex", alignItems: "center", gap: 6,
                        position: "relative",
                        boxShadow: isActive && !isNewBill(label) ? D.shadows.sm : "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontSize: "15px", opacity: isActive ? 1 : 0.7 }}>{icon}</span>
                      <span>{label}</span>
                      {isActive && !isNewBill(label) && (
                        <div style={{
                          position: "absolute", bottom: -1, left: 16, right: 16,
                          height: 2.5, background: D.colors.primary.DEFAULT,
                          borderRadius: D.radius.sm,
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Right: Active tab label (tablet) + Export + User ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

              {/* Active tab pill — tablet only */}
              {isTablet && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: D.colors.primary.surface,
                  border: `1px solid ${D.colors.border.DEFAULT}`,
                  borderRadius: D.radius.pill,
                  padding: "4px 12px",
                  fontSize: D.font.sizes.sm,
                  color: D.colors.primary.DEFAULT,
                  fontWeight: D.font.weights.semibold,
                }}>
                  <span>{TABS.find(t => t.label === activeTab)?.icon}</span>
                  <span>{activeTab}</span>
                </div>
              )}

              {/* Export — desktop only */}
              {!isDrawer && (
                <button
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: 8, borderRadius: D.radius.md,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: D.colors.gray[600], transition: D.transition.default,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = D.colors.gray[100]}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  title="Export Data"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              )}

              {/* User avatar + dropdown */}
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowUserMenu((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: isMobile ? 0 : 8,
                    padding: isMobile ? "4px" : "4px 8px",
                    borderRadius: D.radius.md, cursor: "pointer",
                    background: showUserMenu ? D.colors.gray[100] : "transparent",
                    transition: D.transition.default,
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: D.radius.md, flexShrink: 0,
                    background: `linear-gradient(135deg, ${D.colors.primary.surface} 0%, ${D.colors.primary.light} 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: D.font.weights.semibold, fontSize: D.font.sizes.base,
                    color: D.colors.primary.DEFAULT,
                  }}>A</div>
                  {!isMobile && (
                    <>
                      <div>
                        <div style={{ fontSize: D.font.sizes.sm, fontWeight: D.font.weights.medium, color: D.colors.gray[700], lineHeight: 1.3 }}>
                          Admin User
                        </div>
                        <div style={{ fontSize: D.font.sizes.xs, color: D.colors.gray[500] }}>Finance Team</div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke={D.colors.gray[500]} strokeWidth="2"
                        style={{ transition: D.transition.fast, transform: showUserMenu ? "rotate(180deg)" : "rotate(0)" }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </>
                  )}
                </div>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: 190, background: "white",
                    borderRadius: D.radius.lg, boxShadow: D.shadows.lg,
                    border: `1px solid ${D.colors.border.light}`,
                    overflow: "hidden", zIndex: 400,
                  }}>
                    <div style={{
                      padding: "12px 16px",
                      borderBottom: `1px solid ${D.colors.border.light}`,
                      background: D.colors.gray[50],
                    }}>
                      <div style={{ fontSize: D.font.sizes.sm, fontWeight: D.font.weights.semibold, color: D.colors.gray[800] }}>
                        Admin User
                      </div>
                      <div style={{ fontSize: D.font.sizes.xs, color: D.colors.gray[500], marginTop: 2 }}>Finance Team</div>
                    </div>
                    <button
                      onClick={handleLogout} disabled={loggingOut}
                      style={{
                        width: "100%", padding: "10px 16px",
                        background: "transparent", border: "none",
                        cursor: loggingOut ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                        fontSize: D.font.sizes.sm,
                        color: loggingOut ? D.colors.gray[400] : D.colors.accent.danger,
                        fontWeight: D.font.weights.medium, textAlign: "left",
                      }}
                      onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.background = "#FEF2F2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {loggingOut ? "Signing out…" : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          DRAWER BACKDROP
      ════════════════════════════════════════════ */}
      <div
        onClick={() => { setShowDrawer(false); setShowUserMenu(false); }}
        style={{
          position: "fixed", inset: 0, zIndex: 350,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          opacity: showDrawer ? 1 : 0,
          pointerEvents: showDrawer ? "all" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ════════════════════════════════════════════
          SLIDE-IN DRAWER
      ════════════════════════════════════════════ */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: isMobile ? "80vw" : 300,
        maxWidth: 320,
        background: "white",
        zIndex: 400,
        boxShadow: D.shadows.xl,
        transform: showDrawer ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowY: "auto",
      }}>

        {/* Drawer Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${D.colors.border.light}`,
          background: `linear-gradient(135deg, ${D.colors.primary.DEFAULT} 0%, ${D.colors.primary.dark} 100%)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: D.radius.md,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>💰</div>
            <div>
              <div style={{ fontSize: D.font.sizes.md, fontWeight: D.font.weights.bold, color: "white" }}>
                Billing Suite
              </div>
              <div style={{ fontSize: D.font.sizes.xs, color: "rgba(255,255,255,0.7)" }}>
                Enterprise • {currentPeriod()}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              cursor: "pointer", padding: 6, borderRadius: D.radius.md,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", transition: D.transition.fast,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Label */}
        <div style={{
          padding: "16px 20px 8px",
          fontSize: D.font.sizes.xs,
          fontWeight: D.font.weights.semibold,
          color: D.colors.gray[500],
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}>
          Navigation
        </div>

        {/* Drawer Tabs */}
        <div style={{ padding: "0 12px", flex: 1 }}>
          {TABS.map(({ label, icon, description, color }) => {
            const isActive = activeTab === label;
            return (
              <button
                key={label}
                onClick={() => handleTabChange(label)}
                style={{
                  width: "100%", marginBottom: 4,
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 14px",
                  borderRadius: D.radius.lg, border: "none",
                  background: isActive
                    ? isNewBill(label)
                      ? `linear-gradient(135deg, ${D.colors.primary.DEFAULT} 0%, ${D.colors.primary.dark} 100%)`
                      : D.colors.primary.surface
                    : "transparent",
                  cursor: "pointer", textAlign: "left",
                  transition: D.transition.fast,
                  boxShadow: isActive ? D.shadows.sm : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = D.colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: 40, height: 40, borderRadius: D.radius.md, flexShrink: 0,
                  background: isActive
                    ? isNewBill(label) ? "rgba(255,255,255,0.2)" : `${color}18`
                    : D.colors.gray[100],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                  transition: D.transition.fast,
                }}>
                  {icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: D.font.sizes.md,
                    fontWeight: isActive ? D.font.weights.semibold : D.font.weights.medium,
                    color: isActive
                      ? isNewBill(label) ? "white" : D.colors.primary.DEFAULT
                      : D.colors.gray[800],
                    lineHeight: 1.3,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: D.font.sizes.xs,
                    color: isActive
                      ? isNewBill(label) ? "rgba(255,255,255,0.75)" : D.colors.primary.light
                      : D.colors.gray[500],
                    marginTop: 2,
                  }}>
                    {description}
                  </div>
                </div>

                {/* Active chevron */}
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={isNewBill(label) ? "white" : D.colors.primary.DEFAULT}
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer — User + Logout */}
        <div style={{
          borderTop: `1px solid ${D.colors.border.light}`,
          padding: "16px 12px",
          background: D.colors.gray[50],
        }}>
          {/* User info row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", marginBottom: 8,
            background: "white", borderRadius: D.radius.lg,
            border: `1px solid ${D.colors.border.DEFAULT}`,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: D.radius.md, flexShrink: 0,
              background: `linear-gradient(135deg, ${D.colors.primary.surface} 0%, ${D.colors.primary.light} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: D.font.weights.bold, fontSize: D.font.sizes.md,
              color: D.colors.primary.DEFAULT,
            }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: D.font.sizes.sm, fontWeight: D.font.weights.semibold, color: D.colors.gray[800] }}>
                Admin User
              </div>
              <div style={{ fontSize: D.font.sizes.xs, color: D.colors.gray[500] }}>Finance Team</div>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#10B981", flexShrink: 0,
            }} />
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout} disabled={loggingOut}
            style={{
              width: "100%", padding: "11px 14px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: loggingOut ? D.colors.gray[100] : "#FEF2F2",
              border: `1px solid ${loggingOut ? D.colors.border.DEFAULT : "#FECACA"}`,
              borderRadius: D.radius.lg, cursor: loggingOut ? "not-allowed" : "pointer",
              fontSize: D.font.sizes.sm, fontWeight: D.font.weights.semibold,
              color: loggingOut ? D.colors.gray[400] : D.colors.accent.danger,
              transition: D.transition.fast,
            }}
            onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.background = "#FEE2E2"; }}
            onMouseLeave={(e) => { if (!loggingOut) e.currentTarget.style.background = "#FEF2F2"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Close user dropdown on outside click */}
      {showUserMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 399 }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}