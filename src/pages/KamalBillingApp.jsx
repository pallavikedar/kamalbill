import { useState, useMemo } from "react";

const CGST = 0.09;
const SGST = 0.09;

const COMPANY = {
  name: "Kamal Celebrations",
  tagline: "Celebrate with Elegance",
  address: "Plot No. 4, Rajeshwar Nagar, Besa-Pipla Road, Nagpur - 440034",
  email: "Kamalcelebrationsgroup@gmail.com",
  phone: "9209841329",
  gstin: "27AENPD8180P1ZR",
  bank: {
    name: "Kamal Celebrations",
    account: "41309369916",
    bankName: "State Bank Of India",
    ifsc: "SBIN006153",
  },
};

const SEED_CLIENTS = [
  { id: "c1", name: "Enviro Health", address: "111 Old Dhyneshwar Nagar, Manewada Road, Nagpur - 440027", gstin: "27BALPN9242B1ZM", phone: "" },
  { id: "c2", name: "Raj Enterprises", address: "45 Sitabuldi Main Road, Nagpur - 440012", gstin: "27AABCR1234D1ZP", phone: "" },
];

const SEED_BILLS = [
  { id: "b1", invoiceNo: "A090", date: "2025-05-14", clientId: "c1", items: [{ id: 1, desc: "Chetan Shingare Wedding", qty: 100, rate: 1000 }], status: "paid" },
  { id: "b2", invoiceNo: "A091", date: "2025-05-20", clientId: "c2", items: [{ id: 1, desc: "Corporate Event Decoration", qty: 1, rate: 50000 }], status: "pending" },
  { id: "b3", invoiceNo: "A092", date: "2025-04-10", clientId: "c1", items: [{ id: 1, desc: "Birthday Celebration", qty: 50, rate: 800 }], status: "paid" },
  { id: "b4", invoiceNo: "A093", date: "2025-03-22", clientId: "c2", items: [{ id: 1, desc: "Anniversary Dinner Setup", qty: 1, rate: 35000 }], status: "paid" },
];

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
};

function calcBill(items) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const cgst = subtotal * CGST;
  const sgst = subtotal * SGST;
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst };
}

const TABS = ["Dashboard", "Bills", "Clients", "Reports", "New Bill"];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, position: "relative" }}>
        <svg viewBox="0 0 38 38" width="38" height="38">
          <polygon points="19,2 28,14 19,10" fill="#E84393" />
          <polygon points="19,2 10,14 19,10" fill="#FF6B35" />
          <polygon points="10,14 19,10 19,26" fill="#00B4D8" />
          <polygon points="28,14 19,10 19,26" fill="#7B2FBE" />
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: 0.5 }}>Kamal Celebrations</div>
        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", letterSpacing: 1.5, textTransform: "uppercase" }}>Billing System</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const colors = { teal: "#0F6E56", coral: "#993C1D", purple: "#534AB7", amber: "#854F0B" };
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: colors[color] || "var(--color-text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    paid: { bg: "#EAF3DE", color: "#3B6D11", label: "Paid" },
    pending: { bg: "#FAEEDA", color: "#854F0B", label: "Pending" },
    overdue: { bg: "#FCEBEB", color: "#A32D2D", label: "Overdue" },
  };
  const s = map[status] || map.pending;
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500 }}>{s.label}</span>;
}

