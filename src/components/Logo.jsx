// components/Logo.jsx
// ─── Kamal Celebrations brand logo with flame-petal SVG icon ─────────────────

export default function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* SVG flame / petal icon */}
      {/* <div style={{ width: 38, height: 38 }}>
        <svg viewBox="0 0 38 38" width="38" height="38">
          <polygon points="19,2 28,14 19,10" fill="#E84393" />
          <polygon points="19,2 10,14 19,10" fill="#FF6B35" />
          <polygon points="10,14 19,10 19,26" fill="#00B4D8" />
          <polygon points="28,14 19,10 19,26" fill="#7B2FBE" />
        </svg>
      </div> */}

      {/* Brand name + subtitle */}
      <div>
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: 0.5,
          }}
        >
          Kamal Celebrations
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--color-text-secondary)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Billing System
        </div>
      </div>
    </div>
  );
}
