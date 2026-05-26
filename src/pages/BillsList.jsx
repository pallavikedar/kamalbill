import { useState, useMemo, useEffect, useCallback } from "react";

import { Client, Databases, Query } from "appwrite";
import Badge from "../components/Badge";

import APPWRITE_CONFIG from "../lib/Appwriteconfig";    // ← no space

// ============================================================================
// APPWRITE CLIENT SETUP
// ============================================================================

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

// ============================================================================
// RESPONSIVE BREAKPOINTS & UTILITIES
// ============================================================================

const useBreakpoint = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

// ============================================================================
// PROFESSIONAL DESIGN SYSTEM
// ============================================================================

const DS = {
  colors: {
    primary: { DEFAULT: "#0A5C8E", light: "#1E6F9F", dark: "#064663", surface: "#F0F7FC", border: "#C5E0F0" },
    success: { DEFAULT: "#27AE60", light: "#2ECC71", dark: "#1E8449", bg: "#E8F8F5" },
    warning: { DEFAULT: "#F39C12", light: "#F1C40F", dark: "#D68910", bg: "#FEF5E7" },
    danger:  { DEFAULT: "#E74C3C", light: "#EC7063", dark: "#C0392B", bg: "#FDEDEC" },
    info:    { DEFAULT: "#3498DB", light: "#5DADE2", dark: "#2471A3", bg: "#EAF2F8" },
    gray: {
      50: "#F8F9FA", 100: "#F1F3F5", 200: "#E9ECEF", 300: "#DEE2E6",
      400: "#CED4DA", 500: "#ADB5BD", 600: "#6C757D", 700: "#495057",
      800: "#343A40", 900: "#212529",
    },
    border: { light: "#E9ECEF", DEFAULT: "#DEE2E6", dark: "#CED4DA" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 1px 3px rgba(0,0,0,0.08)",
    focus: "0 0 0 3px rgba(10,92,142,0.1)",
  },
  radius: { sm: "4px", md: "6px", lg: "8px", xl: "12px" },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: { xs: "11px", sm: "12px", base: "13px", md: "14px", lg: "16px", xl: "18px", "2xl": "20px", "3xl": "24px" },
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  space: { 0:"0px",1:"4px",2:"8px",3:"12px",4:"16px",5:"20px",6:"24px",8:"32px",10:"40px",12:"48px" },
};

// ============================================================================
// GST RATE CONFIGURATION
// ============================================================================

const GST_RATES = {
  0:  { label: "0% (Exempt)",          cgst: 0,  sgst: 0,  total: 0  },
  5:  { label: "5% (2.5% + 2.5%)",     cgst: 2.5,sgst: 2.5,total: 5  },
  12: { label: "12% (6% + 6%)",        cgst: 6,  sgst: 6,  total: 12 },
  18: { label: "18% (9% + 9%)",        cgst: 9,  sgst: 9,  total: 18 },
  28: { label: "28% (14% + 14%)",      cgst: 14, sgst: 14, total: 28 },
};

// ============================================================================
// HELPERS
// ============================================================================

const parseItems = (bill) => {
  try { if (bill.itemsJson) return JSON.parse(bill.itemsJson); } catch {}
  if (Array.isArray(bill.items)) return bill.items;
  return [];
};

const mapBillDoc = (doc) => ({
  id:             doc.$id,
  invoiceNo:      doc.invoiceNo      || "",
  date:           doc.date           || "",
  dueDate:        doc.dueDate        || "",
  status:         doc.status         || "pending",
  clientId:       doc.clientId       || "",
  notes:          doc.notes          || "",
  terms:          doc.terms          || "",
  discount:       doc.discount       || 0,
  discountType:   doc.discountType   || "fixed",
  discountAmount: doc.discountAmount || 0,
  advancePayment: doc.advancePayment || 0,
  subtotal:       doc.subtotal       || 0,
  afterDiscount:  doc.afterDiscount  || 0,
  cgst:           doc.cgst           || 0,
  sgst:           doc.sgst           || 0,
  totalTax:       doc.totalTax       || 0,
  total:          doc.total          || 0,
  balanceDue:     doc.balanceDue     || 0,
  itemCount:      doc.itemCount      || 0,
  items:          parseItems(doc),
  createdAt:      doc.$createdAt,
  updatedAt:      doc.$updatedAt,
  gstType:        doc.gstType        || "without_gst",
  gstRate:        doc.gstRate        || 0,
  paidAmount:     doc.paidAmount     || 0,
});

const mapClientDoc = (doc) => ({
  ...doc,
  id:   doc.$id,
  name: doc.companyName || "",
});

const inr = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount || 0);

const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      let val = row[h];
      if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
      if (typeof val === 'number') val = val.toString();
      return val;
    }).join(','))
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ============================================================================
// INJECT GLOBAL STYLES
// ============================================================================

