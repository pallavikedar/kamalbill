// pages/NewBillForm.jsx
// ─── Professional Invoice Creation with Complete Appwrite Persistence ─────────
import { useState, useMemo, useEffect } from "react";
import { Client, Databases, ID, Query } from "appwrite";

import APPWRITE_CONFIG from "../lib/Appwriteconfig";    // ← no space

// ============================================================================
// APPWRITE CLIENT SETUP
// ============================================================================

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

// ============================================================================
// INJECT GLOBAL RESPONSIVE STYLES
// ============================================================================

const globalStyles = document.createElement("style");
globalStyles.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }

  * { box-sizing: border-box; }

  /* ── Responsive grid helpers ── */
  .grid-3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .grid-2col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .grid-modal-2col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 20px;
  }
  .items-grid {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 0.8fr auto;
    gap: 12px;
    align-items: center;
  }
  .items-header {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 0.8fr auto;
    gap: 12px;
  }
  .payment-layout {
    display: flex;
    gap: 24px;
  }
  .summary-panel {
    width: 360px;
    flex-shrink: 0;
  }
  .summary-inner {
    position: sticky;
    top: 16px;
  }
  .gst-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .discount-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .page-pad {
    padding: 32px;
  }
  .section-pad {
    padding: 24px;
  }
  .actions-row {
    padding: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  /* ── Tablet (≤ 900px) ── */
  @media (max-width: 900px) {
    .grid-3col {
      grid-template-columns: repeat(2, 1fr);
    }
    .payment-layout {
      flex-direction: column;
    }
    .summary-panel {
      width: 100%;
    }
    .summary-inner {
      position: static;
    }
    .page-pad {
      padding: 20px;
    }
  }

  /* ── Mobile (≤ 640px) ── */
  @media (max-width: 640px) {
    .grid-3col {
      grid-template-columns: 1fr;
    }
    .grid-2col {
      grid-template-columns: 1fr;
    }
    .grid-modal-2col {
      grid-template-columns: 1fr;
    }
    .gst-grid {
      grid-template-columns: 1fr;
    }
    .discount-grid {
      grid-template-columns: 1fr;
    }
    .items-header {
      display: none;
    }
    .items-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 8px;
    }
    .item-desc  { grid-column: 1 / -1; }
    .item-qty   { grid-column: 1; }
    .item-rate  { grid-column: 2; }
    .item-amt   { grid-column: 1; font-size: 12px; padding: 6px; }
    .item-del   { grid-column: 2; justify-self: end; }
    .page-pad {
      padding: 12px;
    }
    .section-pad {
      padding: 16px;
    }
    .actions-row {
      padding: 16px;
      flex-direction: column-reverse;
    }
    .actions-row button {
      width: 100%;
      justify-content: center;
    }
  }

  /* ── Modal responsive ── */
  .modal-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 12px 24px 0;
    border-bottom: 1px solid #E9ECEF;
  }
  .modal-nav {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #E9ECEF;
    align-items: center;
  }
  @media (max-width: 640px) {
    .modal-tabs {
      padding: 8px 16px 0;
      gap: 4px;
    }
    .modal-tabs button {
      font-size: 11px !important;
      padding: 4px 8px !important;
    }
    .modal-inner-pad {
      padding: 16px !important;
    }
    .modal-footer {
      flex-direction: column;
      gap: 8px;
    }
    .modal-footer button {
      width: 100%;
      justify-content: center;
    }
  }

  /* ── Client info card grid ── */
  .client-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
  }

  /* ── Bill To header row ── */
  .bill-to-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bill-to-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Invoice number/dates row - allow wrapping */
  .invoice-header-grid .grid-3col {
    gap: 16px;
  }
