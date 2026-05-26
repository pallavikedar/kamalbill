// pages/ClientsPage.jsx
// ─── Banquet Hall Client Management — Appwrite Backend ───────────────────────

import { useState, useMemo, useCallback, useEffect } from "react";
import { Client, Databases, ID, Query } from "appwrite";
import APPWRITE_CONFIG from "../lib/Appwriteconfig";    // ← no space

// ============================================================================
// INJECT GLOBAL RESPONSIVE STYLES
// ============================================================================

const _style = document.createElement("style");
_style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }

  /* ── Page layout ── */
  .cp-page   { padding: 32px; }
  .cp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 12px; flex-wrap: wrap; }
  .cp-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  /* ── Stat cards ── */
  .cp-stats  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }

  /* ── Controls bar ── */
  .cp-controls { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
  .cp-search   { flex: 1; min-width: 180px; position: relative; }

  /* ── Client card inner row ── */
  .cp-card-row  { display: flex; align-items: center; gap: 20px; padding: 20px; }
  .cp-card-info { flex: 1; min-width: 0; }
  .cp-card-meta { display: flex; gap: 24px; flex-wrap: wrap; font-size: 12px; }
  .cp-card-metrics { text-align: right; min-width: 160px; flex-shrink: 0; }
  .cp-card-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

  /* ── Expanded detail panel ── */
  .cp-expanded { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

  /* ── Modal tabs ── */
  .cp-modal-tabs { display: flex; gap: 4px; flex-wrap: wrap; padding: 16px 24px 0; border-bottom: 1px solid #E9ECEF; }
  .cp-modal-form { padding: 24px; }
  .cp-modal-footer {
    padding: 16px 24px; border-top: 1px solid #E9ECEF;
    display: flex; justify-content: space-between; align-items: center;
    background: #F8F9FA; flex-wrap: wrap; gap: 12px;
  }
  .cp-modal-footer-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  /* ────────────────────────────────────────────────
     TABLET  ≤ 900px
  ──────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .cp-page  { padding: 20px; }
    .cp-stats { grid-template-columns: repeat(2, 1fr); }
    .cp-expanded { grid-template-columns: repeat(2, 1fr); }
    .cp-card-metrics { min-width: 120px; }
  }

  /* ────────────────────────────────────────────────
     MOBILE  ≤ 640px
  ──────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .cp-page  { padding: 12px; }
    .cp-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }

    /* Header stacks */
    .cp-header { flex-direction: column; margin-bottom: 20px; }
    .cp-header h1 { font-size: 20px !important; }
    .cp-header-actions { width: 100%; }
    .cp-header-actions button { flex: 1; justify-content: center; }

    /* Controls stack */
    .cp-controls { flex-direction: column; align-items: stretch; }
    .cp-search   { min-width: 0; }
    .cp-controls select { width: 100%; }

    /* Card row goes column */
    .cp-card-row { flex-direction: column; align-items: flex-start; gap: 12px; padding: 14px; }
    .cp-avatar-name { display: flex; align-items: center; gap: 12px; width: 100%; }
    .cp-card-info { width: 100%; }
    .cp-card-metrics { text-align: left; min-width: 0; width: 100%; }
    .cp-card-actions { justify-content: flex-start; }

    /* Expanded panel: single column on mobile */
    .cp-expanded { grid-template-columns: 1fr; }

    /* Modal tabs: scrollable row */
    .cp-modal-tabs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 0; gap: 2px; }
    .cp-modal-tabs button { flex-shrink: 0; font-size: 11px !important; padding: 6px 10px !important; }
    .cp-modal-form { padding: 14px; }
    .cp-modal-footer { flex-direction: column; align-items: stretch; }
    .cp-modal-footer-actions { flex-direction: column-reverse; }
    .cp-modal-footer-actions button { width: 100%; justify-content: center; }
    .cp-modal-footer > span { text-align: center; }
  }

  @media (max-width: 380px) {
    .cp-stats { grid-template-columns: 1fr; }
  }
`;
document.head.appendChild(_style);

// ============================================================================
// APPWRITE SERVICE
// ============================================================================

const _client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const _db = new Databases(_client);
const { databaseId: DB, collectionId: COL } = APPWRITE_CONFIG;

const INT_FIELDS = ["expectedGuests", "advanceAmount", "creditLimit"];

function _toDoc(data) {
  const SYS = ["id", "$id", "$collectionId", "$databaseId", "$createdAt", "$updatedAt", "$permissions"];
  const cleaned = Object.fromEntries(Object.entries(data).filter(([k]) => !SYS.includes(k)));
  INT_FIELDS.forEach(key => {
    const val = cleaned[key];
    if (val === "" || val === null || val === undefined) { cleaned[key] = null; }
    else { const p = parseInt(val, 10); cleaned[key] = isNaN(p) ? null : p; }
  });
  return cleaned;
}

function _fromDoc(doc) { return { ...doc, id: doc.$id }; }

const clientService = {
  async list() {
    const res = await _db.listDocuments(DB, COL, [Query.limit(1000), Query.orderDesc("$createdAt")]);
    return res.documents.map(_fromDoc);
  },
  async create(data) {
    const doc = await _db.createDocument(DB, COL, ID.unique(), _toDoc({ ...data, createdAt: new Date().toISOString() }));
    return _fromDoc(doc);
  },
  async update(id, data) {
    const doc = await _db.updateDocument(DB, COL, id, _toDoc({ ...data, updatedAt: new Date().toISOString() }));
    return _fromDoc(doc);
  },
  async remove(id) { await _db.deleteDocument(DB, COL, id); return id; },
};

// ============================================================================
// UTILS
// ============================================================================
const calcBill = (items = []) => ({ total: items.reduce((s, i) => s + (i.amount || 0), 0) });
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const DS = {
  colors: {
    primary: { DEFAULT: "#0A5C8E", surface: "#F0F7FC" },
    gray: { 50: "#F8F9FA", 100: "#F1F3F5", 500: "#ADB5BD", 600: "#6C757D", 700: "#495057", 800: "#343A40", 900: "#212529" },
    success: { DEFAULT: "#27AE60" },
    warning: { DEFAULT: "#F39C12" },
    danger:  { DEFAULT: "#E74C3C", bg: "#FDEDEC" },
    border:  { light: "#E9ECEF", DEFAULT: "#DEE2E6" },
  },
  radius: { sm: "4px", md: "6px", lg: "8px", xl: "12px" },
  shadow: { xl: "0 10px 15px rgba(0,0,0,.07), 0 4px 6px rgba(0,0,0,.05)" },
  sp: ["0px","4px","8px","12px","16px","20px","24px","28px","32px","40px","48px"],
  font: "'IBM Plex Sans', system-ui, sans-serif",
};

// ============================================================================
// FIELD SCHEMA
// ============================================================================
const CLIENT_SECTIONS = [
  {
    id: "organization", title: "Client Details", icon: "🏢",
    fields: [
      { key: "companyName", label: "Client / Organization Name", type: "text",   required: true, placeholder: "Sharma Family / ABC Enterprises" },
      { key: "clientType",  label: "Client Type",                type: "select", options: ["Individual","Corporate","NGO / Trust","Government","Other"] },
      { key: "referredBy",  label: "Referred By",                type: "text",   placeholder: "Name of referrer or source" },
      { key: "website",     label: "Website / Social Page",      type: "url",    placeholder: "https://instagram.com/example" },
    ],
  },
  {
    id: "contact", title: "Contact", icon: "👤",
    fields: [
      { key: "contactPerson", label: "Contact Person",    type: "text",  required: true, placeholder: "Full name" },
      { key: "relation",      label: "Relation to Event", type: "text",  placeholder: "Groom's Father / Event Manager" },
      { key: "email",         label: "Email Address",     type: "email", required: true, placeholder: "sharma@example.com" },
      { key: "phone",         label: "Primary Mobile",    type: "tel",   required: true, placeholder: "+91 98765 43210" },
      { key: "altPhone",      label: "Alternate Contact", type: "tel",   placeholder: "+91 91234 56789" },
      { key: "whatsapp",      label: "WhatsApp Number",   type: "tel",   placeholder: "If different from primary" },
    ],
  },
  {
    id: "event", title: "Event", icon: "🎉",
    fields: [
      { key: "eventType",      label: "Type of Event",        type: "select", options: ["Wedding","Reception","Engagement","Birthday Party","Anniversary","Corporate Event","Conference / Seminar","Baby Shower","Naming Ceremony","Farewell / Retirement","Other"] },
      { key: "preferredDates", label: "Preferred Date(s)",    type: "text",   placeholder: "e.g. 15 Dec 2025, flexible ±2 days" },
      { key: "eventDuration",  label: "Duration",             type: "select", options: ["Half Day (4 hrs)","Full Day (8 hrs)","Full Day + Evening","Multi-Day"] },
      { key: "expectedGuests", label: "Expected Guest Count", type: "number", placeholder: "300" },
      { key: "seatingStyle",   label: "Seating Arrangement",  type: "select", options: ["Banquet (Round Tables)","Theatre Style","Classroom","Cocktail / Standing","U-Shape","Custom"] },
      { key: "hallPreference", label: "Hall / Venue Preference", type: "select", options: ["Main Banquet Hall","Garden / Lawn","Rooftop","Private Dining Room","Full Venue Buyout","No Preference"] },
    ],
  },
  {
    id: "services", title: "Services", icon: "🍽️",
    fields: [
      { key: "cateringType",       label: "Catering Preference",  type: "select",   options: ["In-House Full Catering","In-House Veg Only","Client's Own Caterer","Hybrid"] },
      { key: "mealPlan",           label: "Meal Plan",            type: "select",   options: ["Breakfast Only","Lunch Only","Dinner Only","Lunch + Dinner","All Meals","Cocktail Snacks Only"] },
      { key: "cuisineType",        label: "Cuisine Preference",   type: "text",     placeholder: "Punjabi, South Indian, Continental…" },
      { key: "barRequired",        label: "Bar / Beverages",      type: "select",   options: ["No Bar","Soft Beverages Only","Client Arranges Own Bar","In-House Bar Required"] },
      { key: "decorPackage",       label: "Decoration Package",   type: "select",   options: ["Basic (Floral)","Standard","Premium","Luxury / Custom","Client's Own Decorator"] },
      { key: "additionalServices", label: "Additional Services",  type: "textarea", rows: 2, placeholder: "DJ, Live Music, Photographer, Valet Parking, Guest Rooms…" },
    ],
  },
  {
    id: "address", title: "Address", icon: "📍",
    fields: [
      { key: "billingAddress", label: "Billing Address", type: "textarea", rows: 2, placeholder: "Flat / House No., Street, Landmark" },
      { key: "city",           label: "City",            type: "text",     placeholder: "Akola" },
      { key: "state",          label: "State",           type: "text",     placeholder: "Maharashtra" },
      { key: "pincode",        label: "Postal Code",     type: "text",     placeholder: "444001" },
      { key: "country",        label: "Country",         type: "text",     placeholder: "India", defaultValue: "India" },
    ],
  },
  {
    id: "tax", title: "Tax", icon: "📊",
    fields: [
      { key: "gstin",         label: "GSTIN (if Corporate)", type: "text",   placeholder: "22AAAAA0000A1Z5", helpText: "15-char, leave blank for individuals" },
      { key: "pan",           label: "PAN",                  type: "text",   placeholder: "AAAAA1234A" },
      { key: "gstTreatment",  label: "GST Classification",   type: "select", options: ["Regular Taxpayer","Composition Scheme","Unregistered / Individual","SEZ"] },
      { key: "placeOfSupply", label: "Place of Supply",      type: "text",   placeholder: "Maharashtra" },
    ],
  },
  {
    id: "banking", title: "Payment", icon: "🏦",
    fields: [
      { key: "paymentTerms",  label: "Payment Terms",              type: "select",   options: ["100% Advance","50% Advance + Balance on Day","30% Booking + 70% Before Event","Net 7 After Event","Custom"] },
      { key: "advanceAmount", label: "Advance / Token Amount (₹)", type: "number",   placeholder: "25000" },
      { key: "creditLimit",   label: "Credit Limit (₹)",           type: "number",   placeholder: "0" },
      { key: "bankName",      label: "Bank Name",                  type: "text",     placeholder: "State Bank of India" },
      { key: "ifscCode",      label: "IFSC Code",                  type: "text",     placeholder: "SBIN0012345" },
      { key: "specialNotes",  label: "Special Notes / Requests",   type: "textarea", rows: 2, placeholder: "Any special requirements, allergies, VIP guests, religious restrictions…" },
    ],
  },
];

const BLANK_FORM = {};
CLIENT_SECTIONS.forEach(s => s.fields.forEach(f => { BLANK_FORM[f.key] = f.defaultValue || ""; }));

function pickFormFields(client) {
  const out = {};
  CLIENT_SECTIONS.forEach(s => s.fields.forEach(f => { out[f.key] = client[f.key] ?? f.defaultValue ?? ""; }));
  return out;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function StatCard({ label, value, icon }) {
  return (
    <div style={{ background: "white", borderRadius: DS.radius.lg, padding: DS.sp[5], border: `1px solid ${DS.colors.border.light}` }}>
      <div style={{ fontSize: 22, marginBottom: DS.sp[2] }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: DS.colors.gray[800], marginBottom: DS.sp[1], wordBreak: "break-word" }}>{value}</div>
      <div style={{ fontSize: 11, color: DS.colors.gray[600] }}>{label}</div>
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, size = "md", disabled = false, style: extStyle }) {
  const bg    = { primary: DS.colors.primary.DEFAULT, secondary: "white", danger: "white" }[variant];
  const color = { primary: "white", secondary: DS.colors.gray[700], danger: DS.colors.danger.DEFAULT }[variant];
  const bdr   = { primary: "none", secondary: `1px solid ${DS.colors.border.DEFAULT}`, danger: `1px solid ${DS.colors.danger.DEFAULT}` }[variant];
  const pad   = { sm: "4px 10px", md: "8px 14px", lg: "10px 22px" }[size];
  const fs    = { sm: 11, md: 12, lg: 14 }[size];
  return (
    <button
      disabled={disabled} onClick={onClick}
      style={{ padding: pad, fontSize: fs, fontWeight: 500, fontFamily: DS.font, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, background: bg, color, border: bdr, borderRadius: DS.radius.md, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: DS.sp[2], transition: "all .15s", whiteSpace: "nowrap", ...extStyle }}
    >
      {children}
    </button>
  );
}

function FormField({ field, value, onChange }) {
  const base = { width: "100%", padding: DS.sp[2], border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: 13, fontFamily: DS.font, outline: "none", background: "white", boxSizing: "border-box" };
  if (field.type === "textarea") return <textarea value={value} onChange={onChange} rows={field.rows} placeholder={field.placeholder} style={{ ...base, resize: "vertical" }} />;
  if (field.type === "select")   return <select value={value} onChange={onChange} style={base}><option value="">— Select —</option>{field.options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
  return <input type={field.type} value={value} onChange={onChange} placeholder={field.placeholder} style={base} />;
}

// ============================================================================
// ANALYTICS HOOK
// ============================================================================
function useClientAnalytics(clients, bills) {
  return useMemo(() => {
    const map = {};
    clients.forEach(c => {
      const cb = bills.filter(b => b.clientId === c.id);
      const rev = cb.reduce((s, b) => s + calcBill(b.items).total, 0);
      const paid = cb.reduce((s, b) => s + (b.paidAmount || 0), 0);
      // FIXED: Changed 'isPaid' to check status or use balanceDue
      const overdue = cb.filter(b => {
        const isOverdue = b.dueDate && new Date(b.dueDate) < new Date() && b.status !== "paid";
        const balanceDue = b.balanceDue || (calcBill(b.items).total - (b.paidAmount || 0));
        return isOverdue && balanceDue > 0;
      }).reduce((s, b) => s + (b.balanceDue || (calcBill(b.items).total - (b.paidAmount || 0))), 0);
      map[c.id] = { totalBills: cb.length, totalRevenue: rev, paidAmount: paid, outstanding: rev - paid, overdue, paymentRate: rev ? (paid / rev) * 100 : 0 };
    });
    return map;
  }, [clients, bills]);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ClientsPage({ bills = [] }) {
  const [clients,        setClients]       = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [saving,         setSaving]        = useState(false);
  const [error,          setError]         = useState(null);
  const [showForm,       setShowForm]      = useState(false);
  const [form,           setForm]          = useState(BLANK_FORM);
  const [editingClient,  setEditingClient] = useState(null);
  const [activeSection,  setActiveSection] = useState(0);
  const [searchTerm,     setSearchTerm]    = useState("");
  const [filterBy,       setFilterBy]      = useState("all");
  const [sortBy,         setSortBy]        = useState("revenue");
  const [expanded,       setExpanded]      = useState(null);

  const analytics = useClientAnalytics(clients, bills);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setClients(await clientService.list()); }
    catch (err) { setError(`Failed to load: ${err.message}`); }
    finally { setLoading(false); }
  }, []); // FIXED: Added dependency array

  useEffect(() => { load(); }, [load]);

  const handleCreate = useCallback(async (data) => {
    setSaving(true);
    try { const c = await clientService.create(data); setClients(p => [c, ...p]); return true; }
    catch (err) { alert(`Save failed: ${err.message}`); return false; }
    finally { setSaving(false); }
  }, []); // FIXED: Added dependency array

  const handleUpdate = useCallback(async (id, data) => {
    setSaving(true);
    try { const u = await clientService.update(id, data); setClients(p => p.map(c => c.id === id ? u : c)); return true; }
    catch (err) { alert(`Update failed: ${err.message}`); return false; }
    finally { setSaving(false); }
  }, []); // FIXED: Added dependency array

  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`Remove "${name}"? This is irreversible.`)) return;
    try { await clientService.remove(id); setClients(p => p.filter(c => c.id !== id)); }
    catch (err) { alert(`Delete failed: ${err.message}`); }
  }, []); // FIXED: Added dependency array

  const handleSave = useCallback(async () => {
    if (!form.companyName?.trim() || !form.email?.trim() || !form.phone?.trim()) {
      alert("Company name, email and phone are required."); return;
    }
    const ok = editingClient ? await handleUpdate(editingClient.id, form) : await handleCreate(form);
    if (ok) { setForm(BLANK_FORM); setEditingClient(null); setShowForm(false); setActiveSection(0); }
  }, [form, editingClient, handleUpdate, handleCreate]); // FIXED: Already had correct dependencies

  const handleEdit = useCallback((client) => {
    setEditingClient(client); setForm(pickFormFields(client)); setShowForm(true); setActiveSection(0);
  }, []); // FIXED: Added dependency array

  const handleCancel = useCallback(() => {
    setShowForm(false); setEditingClient(null); setForm(BLANK_FORM); setActiveSection(0);
  }, []); // FIXED: Added dependency array

  const sortedClients = useMemo(() => {
    let list = clients.filter(c =>
      [c.companyName, c.email, c.contactPerson, c.gstin, c.phone]
        .some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filterBy === "active")    list = list.filter(c => analytics[c.id]?.totalBills > 0);
    if (filterBy === "inactive")  list = list.filter(c => analytics[c.id]?.totalBills === 0);
    if (filterBy === "overdue")   list = list.filter(c => analytics[c.id]?.overdue > 0);
    if (filterBy === "highValue") list = list.filter(c => analytics[c.id]?.totalRevenue > 100000);
    return [...list].sort((a, b) => {
      const [da, db] = [analytics[a.id] || {}, analytics[b.id] || {}];
      if (sortBy === "revenue")     return (db.totalRevenue || 0) - (da.totalRevenue || 0);
      if (sortBy === "name")        return a.companyName.localeCompare(b.companyName);
      if (sortBy === "outstanding") return (db.outstanding || 0) - (da.outstanding || 0);
      if (sortBy === "recent")      return new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0);
      return new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0);
    });
  }, [clients, searchTerm, filterBy, sortBy, analytics]);

  const stats = useMemo(() => ({
    total:            clients.length,
    active:           clients.filter(c => analytics[c.id]?.totalBills > 0).length,
    totalRevenue:     clients.reduce((s, c) => s + (analytics[c.id]?.totalRevenue || 0), 0),
    totalOutstanding: clients.reduce((s, c) => s + (analytics[c.id]?.outstanding  || 0), 0),
  }), [clients, analytics]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div style={{ fontFamily: DS.font, background: DS.colors.gray[50], minHeight: "100vh" }}>
      <div className="cp-page" style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="cp-header">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: DS.colors.gray[900], letterSpacing: "-0.02em", marginBottom: DS.sp[1], margin: 0 }}>
              Client Directory
            </h1>
            <p style={{ fontSize: 14, color: DS.colors.gray[600], marginTop: 4, marginBottom: 0 }}>
              Manage banquet hall clients — persisted in Appwrite
            </p>
          </div>
          <div className="cp-header-actions">
            <Btn variant="secondary" onClick={load} disabled={loading}>↻ Refresh</Btn>
            <Btn variant="primary"   onClick={() => setShowForm(v => !v)}>
              {showForm ? "✕ Cancel" : "+ Register Client"}
            </Btn>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{ background: DS.colors.danger.bg, border: `1px solid ${DS.colors.danger.DEFAULT}`, borderRadius: DS.radius.md, padding: `${DS.sp[3]} ${DS.sp[4]}`, marginBottom: DS.sp[6], color: DS.colors.danger.DEFAULT, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="cp-stats">
          <StatCard label="Total Clients"           value={stats.total}                 icon="🏢" />
          <StatCard label="Active Engagements"      value={stats.active}                icon="✓"  />
          <StatCard label="Lifetime Revenue"        value={fmt(stats.totalRevenue)}     icon="₹"  />
          <StatCard label="Outstanding Receivables" value={fmt(stats.totalOutstanding)} icon="📋" />
        </div>

        {/* ── Controls ── */}
        <div style={{ background: "white", borderRadius: DS.radius.lg, border: `1px solid ${DS.colors.border.light}`, padding: DS.sp[4], marginBottom: DS.sp[6] }}>
          <div className="cp-controls">
            <div className="cp-search">
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: DS.colors.gray[500], pointerEvents: "none", fontSize: 14 }}>🔍</span>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by company, contact, email, GSTIN…"
                style={{ width: "100%", padding: "8px 8px 8px 32px", border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: 13, fontFamily: DS.font, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {[
              { val: filterBy, set: setFilterBy, opts: [["all","All Clients"],["active","Active Only"],["inactive","Inactive"],["overdue","Overdue"],["highValue","High Value ₹1L+"]] },
              { val: sortBy,   set: setSortBy,   opts: [["revenue","By Revenue ↓"],["name","By Name A→Z"],["recent","By Recent"],["outstanding","By Outstanding ↓"]] },
            ].map(({ val, set, opts }, i) => (
              <select key={i} value={val} onChange={e => set(e.target.value)}
                style={{ padding: "8px 10px", border: `1px solid ${DS.colors.border.DEFAULT}`, borderRadius: DS.radius.md, fontSize: 12, background: "white", cursor: "pointer", outline: "none" }}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
          </div>
        </div>

        {/* ── Client List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: DS.sp[10], color: DS.colors.gray[500] }}>Loading from Appwrite…</div>
        ) : sortedClients.length === 0 ? (
          <div style={{ background: "white", borderRadius: DS.radius.lg, border: `1px solid ${DS.colors.border.light}`, padding: DS.sp[10], textAlign: "center" }}>
            <div style={{ fontSize: 40, opacity: 0.4, marginBottom: DS.sp[4] }}>📋</div>
            <p style={{ color: DS.colors.gray[600] }}>
              {searchTerm ? "No results — try different terms." : "No clients yet. Register your first one!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: DS.sp[4] }}>
            {sortedClients.map(client => {
              const data   = analytics[client.id] || {};
              const isOpen = expanded === client.id;

              return (
                <div key={client.id} style={{ background: "white", borderRadius: DS.radius.lg, border: `1px solid ${DS.colors.border.light}` }}>

                  {/* Card Row */}
                  <div className="cp-card-row">

                    {/* On mobile, avatar + name are side-by-side in a wrapper div */}
                    <div className="cp-avatar-name">
                      <div style={{ width: 44, height: 44, borderRadius: DS.radius.md, background: DS.colors.primary.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: DS.colors.primary.DEFAULT, flexShrink: 0 }}>
                        {(client.companyName || client.contactPerson || "C")[0].toUpperCase()}
                      </div>

                      {/* Info block */}
                      <div className="cp-card-info">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: DS.colors.gray[900], margin: 0 }}>
                            {client.companyName}
                          </h3>
                          {client.eventType && (
                            <span style={{ fontSize: 11, padding: "2px 7px", background: DS.colors.primary.surface, color: DS.colors.primary.DEFAULT, borderRadius: DS.radius.sm }}>
                              {client.eventType}
                            </span>
                          )}
                          {client.gstin && (
                            <span style={{ fontSize: 11, padding: "2px 7px", background: DS.colors.gray[100], color: DS.colors.gray[600], borderRadius: DS.radius.sm, fontFamily: "monospace" }}>
                              GST: {client.gstin}
                            </span>
                          )}
                        </div>
                        <div className="cp-card-meta" style={{ color: DS.colors.gray[600] }}>
                          {client.contactPerson  && <span>👤 {client.contactPerson}{client.relation ? ` (${client.relation})` : ""}</span>}
                          {client.email          && <span style={{ color: DS.colors.primary.DEFAULT }}>📧 {client.email}</span>}
                          {client.phone          && <span>📞 {client.phone}</span>}
                          {client.city           && <span>📍 {client.city}{client.state ? `, ${client.state}` : ""}</span>}
                          {client.expectedGuests && <span>👥 {client.expectedGuests} guests</span>}
                        </div>
                      </div>
                    </div>

                    {/* Metrics + Actions */}
                    <div className="cp-card-metrics">
                      <div style={{ fontSize: 17, fontWeight: 600, color: DS.colors.success.DEFAULT }}>
                        {fmt(data.totalRevenue || 0)}
                      </div>
                      <div style={{ fontSize: 11, color: DS.colors.gray[500], marginBottom: 6 }}>Lifetime Revenue</div>
                      {data.outstanding > 0 && (
                        <div style={{ fontSize: 12, fontWeight: 500, color: DS.colors.warning.DEFAULT, marginBottom: 6 }}>
                          {fmt(data.outstanding)} due
                        </div>
                      )}
                      <div className="cp-card-actions">
                        <Btn variant="secondary" size="sm" onClick={() => handleEdit(client)}>✏ Edit</Btn>
                        <Btn variant="danger"    size="sm" onClick={() => handleDelete(client.id, client.companyName)}>🗑 Remove</Btn>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="cp-expanded" style={{ borderTop: `1px solid ${DS.colors.border.light}`, padding: DS.sp[5], background: DS.colors.gray[50] }}>
                      {[
                        {
                          title: "Event Details",
                          rows: [
                            ["Event Type", client.eventType], ["Date(s)", client.preferredDates],
                            ["Duration", client.eventDuration], ["Guests", client.expectedGuests],
                            ["Hall", client.hallPreference], ["Seating", client.seatingStyle],
                          ],
                        },
                        {
                          title: "Services",
                          rows: [
                            ["Catering", client.cateringType], ["Meal Plan", client.mealPlan],
                            ["Cuisine", client.cuisineType], ["Bar", client.barRequired],
                            ["Décor", client.decorPackage], ["Extras", client.additionalServices],
                          ],
                        },
                        {
                          title: "Account Summary",
                          rows: [
                            ["Total Bills", data.totalBills || 0], ["Payment Rate", `${(data.paymentRate || 0).toFixed(1)}%`],
                            ["Outstanding", fmt(data.outstanding || 0)], ["Payment Terms", client.paymentTerms],
                            ["Advance Paid", client.advanceAmount ? fmt(client.advanceAmount) : null],
                            ["Special Notes", client.specialNotes],
                          ].filter(row => row[1] !== null),
                        },
                      ].map(panel => (
                        <div key={panel.title}>
                          <h4 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", color: DS.colors.gray[500], marginBottom: DS.sp[3], marginTop: 0 }}>
                            {panel.title}
                          </h4>
                          <dl style={{ fontSize: 13, lineHeight: 1.9, margin: 0 }}>
                            {panel.rows.filter(([, v]) => v).map(([k, v]) => (
                              <div key={k}>
                                <dt style={{ color: DS.colors.gray[600] }}>{k}</dt>
                                <dd style={{ margin: "0 0 4px", color: DS.colors.gray[800] }}>{v}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Toggle */}
                  <div style={{ borderTop: `1px solid ${DS.colors.border.light}`, padding: `${DS.sp[2]} ${DS.sp[5]}`, background: DS.colors.gray[50], textAlign: "center" }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : client.id)}
                      style={{ background: "none", border: "none", fontSize: 11, color: DS.colors.gray[500], cursor: "pointer" }}
                    >
                      {isOpen ? "▲ Hide details" : "▼ View details"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================================
          MODAL FORM — Responsive
      ============================================================================ */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
          onClick={handleCancel}
        >
          <div
            style={{ background: "white", borderRadius: DS.radius.xl, maxWidth: 900, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: DS.shadow.xl, display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${DS.colors.border.light}`, background: DS.colors.gray[50], flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: DS.colors.gray[900], margin: 0 }}>
                  {editingClient ? "✏ Edit Client Record" : "➕ Register New Client"}
                </h2>
                <p style={{ fontSize: 12, color: DS.colors.gray[600], margin: `4px 0 0` }}>
                  Fields marked <span style={{ color: DS.colors.danger.DEFAULT }}>*</span> are required
                </p>
              </div>
              <button
                onClick={handleCancel}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: DS.colors.gray[500], lineHeight: 1, padding: 4, flexShrink: 0 }}
              >×</button>
            </div>

            {/* Section Tabs — scrollable row on mobile */}
            <div className="cp-modal-tabs" style={{ flexShrink: 0 }}>
              {CLIENT_SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(i)}
                  style={{
                    padding: `${DS.sp[2]} ${DS.sp[3]}`,
                    background: i === activeSection ? DS.colors.primary.surface : "transparent",
                    border: "none",
                    borderBottom: i === activeSection ? `2px solid ${DS.colors.primary.DEFAULT}` : "2px solid transparent",
                    borderRadius: `${DS.radius.md} ${DS.radius.md} 0 0`,
                    marginBottom: -1, cursor: "pointer", fontSize: 12, fontWeight: 500,
                    color: i === activeSection ? DS.colors.primary.DEFAULT : DS.colors.gray[600],
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.icon} {s.title}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="cp-modal-form" style={{ flex: 1, overflowY: "auto" }}>
              {CLIENT_SECTIONS[activeSection].fields.map(field => (
                <div key={field.key} style={{ marginBottom: DS.sp[4] }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: DS.colors.gray[700], marginBottom: DS.sp[1] }}>
                    {field.label}
                    {field.required && <span style={{ color: DS.colors.danger.DEFAULT, marginLeft: 4 }}>*</span>}
                    {field.helpText && <span style={{ color: DS.colors.gray[500], fontSize: 11, marginLeft: 8 }}>({field.helpText})</span>}
                  </label>
                  <FormField
                    field={field}
                    value={form[field.key] || ""}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="cp-modal-footer" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: DS.colors.gray[500] }}>
                Tab {activeSection + 1} of {CLIENT_SECTIONS.length} — {CLIENT_SECTIONS[activeSection].title}
              </span>
              <div className="cp-modal-footer-actions">
                {activeSection > 0 && (
                  <Btn variant="secondary" onClick={() => setActiveSection(i => i - 1)}>← Previous</Btn>
                )}
                {activeSection < CLIENT_SECTIONS.length - 1 && (
                  <Btn variant="secondary" onClick={() => setActiveSection(i => i + 1)}>Next →</Btn>
                )}
                <Btn variant="secondary" onClick={handleCancel}>Cancel</Btn>
                <Btn variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : editingClient ? "✔ Update Client" : "✔ Register Client"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}