const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  * { box-sizing: border-box; }
  .bill-row  { animation: slideUp 0.2s ease; }
  .bills-scroll::-webkit-scrollbar       { width: 6px; height: 6px; }
  .bills-scroll::-webkit-scrollbar-track { background: #F1F3F5; }
  .bills-scroll::-webkit-scrollbar-thumb { background: #CED4DA; border-radius: 3px; }
  .bills-scroll::-webkit-scrollbar-thumb:hover { background: #ADB5BD; }
  .bill-card:active { background: #F0F7FC !important; }
  @media (max-width: 639px) {
    .modal-inner { border-radius: 16px 16px 0 0 !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; top: auto !important; max-width: 100% !important; width: 100% !important; max-height: 90vh !important; transform: none !important; }
    .modal-wrap  { align-items: flex-end !important; }
    select, input[type="text"], input[type="date"], input[type="number"], textarea { font-size: 16px !important; }
  }
`;
document.head.appendChild(styleTag);

// ============================================================================
// UI COMPONENTS
// ============================================================================

const StatCard = ({ label, value, icon, color, subtext, compact }) => (
  <div style={{
    background: "white", borderRadius: DS.radius.lg,
    padding: compact ? DS.space[3] : DS.space[5],
    border: `1px solid ${DS.colors.border.light}`, minWidth: 0,
  }}>
    <div style={{ fontSize: compact ? DS.font.size.lg : DS.font.size.xl, color: DS.colors.gray[500], marginBottom: DS.space[2] }}>{icon}</div>
    <div style={{ fontSize: compact ? DS.font.size.md : DS.font.size["2xl"], fontWeight: DS.font.weight.semibold, color: color || DS.colors.gray[800], marginBottom: DS.space[1], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
    <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    {subtext && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[400], marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtext}</div>}
  </div>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
    <svg style={{ position: "absolute", left: DS.space[3], top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: DS.colors.gray[400] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: `${DS.space[2]} ${DS.space[2]} ${DS.space[2]} ${DS.space[8]}`, border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: DS.font.size.md, outline: "none" }}
      onFocus={e => { e.currentTarget.style.borderColor = DS.colors.primary.DEFAULT; e.currentTarget.style.boxShadow = DS.shadows.focus; }}
      onBlur={e =>  { e.currentTarget.style.borderColor = DS.colors.border.DEFAULT;  e.currentTarget.style.boxShadow = "none"; }}
    />
  </div>
);

const Button = ({ children, variant = "primary", onClick, size = "md", icon, disabled, loading, fullWidth }) => {
  const variants = {
    primary:   { bg: DS.colors.primary.DEFAULT, color: "white",                     border: "none",                                     hoverBg: DS.colors.primary.dark    },
    success:   { bg: DS.colors.success.DEFAULT, color: "white",                     border: "none",                                     hoverBg: DS.colors.success.dark    },
    secondary: { bg: "white",                   color: DS.colors.gray[700],          border: `1px solid ${DS.colors.border.DEFAULT}`,    hoverBg: DS.colors.gray[50]        },
    danger:    { bg: "white",                   color: DS.colors.danger.DEFAULT,     border: `1px solid ${DS.colors.danger.DEFAULT}`,    hoverBg: DS.colors.danger.bg       },
    warning:   { bg: DS.colors.warning.DEFAULT, color: "white",                     border: "none",                                     hoverBg: DS.colors.warning.dark    },
    outline:   { bg: "transparent",             color: DS.colors.primary.DEFAULT,   border: `1px solid ${DS.colors.primary.DEFAULT}`,   hoverBg: DS.colors.primary.surface },
  };
  const sizes = {
    sm: { padding: `${DS.space[1]} ${DS.space[3]}`, fontSize: DS.font.size.xs },
    md: { padding: `${DS.space[2]} ${DS.space[4]}`, fontSize: DS.font.size.sm },
    lg: { padding: `${DS.space[3]} ${DS.space[6]}`, fontSize: DS.font.size.md },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s, borderRadius: DS.radius.md, fontWeight: DS.font.weight.medium,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        opacity: (disabled || loading) ? 0.6 : 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: DS.space[2], transition: "all 0.2s ease", fontFamily: "inherit",
        width: fullWidth ? "100%" : "auto", whiteSpace: "nowrap", flexShrink: 0,
        ...v, background: hovered && !disabled && !loading ? v.hoverBg : v.bg,
      }}>
      {loading && <span style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
      {!loading && icon && <span style={{ fontSize: s.fontSize }}>{icon}</span>}
      {children}
    </button>
  );
};

const GSTBadge = ({ gstType, gstRate }) => {
  if (gstType === "without_gst" || !gstRate || gstRate === 0) {
    return (
      <span style={{ display: "inline-block", padding: `2px ${DS.space[2]}`, background: DS.colors.gray[200], color: DS.colors.gray[600], borderRadius: DS.radius.sm, fontSize: DS.font.size.xs, fontWeight: DS.font.weight.medium }}>
        No GST
      </span>
    );
  }
  const rateInfo = GST_RATES[gstRate];
  return (
    <span style={{ display: "inline-block", padding: `2px ${DS.space[2]}`, background: DS.colors.info.bg, color: DS.colors.info.DEFAULT, borderRadius: DS.radius.sm, fontSize: DS.font.size.xs, fontWeight: DS.font.weight.medium, cursor: "pointer" }}
      title={`CGST: ${rateInfo?.cgst || 0}%, SGST: ${rateInfo?.sgst || 0}%`}>
      GST {gstRate}%
    </span>
  );
};

// ============================================================================
// PAYMENT MODAL
// ============================================================================

const PaymentModal = ({ bill, onClose, onPaymentSubmit, loading }) => {
  const [paymentAmount, setPaymentAmount] = useState(bill?.balanceDue || 0);
  const [paymentDate,   setPaymentDate]   = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentRef,    setPaymentRef]    = useState("");
  const [paymentNotes,  setPaymentNotes]  = useState("");

  if (!bill) return null;
  const maxAmount = bill.balanceDue;

  const handleSubmit = () => {
    if (paymentAmount <= 0 || paymentAmount > maxAmount) return;
    onPaymentSubmit(bill.id, { amount: paymentAmount, date: paymentDate, method: paymentMethod, reference: paymentRef, notes: paymentNotes });
  };

  const inputStyle = {
    width: "100%", padding: DS.space[3],
    border: `1px solid ${DS.colors.border.DEFAULT}`,
    borderRadius: DS.radius.md, fontSize: DS.font.size.md,
    fontFamily: "inherit", outline: "none",
  };
  const labelStyle = { fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium, display: "block", marginBottom: DS.space[2] };

  return (
    <div className="modal-wrap" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: DS.space[4] }}>
      <div className="modal-inner" style={{ background: "white", borderRadius: DS.radius.xl, padding: DS.space[6], maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: DS.space[5] }}>
          <h2 style={{ margin: 0, fontSize: DS.font.size.xl, fontWeight: DS.font.weight.semibold }}>Record Payment</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: DS.colors.gray[500], lineHeight: 1, padding: DS.space[1] }}>×</button>
        </div>

        <div style={{ background: DS.colors.gray[50], padding: DS.space[4], borderRadius: DS.radius.md, marginBottom: DS.space[4] }}>
          <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600] }}>Invoice: <strong>{bill.invoiceNo}</strong></div>
          <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600], marginTop: 2 }}>Total: {inr(bill.total)}</div>
          {bill.advancePayment > 0 && <div style={{ fontSize: DS.font.size.sm, color: DS.colors.info.DEFAULT,    marginTop: 2 }}>Advance Paid: {inr(bill.advancePayment)}</div>}
          {bill.paidAmount    > 0 && <div style={{ fontSize: DS.font.size.sm, color: DS.colors.success.DEFAULT, marginTop: 2 }}>Total Paid: {inr(bill.paidAmount)}</div>}
          <div style={{ fontSize: DS.font.size.lg, fontWeight: DS.font.weight.semibold, marginTop: DS.space[2], color: DS.colors.danger.DEFAULT }}>Balance Due: {inr(bill.balanceDue)}</div>
        </div>

        <div style={{ marginBottom: DS.space[4] }}>
          <label style={labelStyle}>Payment Amount *</label>
          <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)} step="0.01" max={maxAmount} autoFocus style={inputStyle} />
          <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], marginTop: 4 }}>Max: {inr(maxAmount)}</div>
        </div>
        <div style={{ marginBottom: DS.space[4] }}>
          <label style={labelStyle}>Payment Date *</label>
          <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: DS.space[4] }}>
          <label style={labelStyle}>Payment Method *</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
            <option value="cash">💵 Cash</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
            <option value="cheque">📝 Cheque</option>
            <option value="card">💳 Credit/Debit Card</option>
            <option value="upi">📱 UPI</option>
          </select>
        </div>
        <div style={{ marginBottom: DS.space[4] }}>
          <label style={labelStyle}>
            {paymentMethod === 'cheque'        ? 'Cheque Number'        :
             paymentMethod === 'bank_transfer' ? 'Transaction/UTR Number' :
             paymentMethod === 'upi'           ? 'UPI Transaction ID'   :
             paymentMethod === 'card'          ? 'Card Reference Number':
             'Reference Number (Optional)'}
          </label>
          <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Enter reference number" style={inputStyle} />
        </div>
        <div style={{ marginBottom: DS.space[5] }}>
          <label style={labelStyle}>Notes (Optional)</label>
          <textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Any additional remarks..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", gap: DS.space[3] }}>
          <Button variant="secondary" onClick={onClose}       fullWidth>Cancel</Button>
          <Button variant="success"   onClick={handleSubmit}  disabled={paymentAmount <= 0 || paymentAmount > maxAmount} loading={loading} fullWidth>
            {loading ? 'Recording…' : 'Record Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VIEW PAYMENTS MODAL
// ============================================================================

const ViewPaymentsModal = ({ bill, payments, onClose }) => {
  const totalPaidFromPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = (bill.advancePayment || 0) + totalPaidFromPayments;

  return (
    <div className="modal-wrap" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: DS.space[4] }}>
      <div className="modal-inner" style={{ background: "white", borderRadius: DS.radius.xl, padding: DS.space[6], maxWidth: 680, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: DS.space[5] }}>
          <h2 style={{ margin: 0, fontSize: DS.font.size.xl, fontWeight: DS.font.weight.semibold }}>Payment History</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: DS.colors.gray[500], lineHeight: 1, padding: DS.space[1] }}>×</button>
        </div>

        <div style={{ background: DS.colors.gray[50], padding: DS.space[4], borderRadius: DS.radius.md, marginBottom: DS.space[4] }}>
          <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600] }}>Invoice: <strong>{bill.invoiceNo}</strong></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: DS.space[4], marginTop: DS.space[2] }}>
            <div><div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500] }}>Total</div>  <div style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold }}>{inr(bill.total)}</div></div>
            <div><div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500] }}>Paid</div>   <div style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.success.DEFAULT }}>{inr(totalPaid)}</div></div>
            <div><div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500] }}>Balance</div><div style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: bill.balanceDue > 0 ? DS.colors.danger.DEFAULT : DS.colors.success.DEFAULT }}>{inr(bill.balanceDue)}</div></div>
          </div>
        </div>

        {bill.advancePayment > 0 && (
          <div style={{ background: DS.colors.info.bg, padding: DS.space[3], borderRadius: DS.radius.md, marginBottom: DS.space[3], borderLeft: `3px solid ${DS.colors.info.DEFAULT}` }}>
            <div style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium, color: DS.colors.info.DEFAULT }}>Advance Payment — {inr(bill.advancePayment)}</div>
            <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], marginTop: 2 }}>Recorded at invoice creation</div>
          </div>
        )}

        {payments.length === 0 && bill.advancePayment === 0 ? (
          <div style={{ textAlign: "center", padding: DS.space[8], color: DS.colors.gray[500] }}>No payments recorded yet</div>
        ) : payments.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
              <thead>
                <tr style={{ background: DS.colors.gray[100], borderBottom: `1px solid ${DS.colors.border.DEFAULT}` }}>
                  {["Date","Amount","Method","Reference"].map(h => (
                    <th key={h} style={{ padding: `${DS.space[2]} ${DS.space[3]}`, textAlign: h === "Amount" ? "right" : "left", fontSize: DS.font.size.xs, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[600], textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${DS.colors.border.light}` }}>
                    <td style={{ padding: `${DS.space[2]} ${DS.space[3]}`, fontSize: DS.font.size.sm }}>{new Date(payment.paymentDate).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: `${DS.space[2]} ${DS.space[3]}`, textAlign: "right", fontWeight: DS.font.weight.semibold, color: DS.colors.success.DEFAULT, fontSize: DS.font.size.sm }}>{inr(payment.amount)}</td>
                    <td style={{ padding: `${DS.space[2]} ${DS.space[3]}`, fontSize: DS.font.size.sm }}>{payment.paymentMethod}</td>
                    <td style={{ padding: `${DS.space[2]} ${DS.space[3]}`, fontSize: DS.font.size.sm, color: DS.colors.gray[600] }}>{payment.reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div style={{ marginTop: DS.space[5] }}>
          <Button variant="secondary" onClick={onClose} fullWidth>Close</Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SKELETON LOADERS
// ============================================================================

const SkeletonDesktop = () => (
  <div style={{ display: "grid", gridTemplateColumns: "32px 1.5fr 1.2fr 0.9fr 0.9fr 0.8fr 0.7fr 0.9fr 1.2fr", gap: DS.space[3], padding: `${DS.space[4]} ${DS.space[5]}`, borderBottom: `1px solid ${DS.colors.border.light}`, alignItems: "center" }}>
    {[20,120,100,80,80,70,80,90,120].map((w,i) => (
      <div key={i} style={{ height: 14, width: w, background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

const SkeletonTablet = () => (
  <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 0.8fr 1.1fr", gap: DS.space[3], padding: `${DS.space[4]} ${DS.space[4]}`, borderBottom: `1px solid ${DS.colors.border.light}`, alignItems: "center" }}>
    {[20,120,80,90,100].map((w,i) => (
      <div key={i} style={{ height: 14, width: w, background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

const SkeletonCard = () => (
  <div style={{ padding: DS.space[4], borderBottom: `1px solid ${DS.colors.border.light}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: DS.space[3] }}>
      <div style={{ height: 14, width: 100, background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 20, width: 60,  background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
    <div style={{ height: 12, width: 140, background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite", marginBottom: DS.space[2] }} />
    <div style={{ display: "flex", gap: DS.space[3] }}>
      <div style={{ height: 12, width: 80, background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 12, width: 80, background: DS.colors.gray[200], borderRadius: DS.radius.sm, animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  </div>
);

// ============================================================================
// MOBILE BILL CARD  — full data with collapsible breakdown
// ============================================================================

const MobileBillCard = ({ bill, client, billPayments, onView, onDelete, onPayment, onViewPayments, paymentLoading, paymentBillId }) => {
  const [expanded, setExpanded] = useState(false);
  const isOverdue    = bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== "paid";
  const hasDueBalance = bill.balanceDue > 0 && bill.status !== "paid";
  const paidPercent  = bill.total > 0 ? ((bill.paidAmount || 0) / bill.total) * 100 : 0;

  const statusColors = {
    paid:    { bg: DS.colors.success.bg,  color: DS.colors.success.dark,  label: "Paid"    },
    pending: { bg: DS.colors.warning.bg,  color: DS.colors.warning.dark,  label: "Pending" },
    overdue: { bg: DS.colors.danger.bg,   color: DS.colors.danger.dark,   label: "Overdue" },
    partial: { bg: DS.colors.info.bg,     color: DS.colors.info.dark,     label: "Partial" },
  };
  const statusStyle = statusColors[bill.status] || statusColors.pending;

  const cols = hasDueBalance ? "1fr 1fr 1fr" : "1fr 1fr";

  return (
    <div className="bill-card" style={{ padding: DS.space[4], borderBottom: `1px solid ${DS.colors.border.light}`, background: "white" }}>

      {/* Row 1 — Invoice No + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: DS.space[2] }}>
        <div>
          <div style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[900] }}>{bill.invoiceNo}</div>
          <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], marginTop: 2 }}>
            {bill.itemCount || bill.items?.length || 0} item(s)
            {bill.advancePayment > 0 && ` · Adv: ${inr(bill.advancePayment)}`}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: DS.space[1] }}>
          <span style={{ display: "inline-block", padding: `2px ${DS.space[2]}`, background: statusStyle.bg, color: statusStyle.color, borderRadius: DS.radius.sm, fontSize: DS.font.size.xs, fontWeight: DS.font.weight.semibold }}>
            {statusStyle.label}
          </span>
          <GSTBadge gstType={bill.gstType} gstRate={bill.gstRate} />
        </div>
      </div>

      {/* Row 2 — Client */}
      <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[700], marginBottom: DS.space[2], fontWeight: DS.font.weight.medium }}>
        {client?.companyName || client?.name || <span style={{ color: DS.colors.gray[400], fontStyle: "italic" }}>Unknown client</span>}
        {client?.gstin && (
          <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], fontFamily: "monospace", fontWeight: DS.font.weight.normal }}>
            GSTIN: {client.gstin}
          </div>
        )}
      </div>

      {/* Row 3 — Date + Amount */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: DS.space[2] }}>
        <div>
          <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600] }}>
            {bill.date ? new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
          </div>
          {bill.dueDate && (
            <div style={{ fontSize: DS.font.size.xs, color: isOverdue ? DS.colors.danger.DEFAULT : DS.colors.gray[500], marginTop: 2 }}>
              Due: {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              {isOverdue && " ⚠"}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: DS.font.size.lg, fontWeight: DS.font.weight.semibold, color: DS.colors.success.DEFAULT }}>{inr(bill.total)}</div>
          {hasDueBalance && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.danger.DEFAULT }}>Due: {inr(bill.balanceDue)}</div>}
        </div>
      </div>

      {/* Expand/collapse toggle */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ fontSize: DS.font.size.xs, color: DS.colors.primary.DEFAULT, cursor: "pointer", marginBottom: DS.space[2], userSelect: "none" }}
      >
        {expanded ? "▲ Hide breakdown" : "▼ Show breakdown"}
      </div>

      {/* Collapsible financial breakdown */}
      {expanded && (
        <div style={{
          background: DS.colors.gray[50], borderRadius: DS.radius.md,
          padding: DS.space[3], marginBottom: DS.space[3],
          fontSize: DS.font.size.xs, color: DS.colors.gray[700],
        }}>
          {[
            { label: "Subtotal",       value: bill.subtotal,       show: true,                      color: null },
            { label: "Discount",       value: -bill.discountAmount, show: bill.discountAmount > 0,   color: DS.colors.danger.DEFAULT },
            { label: "After discount", value: bill.afterDiscount,   show: bill.discountAmount > 0 && bill.afterDiscount > 0, color: null },
            { label: `CGST (${(bill.gstRate || 0) / 2}%)`, value: bill.cgst, show: bill.cgst > 0,  color: DS.colors.info.DEFAULT },
            { label: `SGST (${(bill.gstRate || 0) / 2}%)`, value: bill.sgst, show: bill.sgst > 0,  color: DS.colors.info.DEFAULT },
          ].filter(r => r.show).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: `3px 0` }}>
              <span style={{ color: row.color || DS.colors.gray[600] }}>{row.label}</span>
              <span style={{ color: row.color || DS.colors.gray[800] }}>
                {row.label === "Discount" ? `−${inr(bill.discountAmount)}` : inr(Math.abs(row.value))}
              </span>
            </div>
          ))}

          {/* Divider + Total */}
          <div style={{ borderTop: `1px solid ${DS.colors.border.DEFAULT}`, marginTop: DS.space[2], paddingTop: DS.space[2], display: "flex", justifyContent: "space-between", fontWeight: DS.font.weight.semibold }}>
            <span>Total</span><span>{inr(bill.total)}</span>
          </div>

          {/* Payment rows */}
          {bill.advancePayment > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: `3px 0`, color: DS.colors.info.DEFAULT }}>
              <span>Advance paid</span><span>{inr(bill.advancePayment)}</span>
            </div>
          )}
          {(bill.paidAmount || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: `3px 0`, color: DS.colors.success.DEFAULT }}>
              <span>Total paid</span><span>{inr(bill.paidAmount)}</span>
            </div>
          )}
          {hasDueBalance && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: `3px 0`, color: DS.colors.danger.DEFAULT, fontWeight: DS.font.weight.semibold }}>
              <span>Balance due</span><span>{inr(bill.balanceDue)}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {paidPercent > 0 && paidPercent < 100 && (
        <div style={{ marginBottom: DS.space[3] }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: DS.font.size.xs, color: DS.colors.gray[500], marginBottom: DS.space[1] }}>
            <span>Paid: {inr(bill.paidAmount || 0)}</span>
            <span>{Math.round(paidPercent)}%</span>
          </div>
          <div style={{ height: 4, background: DS.colors.gray[200], borderRadius: DS.radius.sm, overflow: "hidden" }}>
            <div style={{ width: `${paidPercent}%`, height: "100%", background: DS.colors.success.DEFAULT, borderRadius: DS.radius.sm }} />
          </div>
        </div>
      )}

      {/* Payment history link */}
      {(billPayments.length > 0 || bill.advancePayment > 0) && (
        <div
          style={{ fontSize: DS.font.size.xs, color: DS.colors.primary.DEFAULT, marginBottom: DS.space[3], cursor: "pointer", textDecoration: "underline" }}
          onClick={() => onViewPayments(bill)}
        >
          {billPayments.length} payment(s){bill.advancePayment > 0 && " (+ advance)"}
        </div>
      )}

      {/* Actions — grid so buttons never overflow */}
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: DS.space[2] }}>
        {hasDueBalance && (
          <Button variant="success" size="sm" onClick={() => onPayment(bill)}
            loading={paymentLoading && paymentBillId === bill.id} fullWidth>
            💳 Pay
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onView?.(bill.id)} fullWidth>👁 View</Button>
        <Button variant="danger"  size="sm" onClick={() => onDelete(bill.id, bill.invoiceNo)} fullWidth>🗑 Del</Button>
      </div>
    </div>
  );
};

// ============================================================================
// TABLET ROW  — 5-column, fits 640–1023 px
// ============================================================================

const TabletRow = ({ bill, client, billPayments, isSelected, onSelect, onView, onDelete, onPayment, onViewPayments, paymentLoading, paymentBillId }) => {
  const [hovered, setHovered] = useState(false);
  const isOverdue    = bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== "paid";
  const hasDueBalance = bill.balanceDue > 0 && bill.status !== "paid";
  const paidPercent  = bill.total > 0 ? ((bill.paidAmount || 0) / bill.total) * 100 : 0;

  return (
    <div className="bill-row"
      style={{
        display: "grid",
        gridTemplateColumns: "32px minmax(0,1.6fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,1.2fr)",
        gap: DS.space[3],
        padding: `${DS.space[3]} ${DS.space[4]}`,
        borderBottom: `1px solid ${DS.colors.border.light}`,
        background: isSelected ? DS.colors.primary.surface : hovered ? DS.colors.gray[50] : "white",
        alignItems: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <div><input type="checkbox" checked={isSelected} onChange={onSelect} style={{ cursor: "pointer" }} /></div>

      {/* Invoice + Client */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[900], overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bill.invoiceNo}</div>
        <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[600], overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {client?.companyName || client?.name || <em style={{ color: DS.colors.gray[400] }}>Unknown</em>}
        </div>
        {client?.gstin && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[400], fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.gstin}</div>}
        {bill.advancePayment > 0 && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.info.DEFAULT }}>Adv: {inr(bill.advancePayment)}</div>}
      </div>

      {/* Date */}
      <div>
        <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[700] }}>
          {bill.date ? new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
        </div>
        {bill.dueDate && (
          <div style={{ fontSize: DS.font.size.xs, color: isOverdue ? DS.colors.danger.DEFAULT : DS.colors.gray[500] }}>
            Due: {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}{isOverdue && " ⚠"}
          </div>
        )}
        <GSTBadge gstType={bill.gstType} gstRate={bill.gstRate} />
      </div>

      {/* Amount + paid/due + progress */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.semibold, color: DS.colors.success.DEFAULT }}>{inr(bill.total)}</div>
        <div style={{ fontSize: DS.font.size.xs, color: DS.colors.success.DEFAULT }}>Paid: {inr(bill.paidAmount || 0)}</div>
        {hasDueBalance && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.danger.DEFAULT, fontWeight: DS.font.weight.semibold }}>Due: {inr(bill.balanceDue)}</div>}
        {(billPayments.length > 0 || bill.advancePayment > 0) && (
          <div style={{ fontSize: DS.font.size.xs, color: DS.colors.primary.DEFAULT, cursor: "pointer", textDecoration: "underline", marginTop: 2 }}
            onClick={() => onViewPayments(bill)}>
            {billPayments.length} pmt(s){bill.advancePayment > 0 && " +adv"}
          </div>
        )}
        {paidPercent > 0 && paidPercent < 100 && (
          <div style={{ marginTop: 4, height: 3, background: DS.colors.gray[200], borderRadius: DS.radius.sm, overflow: "hidden" }}>
            <div style={{ width: `${paidPercent}%`, height: "100%", background: DS.colors.success.DEFAULT }} />
          </div>
        )}
      </div>

      {/* Status + Actions */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: DS.space[2] }}>
        <Badge status={bill.status} />
        <div style={{ display: "flex", gap: DS.space[1], flexWrap: "wrap", justifyContent: "flex-end" }}>
          {hasDueBalance && (
            <Button variant="success" size="sm" onClick={() => onPayment(bill)}
              loading={paymentLoading && paymentBillId === bill.id} icon="💳">Pay</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onView?.(bill.id)}               icon="👁">View</Button>
          <Button variant="danger"  size="sm" onClick={() => onDelete(bill.id, bill.invoiceNo)} icon="🗑">Del</Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DESKTOP TABLE ROW  — 9-column, 1024 px+
// ============================================================================

const DesktopRow = ({ bill, client, billPayments, isSelected, onSelect, onView, onDelete, onPayment, onViewPayments, paymentLoading, paymentBillId }) => {
  const [hovered, setHovered] = useState(false);
  const isOverdue    = bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== "paid";
  const hasDueBalance = bill.balanceDue > 0 && bill.status !== "paid";
  const paidPercent  = bill.total > 0 ? ((bill.paidAmount || 0) / bill.total) * 100 : 0;

  return (
    <div className="bill-row"
      style={{ display: "grid", gridTemplateColumns: "32px 1.5fr 1.2fr 0.9fr 0.9fr 0.8fr 0.7fr 0.9fr 1.2fr", gap: DS.space[3], padding: `${DS.space[3]} ${DS.space[5]}`, borderBottom: `1px solid ${DS.colors.border.light}`, transition: "background 0.15s ease", background: isSelected ? DS.colors.primary.surface : hovered ? DS.colors.gray[50] : "white", alignItems: "center" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div><input type="checkbox" checked={isSelected} onChange={onSelect} style={{ cursor: "pointer" }} /></div>

      <div>
        <div style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[900] }}>{bill.invoiceNo}</div>
        <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], marginTop: 2 }}>{bill.itemCount || bill.items?.length || 0} item(s)</div>
        {bill.advancePayment > 0 && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.info.DEFAULT, marginTop: 2 }}>Adv: {inr(bill.advancePayment)}</div>}
      </div>

      <div>
        <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[900], overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {client?.companyName || client?.name || <span style={{ color: DS.colors.gray[400], fontStyle: "italic" }}>Unknown</span>}
        </div>
        {client?.gstin && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], fontFamily: "monospace" }}>GST: {client.gstin}</div>}
      </div>

      <div>
        <div style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[700] }}>
          {bill.date ? new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
        </div>
        {bill.dueDate && (
          <div style={{ fontSize: DS.font.size.xs, color: isOverdue ? DS.colors.danger.DEFAULT : DS.colors.gray[500] }}>
            Due: {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}{isOverdue && " ⚠"}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.success.DEFAULT }}>{inr(bill.total)}</div>
      </div>

      <div>
        <div style={{ fontSize: DS.font.size.xs, color: DS.colors.success.DEFAULT, fontWeight: DS.font.weight.medium }}>Paid: {inr(bill.paidAmount || 0)}</div>
        {hasDueBalance && <div style={{ fontSize: DS.font.size.xs, color: DS.colors.danger.DEFAULT, fontWeight: DS.font.weight.semibold }}>Due: {inr(bill.balanceDue)}</div>}
        {paidPercent > 0 && paidPercent < 100 && (
          <div style={{ marginTop: 4, width: 50, height: 3, background: DS.colors.gray[200], borderRadius: DS.radius.sm, overflow: "hidden" }}>
            <div style={{ width: `${paidPercent}%`, height: "100%", background: DS.colors.success.DEFAULT }} />
          </div>
        )}
        {(billPayments.length > 0 || bill.advancePayment > 0) && (
          <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[400], marginTop: 2, cursor: "pointer", textDecoration: "underline" }}
            onClick={() => onViewPayments(bill)}>
            {billPayments.length} pmt(s){bill.advancePayment > 0 && " +adv"}
          </div>
        )}
      </div>

      <div>
        <GSTBadge gstType={bill.gstType} gstRate={bill.gstRate} />
        {bill.gstType === "with_gst" && bill.gstRate > 0 && (
          <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], marginTop: 2 }}>Tax: {inr((bill.cgst || 0) + (bill.sgst || 0))}</div>
        )}
      </div>

      <div><Badge status={bill.status} /></div>

      <div style={{ display: "flex", gap: DS.space[1], flexWrap: "wrap" }}>
        {hasDueBalance && (
          <Button variant="success" size="sm" onClick={() => onPayment(bill)} loading={paymentLoading && paymentBillId === bill.id} icon="💳">Pay</Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onView?.(bill.id)}               icon="👁">View</Button>
        <Button variant="danger"  size="sm" onClick={() => onDelete(bill.id, bill.invoiceNo)} icon="🗑">Del</Button>
      </div>
    </div>
  );
};

// ============================================================================
// FILTERS PANEL
// ============================================================================

const FiltersPanel = ({ clients, search, setSearch, filterClient, setFilterClient, selectedCustomer, setSelectedCustomer, filterStatus, setFilterStatus, filterGST, setFilterGST, sortBy, setSortBy, dateRange, setDateRange, isMobile }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selectStyle = {
    width: "100%", padding: `${DS.space[2]} ${DS.space[3]}`,
    border: `1px solid ${DS.colors.border.DEFAULT}`,
    borderRadius: DS.radius.md, fontSize: DS.font.size.sm,
    background: "white", cursor: "pointer", outline: "none",
  };

  const hasActiveFilters = filterClient !== "all" || selectedCustomer !== "all" || filterStatus !== "all" || filterGST !== "all" || dateRange.from || dateRange.to;

  return (
    <div style={{ background: "white", borderRadius: DS.radius.lg, border: `1px solid ${DS.colors.border.light}`, marginBottom: DS.space[4] }}>
      {/* Search + Toggle row */}
      <div style={{ padding: DS.space[4], display: "flex", gap: DS.space[3], alignItems: "center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search invoice or client…" />
        {isMobile && (
          <button onClick={() => setFiltersOpen(v => !v)}
            style={{ flexShrink: 0, padding: `${DS.space[2]} ${DS.space[3]}`, border: `1px solid ${hasActiveFilters ? DS.colors.primary.DEFAULT : DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, background: hasActiveFilters ? DS.colors.primary.surface : "white", cursor: "pointer", fontSize: DS.font.size.sm, fontFamily: "inherit", color: hasActiveFilters ? DS.colors.primary.DEFAULT : DS.colors.gray[700], display: "flex", alignItems: "center", gap: DS.space[2] }}>
            ⚙ Filters{hasActiveFilters && " •"}
          </button>
        )}
      </div>

      {/* Filters — always visible on tablet+desktop, collapsible on mobile */}
      {(!isMobile || filtersOpen) && (
        <div style={{ padding: `0 ${DS.space[4]} ${DS.space[4]} ${DS.space[4]}`, borderTop: `1px solid ${DS.colors.border.light}` }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: DS.space[3], marginTop: DS.space[4] }}>
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={selectStyle}>
              <option value="all">All Clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName || c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={filterGST} onChange={e => setFilterGST(e.target.value)} style={selectStyle}>
              <option value="all">All GST Types</option>
              <option value="with_gst">With GST</option>
              <option value="without_gst">Without GST</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="due_desc">Highest Due</option>
              <option value="due_asc">Lowest Due</option>
              <option value="invoice_asc">Invoice No. A–Z</option>
              <option value="invoice_desc">Invoice No. Z–A</option>
            </select>
          </div>

          {/* Date range */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: DS.space[3], alignItems: "center", marginTop: DS.space[3] }}>
            <span style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600], flexShrink: 0 }}>Date Range:</span>
            <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} style={{ padding: DS.space[2], border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: DS.font.size.sm, outline: "none", flex: "1 1 120px", minWidth: 0 }} />
            <span style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[400], flexShrink: 0 }}>to</span>
            <input type="date" value={dateRange.to}   onChange={e => setDateRange({ ...dateRange, to:   e.target.value })} style={{ padding: DS.space[2], border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: DS.font.size.sm, outline: "none", flex: "1 1 120px", minWidth: 0 }} />
            {(dateRange.from || dateRange.to) && (
              <Button variant="secondary" size="sm" onClick={() => setDateRange({ from: "", to: "" })}>Clear</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BillsList({ onView, onDelete, onStatusChange }) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const isCompact = isMobile || isTablet;

  const [bills,           setBills]           = useState([]);
  const [clients,         setClients]         = useState([]);
  const [payments,        setPayments]        = useState({});
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
 
  const [paymentBill,     setPaymentBill]     = useState(null);
  const [paymentLoading,  setPaymentLoading]  = useState(false);
  const [viewPaymentsBill,setViewPaymentsBill]= useState(null);
  // const [updatingId, setUpdatingId] = useState(null);
  const [search,          setSearch]          = useState("");
  const [filterClient,    setFilterClient]    = useState("all");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterGST,       setFilterGST]       = useState("all");
  const [dateRange,       setDateRange]       = useState({ from: "", to: "" });
  const [sortBy,          setSortBy]          = useState("date_desc");
  const [selectedBills,   setSelectedBills]   = useState(new Set());
  const [selectedCustomer,setSelectedCustomer]= useState("all");

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [billsRes, clientsRes] = await Promise.all([
        databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.billId,        [Query.limit(500), Query.orderDesc("$createdAt")]),
        databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collectionId,  [Query.limit(500)]),
      ]);

      let billsData = billsRes.documents.map(mapBillDoc);

      const paymentsRes = await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.paymentCollectionId, [Query.limit(1000)]);
      const paymentsMap = {};
      paymentsRes.documents.forEach(payment => {
        if (!paymentsMap[payment.invoiceId]) paymentsMap[payment.invoiceId] = [];
        paymentsMap[payment.invoiceId].push(payment);
      });

      billsData = billsData.map(bill => {
        const billPayments         = paymentsMap[bill.id] || [];
        const totalPaidFromPayments = billPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalPaid            = (bill.advancePayment || 0) + totalPaidFromPayments;
        const balanceDue           = bill.total - totalPaid;
        const status               = balanceDue <= 0 ? "paid" : totalPaid > 0 ? "partial" : bill.status;
        return { ...bill, paidAmount: totalPaid, balanceDue, status };
      });

      setBills(billsData);
      setClients(clientsRes.documents.map(mapClientDoc));
      setPayments(paymentsMap);
    } catch (err) {
      console.error("Appwrite [fetch data]:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleStatusChange = async (billId, newStatus) => {
    setUpdatingId(billId);
    try {
      await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.billId, billId, { status: newStatus });
      setBills(prev => prev.map(b => b.id === billId ? { ...b, status: newStatus } : b));
      onStatusChange?.(billId, newStatus);
    } catch (err) {
      setError(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRecordPayment = async (billId, payment) => {
    setPaymentLoading(true);
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) throw new Error("Bill not found");

      await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.paymentCollectionId, 'unique()', {
        invoiceId: billId, amount: payment.amount, paymentDate: payment.date,
        paymentMethod: payment.method, reference: payment.reference || '', notes: payment.notes || '', receivedBy: 'user',
      });

      const allPayments           = await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.paymentCollectionId, [Query.equal('invoiceId', billId)]);
      const totalPaidFromPayments  = allPayments.documents.reduce((sum, p) => sum + p.amount, 0);
      const totalPaid             = (bill.advancePayment || 0) + totalPaidFromPayments;
      const newBalanceDue         = bill.total - totalPaid;
      const newStatus             = newBalanceDue <= 0 ? "paid" : totalPaid > 0 ? "partial" : bill.status;

      await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.billId, billId, { status: newStatus });

      setBills(prev => prev.map(b => b.id === billId ? { ...b, paidAmount: totalPaid, balanceDue: newBalanceDue, status: newStatus } : b));
      setPayments(prev => ({ ...prev, [billId]: [...(prev[billId] || []), { ...payment, $id: 'temp_' + Date.now(), invoiceId: billId }] }));
      setPaymentBill(null);
      alert(`✅ Payment of ${inr(payment.amount)} recorded successfully!`);
    } catch (err) {
      setError(`Payment failed: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDelete = async (billId, invoiceNo) => {
    if (!window.confirm(`Delete invoice ${invoiceNo}? This will also delete all payment records.`)) return;
    try {
      const billPayments = payments[billId] || [];
      for (const p of billPayments) {
        if (p.$id && !p.$id.startsWith('temp_')) {
          await databases.deleteDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.paymentCollectionId, p.$id);
        }
      }
      await databases.deleteDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.billId, billId);
      setBills(prev => prev.filter(b => b.id !== billId));
      setSelectedBills(prev => { const n = new Set(prev); n.delete(billId); return n; });
      setPayments(prev => { const np = { ...prev }; delete np[billId]; return np; });
      onDelete?.(billId);
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  const handleExportData = () => {
    const exportData = filteredBills.map(bill => {
      const c            = clients.find(x => x.id === bill.clientId);
      const billPayments = payments[bill.id] || [];
      const totalPaidFromPayments = billPayments.reduce((sum, p) => sum + p.amount, 0);
      return {
        'Invoice No': bill.invoiceNo, 'Date': bill.date, 'Due Date': bill.dueDate,
        'Client': c?.companyName || c?.name || 'Unknown', 'GSTIN': c?.gstin || '',
        'Subtotal': bill.subtotal, 'Discount': bill.discountAmount, 'Advance Payment': bill.advancePayment,
        'CGST': bill.cgst, 'SGST': bill.sgst, 'Total Tax': bill.totalTax, 'Total': bill.total,
        'Payments Received': totalPaidFromPayments, 'Total Paid': bill.paidAmount, 'Balance Due': bill.balanceDue,
        'Status': bill.status, 'GST Type': bill.gstType === 'with_gst' ? `With GST (${bill.gstRate}%)` : 'Without GST',
        'Payment Count': billPayments.length,
      };
    });
    exportToCSV(exportData, `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // --------------------------------------------------------------------------
  // DERIVED DATA
  // --------------------------------------------------------------------------

  const stats = useMemo(() => {
    const paid    = bills.filter(b => b.status === "paid");
    const pending = bills.filter(b => b.status === "pending");
    const overdue = bills.filter(b => b.status === "overdue");
    const partial = bills.filter(b => b.status === "partial");
    const withGST = bills.filter(b => b.gstType === "with_gst" && b.gstRate > 0);
    return {
      total:     bills.length,
      revenue:   bills.reduce((s, b) => s + b.total, 0),
      paid:      { count: paid.length,    amount: paid.reduce((s,b)    => s + b.total, 0) },
      pending:   { count: pending.length, amount: pending.reduce((s,b) => s + b.total, 0) },
      overdue:   { count: overdue.length, amount: overdue.reduce((s,b) => s + b.total, 0) },
      partial:   { count: partial.length, amount: partial.reduce((s,b) => s + b.total, 0) },
      totalPaid: bills.reduce((s, b) => s + (b.paidAmount || 0), 0),
      totalDue:  bills.reduce((s, b) => s + (b.balanceDue || 0), 0),
      tax:       { total: bills.reduce((s,b) => s + (b.cgst||0) + (b.sgst||0), 0), withGST: withGST.length },
    };
  }, [bills]);

  const filteredBills = useMemo(() => {
    let list = bills.filter(bill => {
      const c          = clients.find(x => x.id === bill.clientId);
      const matchSearch = bill.invoiceNo.toLowerCase().includes(search.toLowerCase())
                       || c?.companyName?.toLowerCase().includes(search.toLowerCase())
                       || c?.name?.toLowerCase().includes(search.toLowerCase());
      const matchClient   = filterClient   === "all" || bill.clientId === filterClient;
      const matchStatus   = filterStatus   === "all" || bill.status   === filterStatus;
      const matchGST      = filterGST      === "all" ? true : filterGST === "with_gst" ? (bill.gstType === "with_gst" && bill.gstRate > 0) : (bill.gstType === "without_gst" || bill.gstRate === 0);
      const matchCustomer = selectedCustomer === "all" || bill.clientId === selectedCustomer;
      let   matchDate     = true;
      if (dateRange.from) matchDate = matchDate && new Date(bill.date) >= new Date(dateRange.from);
      if (dateRange.to)   matchDate = matchDate && new Date(bill.date) <= new Date(dateRange.to);
      return matchSearch && matchClient && matchStatus && matchGST && matchDate && matchCustomer;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":    return new Date(b.date) - new Date(a.date);
        case "date_asc":     return new Date(a.date) - new Date(b.date);
        case "amount_desc":  return b.total - a.total;
        case "amount_asc":   return a.total - b.total;
        case "due_desc":     return (b.balanceDue || 0) - (a.balanceDue || 0);
        case "due_asc":      return (a.balanceDue || 0) - (b.balanceDue || 0);
        case "invoice_asc":  return a.invoiceNo.localeCompare(b.invoiceNo);
        case "invoice_desc": return b.invoiceNo.localeCompare(a.invoiceNo);
        default:             return 0;
      }
    });
    return list;
  }, [bills, clients, search, filterClient, filterStatus, filterGST, selectedCustomer, dateRange, sortBy]);

  // --------------------------------------------------------------------------
  // SELECTION HELPERS
  // --------------------------------------------------------------------------

  const handleSelectAll = () =>
    setSelectedBills(selectedBills.size === filteredBills.length && filteredBills.length > 0
      ? new Set()
      : new Set(filteredBills.map(b => b.id)));

  const handleSelectBill = (id) => {
    const n = new Set(selectedBills);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedBills(n);
  };

  const handleBulkStatusChange = async (status) => {
    if (!window.confirm(`Mark ${selectedBills.size} invoices as ${status}?`)) return;
    await Promise.all([...selectedBills].map(id => handleStatusChange(id, status)));
    setSelectedBills(new Set());
  };

  // --------------------------------------------------------------------------
  // LAYOUT HELPERS
  // --------------------------------------------------------------------------

  const pagePadding = isMobile ? DS.space[3] : isTablet ? DS.space[5] : DS.space[8];

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div style={{ fontFamily: DS.font.family, background: DS.colors.gray[50], minHeight: "100vh" }}>
      <div style={{ padding: pagePadding, maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Error Banner ─────────────────────────────────────────── */}
        {error && (
          <div style={{ marginBottom: DS.space[4], padding: DS.space[3], background: DS.colors.danger.bg, border: `1px solid ${DS.colors.danger.DEFAULT}`, borderRadius: DS.radius.md, color: DS.colors.danger.dark, fontSize: DS.font.size.sm, display: "flex", justifyContent: "space-between", alignItems: "center", gap: DS.space[3] }}>
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: DS.colors.danger.DEFAULT, flexShrink: 0 }}>×</button>
          </div>
        )}

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: DS.space[6], display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexWrap: "wrap", gap: DS.space[3] }}>
          <div>
            <h1 style={{ fontSize: isMobile ? DS.font.size.xl : DS.font.size["3xl"], fontWeight: DS.font.weight.semibold, color: DS.colors.gray[900], letterSpacing: "-0.02em", margin: 0 }}>Invoice Management</h1>
            {!isMobile && <p style={{ fontSize: DS.font.size.md, color: DS.colors.gray[600], marginTop: DS.space[1], marginBottom: 0 }}>Track and manage all your invoices in one place</p>}
          </div>
          <div style={{ display: "flex", gap: DS.space[2], flexShrink: 0 }}>
            {!isMobile && <Button variant="secondary" onClick={handleExportData} icon="📊">Export CSV</Button>}
            <Button variant="secondary" onClick={fetchData} loading={loading} icon="↻">{isMobile ? "" : "Refresh"}</Button>
            {isMobile  && <Button variant="secondary" onClick={handleExportData} icon="📊" />}
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(4, 1fr)" : "repeat(7, 1fr)",
          gap: isMobile ? DS.space[2] : DS.space[4],
          marginBottom: DS.space[6],
        }}>
          <StatCard label="Total Invoices" value={loading ? "…" : stats.total}              icon="📄" color={DS.colors.primary.DEFAULT} compact={isCompact} />
          <StatCard label="Total Revenue"  value={loading ? "…" : inr(stats.revenue)}       icon="💰" color={DS.colors.success.DEFAULT} compact={isCompact} />
          <StatCard label="Paid"           value={loading ? "…" : `${stats.paid.count}`}    icon="✓" color={DS.colors.success.DEFAULT} subtext={loading ? "" : inr(stats.paid.amount)}    compact={isCompact} />
          <StatCard label="Pending"        value={loading ? "…" : `${stats.pending.count}`} icon="⏳" color={DS.colors.warning.DEFAULT} subtext={loading ? "" : inr(stats.pending.amount)} compact={isCompact} />
          {!isMobile && <StatCard label="Partial"  value={loading ? "…" : stats.partial.count} icon="🔄" color={DS.colors.info.DEFAULT}    compact={isCompact} />}
          {!isMobile && <StatCard label="Overdue"  value={loading ? "…" : stats.overdue.count} icon="⚠"  color={DS.colors.danger.DEFAULT}  compact={isCompact} />}
          <StatCard label="Total Due"      value={loading ? "…" : inr(stats.totalDue)}      icon="💳" color={DS.colors.danger.DEFAULT}  subtext="Outstanding" compact={isCompact} />
          {isMobile  && <StatCard label="Overdue"  value={loading ? "…" : stats.overdue.count} icon="⚠"  color={DS.colors.danger.DEFAULT}  compact={isCompact} />}
        </div>

        {/* ── Filters ──────────────────────────────────────────────── */}
        <FiltersPanel
          clients={clients}
          search={search}               setSearch={setSearch}
          filterClient={filterClient}   setFilterClient={setFilterClient}
          selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
          filterStatus={filterStatus}   setFilterStatus={setFilterStatus}
          filterGST={filterGST}         setFilterGST={setFilterGST}
          sortBy={sortBy}               setSortBy={setSortBy}
          dateRange={dateRange}         setDateRange={setDateRange}
          isMobile={isMobile}
        />

        {/* ── Bulk Actions ─────────────────────────────────────────── */}
        {selectedBills.size > 0 && (
          <div style={{ background: DS.colors.primary.surface, borderRadius: DS.radius.lg, padding: DS.space[4], marginBottom: DS.space[4], display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: DS.space[3] }}>
            <span style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[700] }}>{selectedBills.size} invoice(s) selected</span>
            <div style={{ display: "flex", gap: DS.space[2] }}>
              <Button variant="success"   size="sm" onClick={() => handleBulkStatusChange("paid")}>Mark as Paid</Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBills(new Set())}>Clear</Button>
            </div>
          </div>
        )}

        {/* ── Bills Table / Cards ───────────────────────────────────── */}
        <div style={{ background: "white", borderRadius: DS.radius.lg, border: `1px solid ${DS.colors.border.light}`, overflow: "hidden" }}>

          {/* Desktop header */}
          {isDesktop && (
            <div style={{ display: "grid", gridTemplateColumns: "32px 1.5fr 1.2fr 0.9fr 0.9fr 0.8fr 0.7fr 0.9fr 1.2fr", gap: DS.space[3], padding: `${DS.space[3]} ${DS.space[5]}`, background: DS.colors.gray[50], borderBottom: `1px solid ${DS.colors.border.light}`, fontSize: DS.font.size.xs, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[600], textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <div><input type="checkbox" checked={selectedBills.size === filteredBills.length && filteredBills.length > 0} onChange={handleSelectAll} style={{ cursor: "pointer" }} /></div>
              <div>Invoice</div>
              <div>Client</div>
              <div>Date</div>
              <div style={{ textAlign: "right" }}>Amount</div>
              <div>Paid / Due</div>
              <div>GST</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
          )}

          {/* Tablet header */}
          {isTablet && (
            <div style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1.6fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,1.2fr)", gap: DS.space[3], padding: `${DS.space[3]} ${DS.space[4]}`, background: DS.colors.gray[50], borderBottom: `1px solid ${DS.colors.border.light}`, fontSize: DS.font.size.xs, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[600], textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <div><input type="checkbox" checked={selectedBills.size === filteredBills.length && filteredBills.length > 0} onChange={handleSelectAll} style={{ cursor: "pointer" }} /></div>
              <div>Invoice / Client</div>
              <div>Date</div>
              <div style={{ textAlign: "right" }}>Amount / Due</div>
              <div style={{ textAlign: "right" }}>Status / Actions</div>
            </div>
          )}

          {/* Mobile header */}
          {isMobile && (
            <div style={{ padding: `${DS.space[3]} ${DS.space[4]}`, background: DS.colors.gray[50], borderBottom: `1px solid ${DS.colors.border.light}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: DS.font.size.xs, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[600], textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {loading ? "Loading…" : `${filteredBills.length} Invoice${filteredBills.length !== 1 ? "s" : ""}`}
              </span>
              {filteredBills.length > 0 && (
                <button onClick={handleSelectAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: DS.font.size.xs, color: DS.colors.primary.DEFAULT, fontFamily: "inherit" }}>
                  {selectedBills.size === filteredBills.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
          )}

          {/* ── Scrollable content area ─────────────────────────── */}
          <div
            className="bills-scroll"
            style={{
              maxHeight:  isDesktop ? "calc(100vh - 440px)" : "none",
              overflowY:  isDesktop ? "auto"                : "visible",
              overflowX:  "hidden",   // prevents horizontal bleed on tablet/mobile
            }}
          >
            {/* Loading skeletons */}
            {loading && isDesktop && [1,2,3,4,5].map(i => <SkeletonDesktop key={i} />)}
            {loading && isTablet  && [1,2,3,4].map(i =>   <SkeletonTablet  key={i} />)}
            {loading && isMobile  && [1,2,3,4].map(i =>   <SkeletonCard    key={i} />)}

            {/* Empty state */}
            {!loading && filteredBills.length === 0 && (
              <div style={{ padding: DS.space[12], textAlign: "center", color: DS.colors.gray[500] }}>
                <div style={{ fontSize: 48, marginBottom: DS.space[4], opacity: 0.5 }}>📋</div>
                <div style={{ fontSize: DS.font.size.lg, marginBottom: DS.space[2] }}>No invoices found</div>
                <div style={{ fontSize: DS.font.size.sm }}>
                  {search || filterClient !== "all" || filterStatus !== "all" || filterGST !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first invoice to get started"}
                </div>
              </div>
            )}

            {/* Rows */}
            {!loading && filteredBills.map(bill => {
              const c            = clients.find(x => x.id === bill.clientId);
              const billPayments = payments[bill.id] || [];
              const commonProps  = {
                key:            bill.id,
                bill,
                client:         c,
                billPayments,
                onView,
                onDelete:       handleDelete,
                onPayment:      setPaymentBill,
                onViewPayments: setViewPaymentsBill,
                paymentLoading,
                paymentBillId:  paymentBill?.id,
              };

              if (isDesktop) return (
                <DesktopRow
                  {...commonProps}
                  isSelected={selectedBills.has(bill.id)}
                  onSelect={() => handleSelectBill(bill.id)}
                />
              );

              if (isTablet) return (
                <TabletRow
                  {...commonProps}
                  isSelected={selectedBills.has(bill.id)}
                  onSelect={() => handleSelectBill(bill.id)}
                />
              );

              return <MobileBillCard {...commonProps} />;
            })}
          </div>
        </div>

        {/* ── Footer Summary ───────────────────────────────────────── */}
        {!loading && filteredBills.length > 0 && (
          <div style={{ marginTop: DS.space[4], padding: DS.space[4], background: "white", borderRadius: DS.radius.lg, border: `1px solid ${DS.colors.border.light}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: DS.space[3] }}>
            <span style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600] }}>
              Showing {filteredBills.length} of {bills.length} invoices
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? DS.space[3] : DS.space[4] }}>
              <span style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[800] }}>   Total: {inr(filteredBills.reduce((s,b) => s + b.total,               0))}</span>
              <span style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.semibold, color: DS.colors.success.DEFAULT }}>Paid: {inr(filteredBills.reduce((s,b) => s + (b.paidAmount   || 0), 0))}</span>
              <span style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.semibold, color: DS.colors.danger.DEFAULT }}>  Due: {inr(filteredBills.reduce((s,b) => s + (b.balanceDue   || 0), 0))}</span>
              {!isMobile && <span style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.semibold, color: DS.colors.info.DEFAULT }}>Tax: {inr(filteredBills.reduce((s,b) => s + (b.cgst||0) + (b.sgst||0), 0))}</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {paymentBill && (
        <PaymentModal
          bill={paymentBill}
          onClose={() => setPaymentBill(null)}
          onPaymentSubmit={handleRecordPayment}
          loading={paymentLoading}
        />
      )}
      {viewPaymentsBill && (
        <ViewPaymentsModal
          bill={viewPaymentsBill}
          payments={payments[viewPaymentsBill.id] || []}
          onClose={() => setViewPaymentsBill(null)}
        />
      )}
    </div>
  );
}