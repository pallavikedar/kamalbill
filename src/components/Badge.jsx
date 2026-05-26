// components/Badge.jsx
// ─── Status badge: Paid | Pending | Overdue ───────────────────────────────────

const STATUS_STYLES = {
  paid:    { bg: "#EAF3DE", color: "#3B6D11", label: "Paid" },
  pending: { bg: "#FAEEDA", color: "#854F0B", label: "Pending" },
  overdue: { bg: "#FCEBEB", color: "#A32D2D", label: "Overdue" },
};

/**
 * @param {string} status - "paid" | "pending" | "overdue"
 */
export default function Badge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 20,
        fontWeight: 500,
      }}
    >
      {style.label}
    </span>
  );
}
