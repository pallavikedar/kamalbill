// components/MiniBar.jsx
// ─── Compact bar chart used on the Dashboard revenue panel ───────────────────

/**
 * @param {Array}  data   - [{ label: string, val: number }]
 * @param {number} maxVal - Maximum value used to scale bar heights
 */
export default function MiniBar({ data, maxVal }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Bar */}
          <div
            style={{
              width: "100%",
              background: "#00B4D8",
              borderRadius: "3px 3px 0 0",
              height: maxVal ? Math.max(4, (d.val / maxVal) * 52) : 4,
              opacity: 0.85,
            }}
          />

          {/* Label below bar */}
          <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}