`;
document.head.appendChild(globalStyles);

// ============================================================================
// PROFESSIONAL DESIGN SYSTEM
// ============================================================================

const DS = {
  colors: {
    primary: { DEFAULT: "#0A5C8E", light: "#1E6F9F", dark: "#064663", surface: "#F0F7FC", border: "#C5E0F0" },
    secondary: { DEFAULT: "#2C3E50", light: "#34495E", dark: "#1A252F" },
    accent: { DEFAULT: "#E67E22", light: "#F39C12", dark: "#D35400" },
    success: { DEFAULT: "#27AE60", light: "#2ECC71", dark: "#1E8449", bg: "#E8F8F5" },
    warning: { DEFAULT: "#F39C12", light: "#F1C40F", dark: "#D68910", bg: "#FEF5E7" },
    danger: { DEFAULT: "#E74C3C", light: "#EC7063", dark: "#C0392B", bg: "#FDEDEC" },
    info: { DEFAULT: "#3498DB", light: "#5DADE2", dark: "#2471A3", bg: "#EAF2F8" },
    gray: {
      50: "#F8F9FA", 100: "#F1F3F5", 200: "#E9ECEF", 300: "#DEE2E6",
      400: "#CED4DA", 500: "#ADB5BD", 600: "#6C757D", 700: "#495057",
      800: "#343A40", 900: "#212529",
    },
    border: { light: "#E9ECEF", DEFAULT: "#DEE2E6", dark: "#CED4DA" },
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    lg: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)",
    focus: "0 0 0 3px rgba(10,92,142,0.1)",
  },
  radius: { sm: "4px", md: "6px", lg: "8px", xl: "12px" },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: { xs: "11px", sm: "12px", base: "13px", md: "14px", lg: "16px", xl: "18px", "2xl": "20px", "3xl": "24px" },
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  space: { 0: "0px", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px", 10: "40px", 12: "48px" },
};

// ============================================================================
// GST RATE OPTIONS
// ============================================================================

const GST_RATES = [
  { value: 0,  label: "0% GST (Exempt)",                        cgst: 0,   sgst: 0   },
  { value: 5,  label: "5% GST (2.5% CGST + 2.5% SGST)",        cgst: 2.5, sgst: 2.5 },
  { value: 12, label: "12% GST (6% CGST + 6% SGST)",           cgst: 6,   sgst: 6   },
  { value: 18, label: "18% GST (9% CGST + 9% SGST)",           cgst: 9,   sgst: 9   },
  { value: 28, label: "28% GST (14% CGST + 14% SGST)",         cgst: 14,  sgst: 14  },
];

// ============================================================================
// CLIENT FIELD DEFINITIONS
// ============================================================================

const CLIENT_SECTIONS = [
  {
    section: "Organization",
    fields: [
      { key: "companyName",    label: "Legal Entity Name",     type: "text",     required: true,  placeholder: "e.g., ABC Technologies Pvt Ltd" },
      { key: "tradeName",      label: "Trading As (DBA)",       type: "text",                      placeholder: "e.g., ABC Tech" },
      { key: "website",        label: "Website",                type: "url",                       placeholder: "https://www.example.com" },
      { key: "industry",       label: "Industry Vertical",      type: "select",   options: ["Technology","Manufacturing","Retail","Healthcare","Education","Financial Services","Real Estate","Construction","Logistics","Other"] },
    ],
  },
  {
    section: "Contact",
    fields: [
      { key: "contactPerson",  label: "Contact Person",         type: "text",     required: true,  placeholder: "Full name" },
      { key: "designation",    label: "Designation",            type: "text",                      placeholder: "e.g., Finance Director" },
      { key: "email",          label: "Email Address",          type: "email",    required: true,  placeholder: "john.doe@company.com" },
      { key: "phone",          label: "Direct Line",            type: "tel",      required: true,  placeholder: "+91 98765 43210" },
      { key: "mobile",         label: "Mobile Number",          type: "tel",                       placeholder: "Alternate contact number" },
    ],
  },
  {
    section: "Tax & GST",
    fields: [
      { key: "gstin",          label: "GST Identification No.", type: "text",     helpText: "15-character GSTIN",       placeholder: "22AAAAA0000A1Z5" },
      { key: "pan",            label: "PAN Number",             type: "text",     helpText: "Permanent Account Number", placeholder: "AAAAA1234A" },
      { key: "tin",            label: "TIN Number",             type: "text",                      placeholder: "Tax identification number" },
      { key: "cst",            label: "CST Number",             type: "text",                      placeholder: "Central sales tax number" },
      { key: "gstTreatment",  label: "GST Classification",     type: "select",   options: ["Regular Taxpayer","Composition Scheme","Casual Taxable Person","Non-Resident","Input Service Distributor"] },
      { key: "placeOfSupply", label: "Place of Supply",        type: "text",                      placeholder: "State name for GST purpose" },
    ],
  },
  {
    section: "Address",
    fields: [
      { key: "billingAddress",  label: "Registered Office",      type: "textarea", rows: 2,          placeholder: "Building, Street, Landmark" },
      { key: "shippingAddress", label: "Shipping Address",       type: "textarea", rows: 2,          placeholder: "If different from registered office" },
      { key: "city",            label: "City",                   type: "text",                      placeholder: "e.g., Mumbai" },
      { key: "state",           label: "State",                  type: "text",                      placeholder: "e.g., Maharashtra" },
      { key: "stateCode",       label: "State Code",             type: "text",     helpText: "For e-invoicing", placeholder: "e.g., 27" },
      { key: "pincode",         label: "Postal Code",            type: "text",                      placeholder: "400001" },
      { key: "country",         label: "Country",                type: "text",                      placeholder: "India", defaultValue: "India" },
    ],
  },
  {
    section: "Banking",
    fields: [
      { key: "bankName",       label: "Bank Name",              type: "text",                      placeholder: "e.g., State Bank of India" },
      { key: "accountNumber",  label: "Account Number",         type: "text",                      placeholder: "XXXXXXXXXXXX" },
      { key: "ifscCode",       label: "IFSC Code",              type: "text",                      placeholder: "SBIN0012345" },
      { key: "upiId",          label: "UPI ID",                 type: "text",                      placeholder: "company@bank" },
      { key: "paymentTerms",   label: "Payment Terms",          type: "select",   options: ["Due on Receipt","Net 15","Net 30","Net 45","Net 60"] },
      { key: "creditLimit",    label: "Credit Limit (₹)",       type: "number",                    placeholder: "e.g., 500000" },
    ],
  },
  {
    section: "Classification",
    fields: [
      { key: "businessType",   label: "Business Type",          type: "select",   options: ["Proprietorship","Partnership","Private Limited","Public Limited","LLP","Trust","Society","Other"] },
    ],
  },
];

const BLANK_CLIENT = {};
CLIENT_SECTIONS.forEach(s => s.fields.forEach(f => { BLANK_CLIENT[f.key] = f.defaultValue || ""; }));

const ALL_CLIENT_KEYS = CLIENT_SECTIONS.flatMap(s => s.fields.map(f => f.key));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// FIXED: Added nextInvoiceNo function
const nextInvoiceNo = (bills) => {
  if (!bills || bills.length === 0) {
    return "INV-001";
  }
  
  // Extract the highest invoice number
  let maxNum = 0;
  bills.forEach(bill => {
    if (bill && bill.invoiceNo) {
      const match = bill.invoiceNo.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  
  // Generate next number
  const nextNum = maxNum + 1;
  return `INV-${String(nextNum).padStart(3, '0')}`;
};

const inr = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);

const buildClientPayload = (c) => {
  const payload = {};
  ALL_CLIENT_KEYS.forEach(key => {
    const val = c[key];
    payload[key] = key === "creditLimit"
      ? (parseFloat(val) || 0)
      : String(val || "");
  });
  return payload;
};

const buildBillPayload = (form, calc) => ({
  invoiceNo:      String(form.invoiceNo || ""),
  date:           String(form.date || ""),
  dueDate:        String(form.dueDate || ""),
  clientId:       String(form.clientId || ""),
  gstType:        String(form.gstType || "without_gst"),
  gstRate:        parseFloat(form.gstRate) || 0,
  status:         String(calc.paymentStatus || "pending"),
  notes:          String(form.notes || ""),
  terms:          String(form.terms || ""),
  discount:       parseFloat(form.discount) || 0,
  discountType:   String(form.discountType || "fixed"),
  advancePayment: parseFloat(calc.advancePayment) || 0,
  subtotal:       parseFloat(calc.subtotal) || 0,
  discountAmount: parseFloat(calc.discountAmount) || 0,
  afterDiscount:  parseFloat(calc.afterDiscount) || 0,
  cgst:           parseFloat(calc.cgst) || 0,
  sgst:           parseFloat(calc.sgst) || 0,
  totalTax:       parseFloat(calc.cgst + calc.sgst) || 0,
  total:          parseFloat(calc.total) || 0,
  balanceDue:     parseFloat(calc.balanceDue) || 0,
  itemsJson:      JSON.stringify(form.items.map(i => ({ ...i, amount: i.qty * i.rate }))),
  itemCount:      form.items.length,
});

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

const inputBase = (hasError) => ({
  width: "100%",
  padding: "8px",
  border: `1px solid ${hasError ? DS.colors.danger.DEFAULT : DS.colors.border.DEFAULT}`,
  borderRadius: DS.radius.md,
  fontSize: DS.font.size.sm,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  minWidth: 0, // critical for grid overflow
});

const focusHandlers = (errorColor) => ({
  onFocus: (e) => { e.currentTarget.style.borderColor = DS.colors.primary.DEFAULT; e.currentTarget.style.boxShadow = DS.shadows.focus; },
  onBlur:  (e) => { e.currentTarget.style.borderColor = errorColor || DS.colors.border.DEFAULT; e.currentTarget.style.boxShadow = "none"; },
});

const Label = ({ label, required, helpText }) => (
  <label style={{ display: "block", fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium, color: DS.colors.gray[700], marginBottom: DS.space[1] }}>
    {label}
    {required  && <span style={{ color: DS.colors.danger.DEFAULT, marginLeft: 4 }}>*</span>}
    {helpText  && <span style={{ color: DS.colors.gray[500], fontSize: DS.font.size.xs, marginLeft: 8 }}>({helpText})</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? <div style={{ fontSize: DS.font.size.xs, color: DS.colors.danger.DEFAULT, marginTop: DS.space[1] }}>{msg}</div> : null;

const FormInput = ({ label, required, helpText, error, icon, ...props }) => (
  <div style={{ marginBottom: DS.space[4] }}>
    {label && <Label label={label} required={required} helpText={helpText} />}
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: DS.space[3], top: "50%", transform: "translateY(-50%)", color: DS.colors.gray[400], fontSize: DS.font.size.md }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        style={{ ...inputBase(error), paddingLeft: icon ? DS.space[8] : DS.space[2], ...props.style }}
        {...focusHandlers(error ? DS.colors.danger.DEFAULT : null)}
      />
    </div>
    <FieldError msg={error} />
  </div>
);

const Button = ({ children, variant = "primary", onClick, disabled, size = "md", icon, loading, style: extStyle }) => {
  const styles = {
    primary:   { bg: DS.colors.primary.DEFAULT,   color: "white",                      border: "none" },
    secondary: { bg: "white",                      color: DS.colors.gray[700],           border: `1px solid ${DS.colors.border.DEFAULT}` },
    success:   { bg: DS.colors.success.DEFAULT,    color: "white",                      border: "none" },
    danger:    { bg: "white",                      color: DS.colors.danger.DEFAULT,      border: `1px solid ${DS.colors.danger.DEFAULT}` },
  }[variant];

  const pad = { sm: `${DS.space[1]} ${DS.space[2]}`, md: `${DS.space[2]} ${DS.space[4]}`, lg: `${DS.space[3]} ${DS.space[6]}` }[size];
  const fs  = { sm: DS.font.size.xs, md: DS.font.size.sm, lg: DS.font.size.md }[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: pad, fontSize: fs, border: styles.border, borderRadius: DS.radius.md,
        background: styles.bg, color: styles.color,
        fontWeight: DS.font.weight.medium,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        opacity: (disabled || loading) ? 0.6 : 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: DS.space[2],
        transition: "all 0.15s ease", fontFamily: "inherit",
        whiteSpace: "nowrap",
        ...extStyle,
      }}
    >
      {loading && <span style={{ width: 12, height: 12, border: `2px solid currentColor`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewBillForm({ bills, onSave }) {
  const [clients,        setClients]        = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError,   setClientsError]   = useState(null);

  const [form, setForm] = useState({
    invoiceNo:      "", // Will be set in useEffect
    date:           new Date().toISOString().split("T")[0],
    dueDate:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    clientId:       "",
    gstType:        "without_gst",
    gstRate:        18,
    items:          [{ id: 1, desc: "", qty: 1, rate: 0 }],
    advancePayment: 0,
    discount:       0,
    discountType:   "fixed",
    notes:          "",
    terms:          "",
  });

  const [newClientMode,    setNewClientMode]    = useState(false);
  const [newClient,        setNewClient]        = useState({ ...BLANK_CLIENT });
  const [activeSection,    setActiveSection]    = useState(0);
  const [errors,           setErrors]           = useState({});
  const [savingClient,     setSavingClient]     = useState(false);
  const [savingBill,       setSavingBill]       = useState(false);
  const [appwriteError,    setAppwriteError]    = useState(null);
  const [appwriteSuccess,  setAppwriteSuccess]  = useState(null);

  // Set initial invoice number
  useEffect(() => {
    if (bills) {
      setForm(f => ({ ...f, invoiceNo: nextInvoiceNo(bills) }));
    }
  }, [bills]);

 useEffect(() => { fetchClientsFromAppwrite(); }, [fetchClientsFromAppwrite]);

  const fetchClientsFromAppwrite = async () => {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        [Query.limit(100), Query.orderDesc("$createdAt")]
      );
      const mapped = res.documents.map(doc => ({ ...doc, id: doc.$id }));
      setClients(mapped);
      if (mapped.length > 0 && !form.clientId) {
        setForm(f => ({ ...f, clientId: mapped[0].id }));
      }
    } catch (err) {
      console.error("Appwrite [fetch clients]:", err);
      setClientsError("Could not load clients. Check your Appwrite config.");
    } finally {
      setClientsLoading(false);
    }
  };

 const getGSTRates = useCallback(() => {
  if (form.gstType === "without_gst") return { cgstPercent: 0, sgstPercent: 0, totalPercent: 0 };
  const selectedRate = GST_RATES.find(r => r.value === form.gstRate);
  if (selectedRate) return { cgstPercent: selectedRate.cgst, sgstPercent: selectedRate.sgst, totalPercent: selectedRate.value };
  return { cgstPercent: 0, sgstPercent: 0, totalPercent: 0 };
}, [form.gstType, form.gstRate]);

  const calc = useMemo(() => {
  const getGSTRates = () => {
    if (form.gstType === "without_gst") return { cgstPercent: 0, sgstPercent: 0, totalPercent: 0 };
    const selectedRate = GST_RATES.find(r => r.value === form.gstRate);
    if (selectedRate) return { cgstPercent: selectedRate.cgst, sgstPercent: selectedRate.sgst, totalPercent: selectedRate.value };
    return { cgstPercent: 0, sgstPercent: 0, totalPercent: 0 };
  };
  
  const subtotal = form.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discountAmount = form.discount > 0
    ? (form.discountType === "percentage" ? (subtotal * form.discount) / 100 : form.discount)
    : 0;
  const afterDiscount = subtotal - discountAmount;
  const { cgstPercent, sgstPercent } = getGSTRates();
  const cgst = afterDiscount * (cgstPercent / 100);
  const sgst = afterDiscount * (sgstPercent / 100);
  const total = afterDiscount + cgst + sgst;
  const advancePayment = Math.min(form.advancePayment || 0, total);
  const balanceDue = total - advancePayment;
  const paymentStatus = balanceDue <= 0 ? "paid" : advancePayment > 0 ? "partial" : "pending";
  return { subtotal, discountAmount, afterDiscount, cgst, sgst, total, advancePayment, balanceDue, paymentStatus, cgstPercent, sgstPercent };
}, [form.items, form.discount, form.discountType, form.advancePayment, form.gstType, form.gstRate]);
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { id: Date.now(), desc: "", qty: 1, rate: 0 }] }));
  const removeItem = (id) => { if (form.items.length === 1) return; setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) })); };
  const updateItem = (id, key, val) => setForm(f => ({
    ...f,
    items: f.items.map(i => i.id === id ? { ...i, [key]: (key === "qty" || key === "rate") ? parseFloat(val) || 0 : val } : i),
  }));

  const handleSaveClient = async () => {
    const errs = {};
    if (!newClient.companyName?.trim()) errs.companyName = "Company name is required";
    if (!newClient.email?.trim())       errs.email       = "Email is required";
    if (!newClient.phone?.trim())       errs.phone       = "Phone number is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSavingClient(true);
    setAppwriteError(null);
    try {
      const payload = buildClientPayload(newClient);
      const doc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collectionId, ID.unique(), payload,
      );
      const created = { ...newClient, ...doc, id: doc.$id };
      setClients(prev => [created, ...prev]);
      setForm(f => ({ ...f, clientId: doc.$id }));
      setNewClientMode(false);
      setNewClient({ ...BLANK_CLIENT });
      setActiveSection(0);
      setErrors({});
      setAppwriteSuccess(`Client "${newClient.companyName}" saved ✓`);
      setTimeout(() => setAppwriteSuccess(null), 4000);
    } catch (err) {
      console.error("Appwrite [client save]:", err);
      setAppwriteError(`Client save failed: ${err.message}`);
    } finally {
      setSavingClient(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.clientId) errs.clientId = "Please select a client";
    if (form.items.some(i => !i.desc.trim()))  errs.items = "All items must have a description";
    if (form.items.some(i => i.qty  <= 0))     errs.items = "Quantity must be greater than 0";
    if (form.items.some(i => i.rate <= 0))     errs.items = "Rate must be greater than 0";
    if ((form.advancePayment || 0) > calc.total) errs.advancePayment = "Advance cannot exceed total amount";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSavingBill(true);
    setAppwriteError(null);
    try {
      const payload = buildBillPayload(form, calc);
      const doc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.billId, ID.unique(), payload,
      );
      const billData = { ...form, id: doc.$id, createdAt: doc.$createdAt, ...calc, items: form.items.map(i => ({ ...i, amount: i.qty * i.rate })) };
      onSave(billData);
      setForm({
        invoiceNo: nextInvoiceNo([...bills, {}]),
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        clientId: clients[0]?.id || "",
        gstType: "without_gst", gstRate: 18,
        items: [{ id: 1, desc: "", qty: 1, rate: 0 }],
        advancePayment: 0, discount: 0, discountType: "fixed", notes: "", terms: "",
      });
      setAppwriteSuccess(`Invoice ${payload.invoiceNo} saved ✓`);
      setTimeout(() => setAppwriteSuccess(null), 4000);
    } catch (err) {
      console.error("Appwrite [bill save]:", err);
      setAppwriteError(`Invoice save failed: ${err.message}`);
    } finally {
      setSavingBill(false);
    }
  };

  const selectedClient  = clients.find(c => c.id === form.clientId);
  const currentGSTRate  = GST_RATES.find(r => r.value === form.gstRate);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{ fontFamily: DS.font.family, background: DS.colors.gray[50], minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }} className="page-pad">

        {/* ── Global Alerts ── */}
        {appwriteError && (
          <div style={{ marginBottom: DS.space[4], padding: DS.space[3], background: DS.colors.danger.bg, border: `1px solid ${DS.colors.danger.DEFAULT}`, borderRadius: DS.radius.md, color: DS.colors.danger.dark, fontSize: DS.font.size.sm, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <span>⚠ {appwriteError}</span>
            <button onClick={() => setAppwriteError(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: DS.colors.danger.DEFAULT, lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>
        )}
        {appwriteSuccess && (
          <div style={{ marginBottom: DS.space[4], padding: DS.space[3], background: DS.colors.success.bg, border: `1px solid ${DS.colors.success.DEFAULT}`, borderRadius: DS.radius.md, color: DS.colors.success.dark, fontSize: DS.font.size.sm }}>
            ✓ {appwriteSuccess}
          </div>
        )}

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: DS.font.weight.semibold, color: DS.colors.gray[900], letterSpacing: "-0.02em", margin: 0 }}>
            Create New Invoice
          </h1>
          <p style={{ fontSize: DS.font.size.md, color: DS.colors.gray[600], marginTop: DS.space[2], marginBottom: 0 }}>
            GST-compliant invoice · Saved directly to Appwrite
          </p>
        </div>

        {/* ── Main Card ── */}
        <div style={{ background: "white", borderRadius: DS.radius.xl, border: `1px solid ${DS.colors.border.light}`, overflow: "hidden" }}>

          {/* ── Invoice Header Row ── */}
          <div className="invoice-header-grid section-pad" style={{ borderBottom: `1px solid ${DS.colors.border.light}`, background: DS.colors.gray[50] }}>
            <div className="grid-3col">
              <FormInput label="Invoice Number" value={form.invoiceNo} onChange={e => setForm(f => ({ ...f, invoiceNo: e.target.value }))} placeholder="INV-001" required />
              <FormInput label="Invoice Date"   type="date" value={form.date}    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}    required />
              <FormInput label="Due Date"       type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
            </div>
          </div>

          {/* ── Bill To / Client ── */}
          <div className="section-pad" style={{ borderBottom: `1px solid ${DS.colors.border.light}` }}>
            <div className="bill-to-header">
              <h3 style={{ fontSize: DS.font.size.lg, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[800], margin: 0 }}>Bill To</h3>
              <div className="bill-to-actions">
                <Button variant="secondary" size="sm" onClick={fetchClientsFromAppwrite} disabled={clientsLoading}>
                  {clientsLoading ? "Loading…" : "↻ Refresh"}
                </Button>
                <Button variant="secondary" size="sm" icon="+" onClick={() => { setNewClientMode(true); setErrors({}); }}>
                  New Client
                </Button>
              </div>
            </div>

            {clientsLoading && (
              <div style={{ padding: DS.space[3], background: DS.colors.info.bg, borderRadius: DS.radius.md, fontSize: DS.font.size.sm, color: DS.colors.info.DEFAULT }}>
                Loading clients from Appwrite…
              </div>
            )}
            {clientsError && (
              <div style={{ padding: DS.space[3], background: DS.colors.danger.bg, borderRadius: DS.radius.md, fontSize: DS.font.size.sm, color: DS.colors.danger.dark, marginBottom: DS.space[3] }}>
                ⚠ {clientsError}
              </div>
            )}

            {!clientsLoading && (
              <>
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  style={{ ...inputBase(errors.clientId), cursor: "pointer" }}
                >
                  <option value="">— Select a client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName || c.name}{c.gstin ? ` · ${c.gstin}` : ""}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.clientId} />
              </>
            )}

            {selectedClient && (
              <div style={{ marginTop: DS.space[4], padding: DS.space[3], background: DS.colors.primary.surface, borderRadius: DS.radius.md, fontSize: DS.font.size.sm }}>
                <div style={{ fontWeight: DS.font.weight.semibold, color: DS.colors.primary.dark, marginBottom: DS.space[2] }}>
                  {selectedClient.companyName}
                  {selectedClient.tradeName && <span style={{ fontWeight: DS.font.weight.normal, color: DS.colors.gray[500], marginLeft: 8 }}>({selectedClient.tradeName})</span>}
                </div>
                <div className="client-info-grid">
                  {selectedClient.gstin          && <div><strong>GSTIN:</strong> {selectedClient.gstin}</div>}
                  {selectedClient.pan            && <div><strong>PAN:</strong> {selectedClient.pan}</div>}
                  {selectedClient.contactPerson  && <div><strong>Contact:</strong> {selectedClient.contactPerson}</div>}
                  {selectedClient.phone          && <div><strong>Phone:</strong> {selectedClient.phone}</div>}
                  {selectedClient.email          && <div><strong>Email:</strong> {selectedClient.email}</div>}
                  {selectedClient.billingAddress && <div style={{ gridColumn: "1 / -1" }}><strong>Address:</strong> {selectedClient.billingAddress}</div>}
                </div>
              </div>
            )}
          </div>

          {/* ── GST Configuration ── */}
          <div className="section-pad" style={{ borderBottom: `1px solid ${DS.colors.border.light}`, background: DS.colors.gray[50] }}>
            <h3 style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[800], marginTop: 0, marginBottom: DS.space[4] }}>
              Tax Configuration
            </h3>
            <div className="gst-grid">
              <div>
                <Label label="GST Type" required helpText="Select whether GST applies" />
                <div style={{ display: "flex", gap: DS.space[3], flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: DS.space[2], cursor: "pointer" }}>
                    <input type="radio" value="without_gst" checked={form.gstType === "without_gst"}
                      onChange={e => setForm(f => ({ ...f, gstType: e.target.value, gstRate: 0 }))} style={{ cursor: "pointer" }} />
                    <span style={{ fontSize: DS.font.size.sm }}>Without GST</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: DS.space[2], cursor: "pointer" }}>
                    <input type="radio" value="with_gst" checked={form.gstType === "with_gst"}
                      onChange={e => setForm(f => ({ ...f, gstType: e.target.value }))} style={{ cursor: "pointer" }} />
                    <span style={{ fontSize: DS.font.size.sm }}>With GST</span>
                  </label>
                </div>
              </div>

              {form.gstType === "with_gst" && (
                <div>
                  <Label label="GST Rate" required helpText="Select applicable GST rate" />
                  <select
                    value={form.gstRate}
                    onChange={e => setForm(f => ({ ...f, gstRate: parseInt(e.target.value) }))}
                    style={{ ...inputBase(false), cursor: "pointer", background: "white" }}
                  >
                    {GST_RATES.filter(rate => rate.value > 0).map(rate => (
                      <option key={rate.value} value={rate.value}>{rate.label}</option>
                    ))}
                  </select>
                  {currentGSTRate && currentGSTRate.value > 0 && (
                    <div style={{ marginTop: DS.space[2], fontSize: DS.font.size.xs, color: DS.colors.gray[600] }}>
                      CGST: {currentGSTRate.cgst}% | SGST: {currentGSTRate.sgst}%
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Line Items ── */}
          <div className="section-pad" style={{ borderBottom: `1px solid ${DS.colors.border.light}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: DS.space[4], flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: DS.font.size.lg, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[800], margin: 0 }}>Line Items</h3>
              <Button variant="secondary" size="sm" icon="+" onClick={addItem}>Add Item</Button>
            </div>

            {/* Desktop header */}
            <div className="items-header" style={{ paddingBottom: DS.space[2], borderBottom: `1px solid ${DS.colors.border.light}`, marginBottom: DS.space[2] }}>
              {["Description", "Qty", "Rate (₹)", "Amount (₹)", ""].map(h => (
                <div key={h} style={{ fontSize: DS.font.size.xs, fontWeight: DS.font.weight.medium, color: DS.colors.gray[500], textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
              ))}
            </div>

            {form.items.map((item, idx) => (
              <div
                key={item.id}
                className="items-grid"
                style={{
                  marginBottom: DS.space[3],
                  paddingBottom: DS.space[3],
                  borderBottom: idx < form.items.length - 1 ? `1px dashed ${DS.colors.border.light}` : "none",
                }}
              >
                <input className="item-desc"
                  value={item.desc}
                  onChange={e => updateItem(item.id, "desc", e.target.value)}
                  placeholder="Item description"
                  style={inputBase(false)}
                  {...focusHandlers()}
                />
                <div className="item-qty" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <label style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], display: "none" }} className="mobile-label">Qty</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={e => updateItem(item.id, "qty", e.target.value)}
                    style={inputBase(false)}
                    placeholder="Qty"
                    {...focusHandlers()}
                  />
                </div>
                <div className="item-rate" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={e => updateItem(item.id, "rate", e.target.value)}
                    style={inputBase(false)}
                    placeholder="Rate ₹"
                    {...focusHandlers()}
                  />
                </div>
                <div className="item-amt" style={{ fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium, color: DS.colors.gray[700], padding: DS.space[2], background: DS.colors.gray[50], borderRadius: DS.radius.sm, wordBreak: "break-all" }}>
                  {inr(item.qty * item.rate)}
                </div>
                <div className="item-del" style={{ display: "flex", alignItems: "center" }}>
                  <Button variant="danger" size="sm" onClick={() => removeItem(item.id)} disabled={form.items.length === 1}>×</Button>
                </div>
              </div>
            ))}
            <FieldError msg={errors.items} />
          </div>

          {/* ── Payment Details + Invoice Summary ── */}
          <div className="payment-layout section-pad" style={{ borderBottom: `1px solid ${DS.colors.border.light}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[800], marginTop: 0, marginBottom: DS.space[4] }}>Payment Details</h3>

              <div className="discount-grid">
                <div>
                  <label style={{ display: "block", fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium, color: DS.colors.gray[700], marginBottom: DS.space[1] }}>Discount</label>
                  <div style={{ display: "flex", gap: DS.space[2] }}>
                    <input
                      type="number"
                      value={form.discount}
                      onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      style={{ ...inputBase(false), flex: 1, minWidth: 0 }}
                      {...focusHandlers()}
                    />
                    <select
                      value={form.discountType}
                      onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                      style={{ padding: DS.space[2], border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: DS.font.size.sm, background: "white", cursor: "pointer", outline: "none", flexShrink: 0 }}
                    >
                      <option value="fixed">₹ Fixed</option>
                      <option value="percentage">% Pct</option>
                    </select>
                  </div>
                </div>
                <FormInput
                  label="Advance Payment"
                  type="number"
                  value={form.advancePayment}
                  onChange={e => setForm(f => ({ ...f, advancePayment: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  icon="₹"
                  error={errors.advancePayment}
                />
              </div>

              <FormInput label="Notes / Instructions" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes for the client" />
              <FormInput label="Terms & Conditions"   value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} placeholder="Payment terms, late fees, etc." />
            </div>

            {/* ── Summary Panel ── */}
            <div className="summary-panel">
              <div className="summary-inner" style={{ background: DS.colors.gray[50], borderRadius: DS.radius.lg, padding: DS.space[5], border: `1px solid ${DS.colors.border.light}` }}>
                <h3 style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[800], marginTop: 0, marginBottom: DS.space[4] }}>Invoice Summary</h3>

                {[
                  { label: "Subtotal", val: calc.subtotal },
                  calc.discountAmount > 0 && { label: `Discount (${form.discountType === "percentage" ? `${form.discount}%` : "Fixed"})`, val: -calc.discountAmount, color: DS.colors.success.DEFAULT },
                  { label: "After Discount", val: calc.afterDiscount },
                  ...(form.gstType === "with_gst" && calc.cgstPercent > 0 ? [
                    { label: `CGST (${calc.cgstPercent}%)`, val: calc.cgst, color: DS.colors.info.DEFAULT },
                    { label: `SGST (${calc.sgstPercent}%)`, val: calc.sgst, color: DS.colors.info.DEFAULT },
                  ] : []),
                ].filter(Boolean).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: DS.space[2], fontSize: DS.font.size.sm, gap: 8 }}>
                    <span style={{ color: row.color || DS.colors.gray[600] }}>{row.label}</span>
                    <span style={{ color: row.color, whiteSpace: "nowrap" }}>{row.val < 0 ? `-${inr(Math.abs(row.val))}` : inr(row.val)}</span>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: DS.space[3], paddingTop: DS.space[3], borderTop: `1px solid ${DS.colors.border.DEFAULT}`, fontSize: DS.font.size.lg, fontWeight: DS.font.weight.bold, color: DS.colors.primary.DEFAULT, gap: 8 }}>
                  <span>Total</span>
                  <span style={{ whiteSpace: "nowrap" }}>{inr(calc.total)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: DS.space[2], padding: DS.space[2], background: DS.colors.info.bg, borderRadius: DS.radius.md, gap: 8 }}>
                  <span style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[700] }}>Advance</span>
                  <span style={{ fontSize: DS.font.size.md, fontWeight: DS.font.weight.semibold, color: DS.colors.info.DEFAULT, whiteSpace: "nowrap" }}>-{inr(calc.advancePayment)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: DS.space[3], paddingTop: DS.space[3], borderTop: `2px solid ${DS.colors.border.dark}`, fontSize: DS.font.size.xl, fontWeight: DS.font.weight.bold, color: calc.balanceDue === 0 ? DS.colors.success.DEFAULT : DS.colors.danger.DEFAULT, gap: 8 }}>
                  <span>Balance Due</span>
                  <span style={{ whiteSpace: "nowrap" }}>{inr(calc.balanceDue)}</span>
                </div>

                <div style={{ marginTop: DS.space[3], padding: DS.space[2], borderRadius: DS.radius.md, textAlign: "center", background: calc.paymentStatus === "paid" ? DS.colors.success.bg : calc.paymentStatus === "partial" ? DS.colors.warning.bg : DS.colors.gray[100], color: calc.paymentStatus === "paid" ? DS.colors.success.DEFAULT : calc.paymentStatus === "partial" ? DS.colors.warning.DEFAULT : DS.colors.gray[600], fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium }}>
                  {calc.paymentStatus === "paid" ? "✓ Fully Paid" : calc.paymentStatus === "partial" ? "⚠ Partially Paid" : "Pending Payment"}
                </div>
              </div>
            </div>
          </div>

          {/* ── Form Actions ── */}
          <div className="actions-row" style={{ background: DS.colors.gray[50] }}>
            <Button variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={savingBill}>
              {savingBill ? "Saving to Appwrite…" : "Generate Invoice"}
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================================
          NEW CLIENT MODAL — Responsive
      ============================================================================ */}
      {newClientMode && (
        <div
          onClick={() => setNewClientMode(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "white", borderRadius: DS.radius.xl, maxWidth: 900, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: DS.shadows.lg, display: "flex", flexDirection: "column" }}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DS.colors.border.light}`, background: DS.colors.gray[50], flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: DS.font.size.xl, fontWeight: DS.font.weight.semibold, color: DS.colors.gray[900], margin: 0 }}>Register New Client</h2>
                <p style={{ fontSize: DS.font.size.sm, color: DS.colors.gray[600], marginTop: DS.space[1], marginBottom: 0 }}>
                  Required fields marked <span style={{ color: DS.colors.danger.DEFAULT }}>*</span>
                </p>
              </div>
              <button
                onClick={() => { setNewClientMode(false); setErrors({}); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: DS.colors.gray[500], lineHeight: 1, padding: 4 }}
              >×</button>
            </div>

            {/* Section Tabs */}
            <div className="modal-tabs" style={{ flexShrink: 0 }}>
              {CLIENT_SECTIONS.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSection(idx)}
                  style={{
                    padding: `${DS.space[2]} ${DS.space[3]}`,
                    background: activeSection === idx ? DS.colors.primary.surface : "transparent",
                    border: "none", borderRadius: DS.radius.md, cursor: "pointer",
                    fontSize: DS.font.size.sm, fontWeight: DS.font.weight.medium,
                    color: activeSection === idx ? DS.colors.primary.DEFAULT : DS.colors.gray[600],
                    transition: "all 0.15s ease", fontFamily: "inherit", marginBottom: DS.space[2],
                  }}
                >
                  {idx + 1}. {sec.section}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="modal-inner-pad" style={{ padding: 24, overflowY: "auto", flex: 1 }}>
              <div className="grid-modal-2col">
                {CLIENT_SECTIONS[activeSection].fields.map(field => (
                  <div key={field.key} style={{ marginBottom: DS.space[4], gridColumn: field.type === "textarea" ? "1 / -1" : undefined }}>
                    <Label label={field.label} required={field.required} helpText={field.helpText} />
                    {field.type === "textarea" ? (
                      <textarea
                        value={newClient[field.key] || ""}
                        onChange={e => setNewClient(c => ({ ...c, [field.key]: e.target.value }))}
                        rows={field.rows || 2}
                        placeholder={field.placeholder}
                        style={{ ...inputBase(errors[field.key]), resize: "vertical" }}
                        {...focusHandlers(errors[field.key] ? DS.colors.danger.DEFAULT : null)}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={newClient[field.key] || ""}
                        onChange={e => setNewClient(c => ({ ...c, [field.key]: e.target.value }))}
                        style={{ ...inputBase(errors[field.key]), cursor: "pointer", background: "white" }}
                        {...focusHandlers(errors[field.key] ? DS.colors.danger.DEFAULT : null)}
                      >
                        <option value="">— Select {field.label} —</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={newClient[field.key] || ""}
                        onChange={e => setNewClient(c => ({ ...c, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={inputBase(errors[field.key])}
                        {...focusHandlers(errors[field.key] ? DS.colors.danger.DEFAULT : null)}
                      />
                    )}
                    <FieldError msg={errors[field.key]} />
                  </div>
                ))}
              </div>

              {/* Prev / Next */}
              <div className="modal-nav">
                <Button variant="secondary" size="sm" disabled={activeSection === 0} onClick={() => setActiveSection(s => s - 1)}>← Prev</Button>
                <span style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500], alignSelf: "center" }}>
                  {activeSection + 1} / {CLIENT_SECTIONS.length}
                </span>
                <Button variant="secondary" size="sm" disabled={activeSection === CLIENT_SECTIONS.length - 1} onClick={() => setActiveSection(s => s + 1)}>Next →</Button>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{ padding: "16px 24px", borderTop: `1px solid ${DS.colors.border.light}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: DS.colors.gray[50], flexShrink: 0, flexWrap: "wrap", gap: 12 }}
            >
              <div style={{ fontSize: DS.font.size.xs, color: DS.colors.gray[500] }}>
                Collection: <code style={{ background: DS.colors.gray[200], padding: "1px 5px", borderRadius: 3 }}>clients</code>
              </div>
              <div style={{ display: "flex", gap: DS.space[3], flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => { setNewClientMode(false); setErrors({}); }}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveClient} loading={savingClient}>
                  {savingClient ? "Saving…" : "Register Client"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}