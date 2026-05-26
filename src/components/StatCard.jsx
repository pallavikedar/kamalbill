// components/StatCard.jsx
// ─── Summary metric card used across Dashboard and Reports ────────────────────

const COLOR_MAP = {
  teal:   "#0F6E56",
  coral:  "#993C1D",
  purple: "#534AB7",
  amber:  "#854F0B",
};

/**
 * @param {string} label  - Card title shown above the value
 * @param {string} value  - Primary metric (formatted string)
 * @param {string} [sub]  - Optional small subtitle below value
 * @param {string} [color] - One of: teal | coral | purple | amber
 */
export default function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: "var(--color-background-secondary)",
        borderRadius: 10,
        padding: "14px 16px",
        flex: 1,
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: COLOR_MAP[color] || "var(--color-text-primary)",
        }}
      >
        {value}
      </div>

      {sub && (
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