function MiniBar({ data, maxVal }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: "#00B4D8", borderRadius: "3px 3px 0 0", height: maxVal ? Math.max(4, (d.val / maxVal) * 52) : 4, opacity: 0.85 }} />
          <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function PrintBill({ bill, client, onClose }) {
  const calc = calcBill(bill.items);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: "32px 36px", color: "#222" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <Logo />
            <div style={{ fontSize: 12, color: "#666", marginTop: 8, lineHeight: 1.6 }}>
              {COMPANY.address}<br />
              {COMPANY.email}<br />
              Mob: {COMPANY.phone}<br />
              GSTIN: {COMPANY.gstin}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#00B4D8", letterSpacing: 0.5 }}>TAX INVOICE</div>
            <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>Invoice No: <strong>{bill.invoiceNo}</strong></div>
            <div style={{ fontSize: 13, color: "#444" }}>Date: <strong>{new Date(bill.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div>
          </div>
        </div>
        <div style={{ background: "#f7f8fa", borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: "#00B4D8", marginBottom: 6 }}>Bill To:</div>
          <div style={{ fontWeight: 500 }}>{client?.name}</div>
          <div style={{ color: "#555", lineHeight: 1.7 }}>{client?.address}</div>
          {client?.gstin && <div style={{ color: "#555" }}>GSTIN: {client.gstin}</div>}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #00B4D8" }}>
              {["ID", "Description", "Qty", "Rate", "Amount"].map(h => (
                <th key={h} style={{ textAlign: h === "ID" ? "center" : h === "Description" ? "left" : "right", padding: "8px 6px", color: "#00B4D8", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "0.5px solid #eee" }}>
                <td style={{ textAlign: "center", padding: "8px 6px" }}>{idx + 1}</td>
                <td style={{ padding: "8px 6px" }}>{item.desc}</td>
                <td style={{ textAlign: "right", padding: "8px 6px" }}>{item.qty}</td>
                <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{item.rate.toLocaleString("en-IN")}</td>
                <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{(item.qty * item.rate).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>Thank you for your business!</div>
          <div style={{ fontSize: 13, minWidth: 220 }}>
            {[["Subtotal", calc.subtotal], ["CGST 9%", calc.cgst], ["SGST 9%", calc.sgst]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "0.5px solid #eee" }}>
                <span style={{ color: "#555" }}>{l}</span><span>₹{v.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", background: "#00B4D8", color: "#fff", padding: "7px 8px", borderRadius: 6, marginTop: 6, fontWeight: 600 }}>
              <span>Total</span><span>₹{calc.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, borderTop: "0.5px solid #eee", paddingTop: 12 }}>
          <div style={{ fontWeight: 600, color: "#00B4D8", marginBottom: 4 }}>Bank Details</div>
          <div style={{ color: "#555", lineHeight: 1.8 }}>
            Account Name: {COMPANY.bank.name} | Account No: {COMPANY.bank.account}<br />
            Bank: {COMPANY.bank.bankName} | IFSC: {COMPANY.bank.ifsc}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={() => window.print()} style={{ background: "#00B4D8", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontWeight: 500, cursor: "pointer" }}>🖨 Print</button>
          <button onClick={onClose} style={{ background: "#eee", color: "#333", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ bills, clients }) {
  const allCalcs = bills.map(b => ({ ...b, ...calcBill(b.items) }));
  const totalRev = allCalcs.reduce((s, b) => s + b.total, 0);
  const pendingAmt = allCalcs.filter(b => b.status === "pending").reduce((s, b) => s + b.total, 0);
  const paidCount = allCalcs.filter(b => b.status === "paid").length;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: d.toLocaleString("en-IN", { month: "short" }), month: d.getMonth(), year: d.getFullYear() };
  });
  const monthData = months.map(m => ({
    label: m.label,
    val: allCalcs.filter(b => { const d = new Date(b.date); return d.getMonth() === m.month && d.getFullYear() === m.year; }).reduce((s, b) => s + b.total, 0),
  }));
  const maxVal = Math.max(...monthData.map(m => m.val), 1);

  const recent = [...bills].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 20, color: "var(--color-text-primary)" }}>Overview</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={fmtShort(totalRev)} sub={`${bills.length} invoices`} color="teal" />
        <StatCard label="Pending Amount" value={fmtShort(pendingAmt)} sub={`${bills.filter(b => b.status === "pending").length} invoices`} color="amber" />
        <StatCard label="Paid Invoices" value={paidCount} sub="successfully collected" color="purple" />
        <StatCard label="Total Clients" value={clients.length} sub="registered clients" color="coral" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--color-text-secondary)" }}>Revenue — last 6 months</div>
          <MiniBar data={monthData} maxVal={maxVal} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {monthData.map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "var(--color-text-secondary)" }}>{fmtShort(m.val)}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--color-text-secondary)" }}>Recent invoices</div>
          {recent.map(b => {
            const c = clients.find(cl => cl.id === b.clientId);
            const calc = calcBill(b.items);
            return (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{b.invoiceNo}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{c?.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{fmtShort(calc.total)}</div>
                  <Badge status={b.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BillsList({ bills, clients, onView, onDelete, onStatusChange }) {
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = bills.filter(b => {
    const c = clients.find(cl => cl.id === b.clientId);
    const matchSearch = b.invoiceNo.toLowerCase().includes(search.toLowerCase()) || c?.name.toLowerCase().includes(search.toLowerCase());
    const matchClient = filterClient === "all" || b.clientId === filterClient;
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchClient && matchStatus;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>All Bills</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice or client…" style={{ flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", fontSize: 13 }} />
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", fontSize: 13 }}>
          <option value="all">All clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", fontSize: 13 }}>
          <option value="all">All status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: "var(--color-text-secondary)", fontSize: 14, padding: 24, textAlign: "center" }}>No bills found.</div>}
        {filtered.map(b => {
          const c = clients.find(cl => cl.id === b.clientId);
          const calc = calcBill(b.items);
          return (
            <div key={b.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{b.invoiceNo}</span>
                  <Badge status={b.status} />
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>{c?.name} · {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{b.items.map(i => i.desc).join(", ")}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{fmt(calc.total)}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>incl. GST</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {b.status === "pending" && <button onClick={() => onStatusChange(b.id, "paid")} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "0.5px solid #3B6D11", background: "#EAF3DE", color: "#3B6D11", cursor: "pointer" }}>Mark Paid</button>}
                <button onClick={() => onView(b)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", cursor: "pointer" }}>View</button>
                <button onClick={() => onDelete(b.id)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "0.5px solid #F7C1C1", background: "#FCEBEB", color: "#A32D2D", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientsPage({ clients, bills, onAddClient, onDeleteClient }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", gstin: "", phone: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAddClient({ ...form, id: "c" + Date.now() });
    setForm({ name: "", address: "", gstin: "", phone: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 500 }}>Clients</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#00B4D8", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 500, cursor: "pointer", fontSize: 13 }}>+ Add Client</button>
      </div>
      {showForm && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["name", "Client Name *"], ["address", "Address"], ["gstin", "GSTIN"], ["phone", "Phone"]].map(([key, label]) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
              <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "7px 16px", borderRadius: 7, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button onClick={handleAdd} style={{ padding: "7px 16px", borderRadius: 7, background: "#00B4D8", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Save Client</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {clients.map(c => {
          const clientBills = bills.filter(b => b.clientId === c.id);
          const revenue = clientBills.reduce((s, b) => s + calcBill(b.items).total, 0);
          return (
            <div key={c.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>{c.address}</div>
                {c.gstin && <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>GSTIN: {c.gstin}</div>}
              </div>
              <div style={{ textAlign: "right", marginRight: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{fmt(revenue)}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{clientBills.length} bills</div>
              </div>
              <button onClick={() => onDeleteClient(c.id)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "0.5px solid #F7C1C1", background: "#FCEBEB", color: "#A32D2D", cursor: "pointer" }}>Remove</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportsPage({ bills, clients }) {
  const [period, setPeriod] = useState("monthly");
  const allCalcs = bills.map(b => ({ ...b, ...calcBill(b.items) }));
  const now = new Date();

  const getPeriodData = () => {
    if (period === "daily") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - 6 + i);
        const key = d.toISOString().split("T")[0];
        const dayBills = allCalcs.filter(b => b.date === key);
        return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), val: dayBills.reduce((s, b) => s + b.total, 0), count: dayBills.length };
      });
    }
    if (period === "weekly") {
      return Array.from({ length: 6 }, (_, i) => {
        const start = new Date(now);
        start.setDate(start.getDate() - (5 - i) * 7 - start.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const weekBills = allCalcs.filter(b => { const d = new Date(b.date); return d >= start && d <= end; });
        return { label: `W${i + 1}`, val: weekBills.reduce((s, b) => s + b.total, 0), count: weekBills.length };
      });
    }
    if (period === "monthly") {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const mBills = allCalcs.filter(b => { const bd = new Date(b.date); return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear(); });
        return { label: d.toLocaleString("en-IN", { month: "short" }), val: mBills.reduce((s, b) => s + b.total, 0), count: mBills.length };
      });
    }
    if (period === "yearly") {
      const years = [...new Set(allCalcs.map(b => new Date(b.date).getFullYear()))].sort();
      return years.map(y => {
        const yBills = allCalcs.filter(b => new Date(b.date).getFullYear() === y);
        return { label: String(y), val: yBills.reduce((s, b) => s + b.total, 0), count: yBills.length };
      });
    }
    return [];
  };

  const data = getPeriodData();
  const maxVal = Math.max(...data.map(d => d.val), 1);
  const totalForPeriod = data.reduce((s, d) => s + d.val, 0);
  const totalBills = data.reduce((s, d) => s + d.count, 0);
  const avgPerPeriod = totalBills > 0 ? totalForPeriod / data.filter(d => d.count > 0).length || 0 : 0;

  const clientRevenue = clients.map(c => ({
    ...c, revenue: allCalcs.filter(b => b.clientId === c.id).reduce((s, b) => s + b.total, 0),
    count: allCalcs.filter(b => b.clientId === c.id).length,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 500 }}>Reports</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["daily", "weekly", "monthly", "yearly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 14px", borderRadius: 20, border: period === p ? "none" : "0.5px solid var(--color-border-secondary)", background: period === p ? "#00B4D8" : "var(--color-background-secondary)", color: period === p ? "#fff" : "var(--color-text-secondary)", fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Revenue" value={fmtShort(totalForPeriod)} color="teal" />
        <StatCard label="Total Bills" value={totalBills} color="purple" />
        <StatCard label="Avg Revenue" value={fmtShort(Math.round(avgPerPeriod))} sub="per active period" color="amber" />
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "16px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{period} revenue chart</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, paddingBottom: 4 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", textAlign: "center" }}>{d.val > 0 ? fmtShort(d.val) : ""}</div>
              <div style={{ width: "100%", background: d.val > 0 ? "#00B4D8" : "var(--color-border-tertiary)", borderRadius: "3px 3px 0 0", height: Math.max(3, (d.val / maxVal) * 72), opacity: 0.85, transition: "height 0.3s" }} />
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textAlign: "center" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "16px" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--color-text-secondary)" }}>Revenue by client</div>
        {clientRevenue.map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: "#0F6E56", flexShrink: 0 }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 13 }}>{c.name}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{fmt(c.revenue)}</span>
              </div>
              <div style={{ height: 5, background: "var(--color-background-secondary)", borderRadius: 3 }}>
                <div style={{ height: 5, background: "#00B4D8", borderRadius: 3, width: clientRevenue[0].revenue > 0 ? (c.revenue / clientRevenue[0].revenue * 100) + "%" : "0%", transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{c.count} bill{c.count !== 1 ? "s" : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewBillForm({ clients, bills, onSave, onAddClient }) {
  const nextNo = "A" + String(90 + bills.length + 1).padStart(3, "0");
  const [form, setForm] = useState({ invoiceNo: nextNo, date: new Date().toISOString().split("T")[0], clientId: clients[0]?.id || "", status: "pending", items: [{ id: 1, desc: "", qty: 1, rate: 0 }] });
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", address: "", gstin: "", phone: "" });

  const calc = calcBill(form.items);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { id: Date.now(), desc: "", qty: 1, rate: 0 }] }));
  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  const updateItem = (id, key, val) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [key]: key === "qty" || key === "rate" ? parseFloat(val) || 0 : val } : i) }));

  const handleSaveClient = () => {
    if (!newClient.name.trim()) return;
    const c = { ...newClient, id: "c" + Date.now() };
    onAddClient(c);
    setForm(f => ({ ...f, clientId: c.id }));
    setNewClientMode(false);
    setNewClient({ name: "", address: "", gstin: "", phone: "" });
  };

  const handleSave = () => {
    if (!form.clientId || form.items.some(i => !i.desc.trim())) return alert("Please fill all required fields.");
    onSave({ ...form, id: "b" + Date.now() });
    setForm({ invoiceNo: "A" + String(90 + bills.length + 2).padStart(3, "0"), date: new Date().toISOString().split("T")[0], clientId: clients[0]?.id || "", status: "pending", items: [{ id: 1, desc: "", qty: 1, rate: 0 }] });
    alert("Bill saved successfully!");
  };

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 7, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", fontSize: 13, boxSizing: "border-box" };
  const labelStyle = { fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Create New Bill</div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div><label style={labelStyle}>Invoice No</label><input value={form.invoiceNo} onChange={e => setForm(f => ({ ...f, invoiceNo: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Invoice Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
              <option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Bill To (Client)</label>
            <button onClick={() => setNewClientMode(!newClientMode)} style={{ fontSize: 11, color: "#00B4D8", background: "none", border: "none", cursor: "pointer" }}>+ New client</button>
          </div>
          {newClientMode ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--color-background-secondary)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
              {[["name", "Name *"], ["address", "Address"], ["gstin", "GSTIN"], ["phone", "Phone"]].map(([key, label]) => (
                <div key={key}><label style={labelStyle}>{label}</label><input value={newClient[key]} onChange={e => setNewClient({ ...newClient, [key]: e.target.value })} style={inputStyle} /></div>
              ))}
              <div style={{ gridColumn: "1/-1", display: "flex", gap: 8 }}>
                <button onClick={handleSaveClient} style={{ padding: "7px 14px", background: "#00B4D8", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>Save & Select</button>
                <button onClick={() => setNewClientMode(false)} style={{ padding: "7px 14px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} style={inputStyle}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Line Items</div>
            <button onClick={addItem} style={{ fontSize: 12, color: "#00B4D8", background: "none", border: "0.5px solid #00B4D8", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>+ Add Item</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
            {["Description", "Qty", "Rate (₹)", ""].map((h, i) => <div key={i} style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{h}</div>)}
          </div>
          {form.items.map(item => (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} placeholder="Service description" style={inputStyle} />
              <input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} style={inputStyle} />
              <input type="number" value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} style={inputStyle} />
              <button onClick={() => removeItem(item.id)} disabled={form.items.length === 1} style={{ padding: "7px 10px", borderRadius: 6, border: "none", background: form.items.length > 1 ? "#FCEBEB" : "var(--color-background-secondary)", color: form.items.length > 1 ? "#A32D2D" : "var(--color-text-secondary)", cursor: form.items.length > 1 ? "pointer" : "default", fontSize: 14 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 260, background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px" }}>
            {[["Subtotal", calc.subtotal], ["CGST 9%", calc.cgst], ["SGST 9%", calc.sgst]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{l}</span><span>{fmt(v)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 16, fontWeight: 500, color: "#00B4D8" }}>
              <span>Total</span><span>{fmt(calc.total)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <button onClick={handleSave} style={{ padding: "10px 28px", background: "#00B4D8", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 14 }}>Save Bill</button>
        </div>
      </div>
    </div>
  );
}

export default function Main() {
  const [tab, setTab] = useState("Dashboard");
  const [bills, setBills] = useState(SEED_BILLS);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [viewBill, setViewBill] = useState(null);

  const addBill = (bill) => { setBills(b => [bill, ...b]); setTab("Bills"); };
  const deleteBill = (id) => setBills(b => b.filter(b => b.id !== id));
  const updateStatus = (id, status) => setBills(b => b.map(bill => bill.id === id ? { ...bill, status } : bill));
  const addClient = (c) => setClients(cl => [...cl, c]);
  const deleteClient = (id) => setClients(cl => cl.filter(c => c.id !== id));

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
          <Logo />
          <nav style={{ display: "flex", gap: 2 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: tab === t ? (t === "New Bill" ? "#00B4D8" : "var(--color-background-secondary)") : "transparent", color: tab === t ? (t === "New Bill" ? "#fff" : "var(--color-text-primary)") : "var(--color-text-secondary)", fontWeight: tab === t ? 500 : 400, cursor: "pointer", fontSize: 13 }}>{t}</button>
            ))}
          </nav>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {tab === "Dashboard" && <Dashboard bills={bills} clients={clients} />}
        {tab === "Bills" && <BillsList bills={bills} clients={clients} onView={setViewBill} onDelete={deleteBill} onStatusChange={updateStatus} />}
        {tab === "Clients" && <ClientsPage clients={clients} bills={bills} onAddClient={addClient} onDeleteClient={deleteClient} />}
        {tab === "Reports" && <ReportsPage bills={bills} clients={clients} />}
        {tab === "New Bill" && <NewBillForm clients={clients} bills={bills} onSave={addBill} onAddClient={addClient} />}
      </div>
      {viewBill && <PrintBill bill={viewBill} client={clients.find(c => c.id === viewBill.clientId)} onClose={() => setViewBill(null)} />}
    </div>
  );
}
