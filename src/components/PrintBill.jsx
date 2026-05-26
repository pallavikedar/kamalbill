// components/PrintBill.jsx
import { useRef, useState, useEffect } from "react";
import { COMPANY } from "../data/constants";
import { formatDate } from "../data/utils";
import { Client, Databases, Query } from "appwrite";
import APPWRITE_CONFIG from "../lib/Appwriteconfig";    // ← no space
import logo from "../assets/kamal-logo_1.png";

// ─── Teal brand colour matching the PDF ──────────────────────────────────────
const TEAL = "#2BBFBF";
const TEAL_DARK = "#1E9E9E";
const TEAL_BG = "#E8F8F8";
const FONT = "'Calibri', 'Trebuchet MS', 'Segoe UI', sans-serif";

// ─── GST Rate Configuration ─────────────────────────────────────────────────
const GST_RATES = {
  0: { label: "0%", cgst: 0, sgst: 0, igst: 0 },
  5: { label: "5%", cgst: 2.5, sgst: 2.5, igst: 5 },
  12: { label: "12%", cgst: 6, sgst: 6, igst: 12 },
  18: { label: "18%", cgst: 9, sgst: 9, igst: 18 },
  28: { label: "28%", cgst: 14, sgst: 14, igst: 28 },
};

// ─── Appwrite Client ─────────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fc = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(n) || 0);

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  return convert(Math.floor(num)) + " Rupees Only";
};

const sanitisePhone = (raw = "") => {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("91")) d = "91" + d;
  return d;
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const PRINT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const WA_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.828L.057 23.885a.5.5 0 0 0 .606.63l6.288-1.64A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-4.99-1.365l-.358-.213-3.724.972.993-3.624-.233-.373A9.786 9.786 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
  </svg>
);

const PAYMENT_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
    <line x1="12" y1="14" x2="12" y2="18" />
  </svg>
);

// ─── WhatsApp Modal ──────────────────────────────────────────────────────────
const WhatsAppModal = ({ defaultPhone, invoiceNo, total, onSend, onClose }) => {
  const [phone, setPhone] = useState(defaultPhone || "");
  const [msg, setMsg] = useState(
    `Hello,\n\nPlease find attached Invoice *${invoiceNo}* for *${fc(total)}*.\n\nKindly review and confirm receipt.\n\nThank you,\n${COMPANY.name || ""}`
  );
  const [sending, setSending] = useState(false);
  
  const send = async () => {
    const clean = sanitisePhone(phone);
    if (clean.length < 12) { 
      alert("Enter a valid WhatsApp number."); 
      return; 
    }
    
    setSending(true);
    
    try {
      const message = `Hello,\n\nPlease find attached Invoice ${invoiceNo} for ${fc(total)}.\n\nThank you,\n${COMPANY.name}`;
      const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      
      onSend?.();
      onClose();
    } catch (error) {
      console.error("WhatsApp error:", error);
      alert("Failed to open WhatsApp. Please try again.");
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 12, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: FONT }}>
        <div style={{ background: "#25D366", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, color: "white" }}>
          {WA_ICON}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Send via WhatsApp</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Invoice {invoiceNo}</div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 4 }}>Customer WhatsApp Number</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder="+91 98765 43210"
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, marginBottom: 14, boxSizing: "border-box", outline: "none", fontFamily: FONT }} 
          />
          <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 4 }}>Message</label>
          <textarea 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            rows={6}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: FONT, lineHeight: 1.6 }} 
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "7px 18px", border: "1px solid #ddd", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 12, fontFamily: FONT }}>Cancel</button>
            <button 
              onClick={send} 
              disabled={sending}
              style={{ 
                padding: "7px 18px", 
                border: "none", 
                borderRadius: 6, 
                background: "#25D366", 
                color: "white", 
                cursor: sending ? "not-allowed" : "pointer", 
                opacity: sending ? 0.6 : 1,
                fontSize: 12, 
                fontWeight: 600, 
                fontFamily: FONT, 
                display: "flex", 
                alignItems: "center", 
                gap: 6 
              }}
            >
              {sending ? "Opening..." : WA_ICON}
              {sending ? "Opening WhatsApp..." : "Open WhatsApp"}
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "#888", textAlign: "center", borderTop: "1px solid #eee", paddingTop: 12 }}>
            💡 Tip: Save the invoice as PDF first, then send it via WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Payment History Modal ───────────────────────────────────────────────────
const PaymentHistoryModal = ({ bill, payments, onClose }) => {
  const totalPaidFromPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = (bill?.advancePayment || 0) + totalPaidFromPayments;
  
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 12, width: "100%", maxWidth: 550, maxHeight: "80vh", overflow: "auto", padding: 24, fontFamily: FONT }}>
        <h3 style={{ margin: "0 0 16px 0", color: TEAL, fontSize: 18 }}>💰 Payment History</h3>
        
        <div style={{ background: TEAL_BG, padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong>Invoice:</strong> <span>{bill?.invoiceNo}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong>Total Amount:</strong> <span>{fc(bill?.total)}</span>
          </div>
          {bill?.advancePayment > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <strong>Advance Payment:</strong> <span style={{ color: "#856404" }}>{fc(bill.advancePayment)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong>Total Paid:</strong> <span style={{ color: "#27AE60", fontWeight: "bold" }}>{fc(totalPaid)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid #ddd" }}>
            <strong>Balance Due:</strong> 
            <span style={{ color: bill?.balanceDue > 0 ? TEAL : "#27AE60", fontWeight: "bold" }}>{fc(bill?.balanceDue)}</span>
          </div>
        </div>
        
        {bill?.advancePayment > 0 && (
          <div style={{ background: "#FFF3CD", padding: 10, borderRadius: 6, marginBottom: 12, borderLeft: `3px solid #FFC107` }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>💳 Advance Payment</div>
            <div style={{ fontSize: 13 }}>{fc(bill.advancePayment)}</div>
            <div style={{ fontSize: 10, color: "#666" }}>Recorded at invoice creation</div>
          </div>
        )}
        
        {payments.length > 0 ? (
          <>
            <h4 style={{ margin: "16px 0 10px 0", fontSize: 14, color: "#555" }}>📋 Payment Transactions</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: 8, textAlign: "left", fontSize: 12 }}>Date</th>
                  <th style={{ padding: 8, textAlign: "right", fontSize: 12 }}>Amount</th>
                  <th style={{ padding: 8, textAlign: "left", fontSize: 12 }}>Method</th>
                  <th style={{ padding: 8, textAlign: "left", fontSize: 12 }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 8, fontSize: 12 }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td style={{ padding: 8, textAlign: "right", fontSize: 12, fontWeight: 600, color: "#27AE60" }}>{fc(payment.amount)}</td>
                    <td style={{ padding: 8, fontSize: 12 }}>
                      <span style={{
                        background: "#E8F5E9",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        textTransform: "capitalize"
                      }}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: 8, fontSize: 12 }}>{payment.reference || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 30, color: "#888" }}>
            No additional payments recorded yet
          </div>
        )}
        
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button onClick={onClose} style={{ padding: "8px 20px", background: TEAL, color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Action Button Component ─────────────────────────────────────────────────
const ActionButton = ({ children, onClick, bg, hover, color = "white", loading, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "10px 20px",
        background: isHovered ? hover : bg,
        color: color,
        border: "none",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.65 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.2s ease",
        fontFamily: FONT,
        whiteSpace: "nowrap",
      }}
    >
      {loading ? (
        <span style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PrintBill({ billId, onClose }) {
  const printRef = useRef();
  const logoRef = useRef();

  const [bill, setBill] = useState(null);
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [showWA, setShowWA] = useState(false);

  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // ─── Fetch bill, client, and payments data from Appwrite using billId ──────
  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId) {
        setError("No bill ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch the bill document
        const billDoc = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.billId,
          billId
        );

        // Parse bill data
        let items = [];
        try {
          if (billDoc.itemsJson) items = JSON.parse(billDoc.itemsJson);
          else if (billDoc.items) items = billDoc.items;
        } catch (e) {
          console.error("Error parsing items:", e);
        }

        // Fetch all payments for this invoice
        let paymentsData = [];
        try {
          const paymentsRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.paymentCollectionId,
            [Query.equal('invoiceId', billId), Query.orderDesc('paymentDate')]
          );
          paymentsData = paymentsRes.documents;
        } catch (err) {
          console.error("Error fetching payments:", err);
        }

        // Calculate total paid from payments
        const totalPaidFromPayments = paymentsData.reduce((sum, p) => sum + p.amount, 0);
        const advancePaymentAmount = billDoc.advancePayment || 0;
        const totalPaid = advancePaymentAmount + totalPaidFromPayments;
        const balanceDue = (billDoc.total || 0) - totalPaid;
        const status = balanceDue <= 0 ? "paid" : (totalPaid > 0 ? "partial" : (billDoc.status || "pending"));

        const billData = {
          id: billDoc.$id,
          invoiceNo: billDoc.invoiceNo || "",
          date: billDoc.date || "",
          dueDate: billDoc.dueDate || "",
          status: status,
          clientId: billDoc.clientId || "",
          notes: billDoc.notes || "",
          terms: billDoc.terms || "",
          discount: billDoc.discount || 0,
          discountType: billDoc.discountType || "fixed",
          advancePayment: advancePaymentAmount,
          gstType: billDoc.gstType || "without_gst",
          gstRate: billDoc.gstRate || 0,
          cgst: billDoc.cgst || 0,
          sgst: billDoc.sgst || 0,
          totalTax: billDoc.totalTax || 0,
          total: billDoc.total || 0,
          paidAmount: totalPaid,
          balanceDue: balanceDue,
          items: items,
        };

        setBill(billData);
        setPayments(paymentsData);

        // Fetch client data if clientId exists
        if (billDoc.clientId) {
          try {
            const clientDoc = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collectionId,
              billDoc.clientId
            );

            setClient({
              id: clientDoc.$id,
              name: clientDoc.name || clientDoc.clientName || "",
              companyName: clientDoc.companyName || clientDoc.company || "",
              contactPerson: clientDoc.contactPerson || "",
              address: clientDoc.address || clientDoc.billingAddress || "",
              billingAddress: clientDoc.billingAddress || clientDoc.address || "",
              city: clientDoc.city || "",
              state: clientDoc.state || "",
              pincode: clientDoc.pincode || "",
              gstin: clientDoc.gstin || clientDoc.gst || "",
              pan: clientDoc.pan || "",
              email: clientDoc.email || "",
              phone: clientDoc.phone || clientDoc.mobile || "",
              whatsapp: clientDoc.whatsapp || clientDoc.phone || "",
            });

          } catch (err) {
            console.error("Error fetching client:", err);
            setClient({
              id: billDoc.clientId,
              name: "Client",
              companyName: "Client Information",
              address: "Address not available",
              city: "",
              state: "",
              gstin: "",
              email: "",
              phone: "",
              whatsapp: "",
            });
          }
        } else {
          setClient({
            name: "Client Not Specified",
            companyName: "Client Not Specified",
            address: "",
            whatsapp: "",
          });
        }

      } catch (err) {
        console.error("Error fetching bill:", err);
        setError(`Failed to load invoice: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [billId]);

  // Calculate totals with proper GST handling
  const calculateTotals = () => {
    if (!bill) return { subtotal: 0, afterDiscount: 0, total: 0, cgst: 0, sgst: 0, totalTax: 0 };
    
    const subtotal = bill.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    let discountAmount = 0;
    
    if (bill.discount > 0) {
      discountAmount = bill.discountType === "percentage" 
        ? (subtotal * bill.discount) / 100 
        : bill.discount;
    }
    
    const afterDiscount = subtotal - discountAmount;
    
    let cgst = bill.cgst || 0;
    let sgst = bill.sgst || 0;
    let totalTax = bill.totalTax || 0;
    
    if (bill.gstType === "with_gst" && bill.gstRate > 0 && (!cgst || !sgst)) {
      const rateInfo = GST_RATES[bill.gstRate];
      if (rateInfo) {
        cgst = afterDiscount * (rateInfo.cgst / 100);
        sgst = afterDiscount * (rateInfo.sgst / 100);
        totalTax = cgst + sgst;
      }
    }
    
    const total = afterDiscount + totalTax;
    
    return { subtotal, afterDiscount, total, cgst, sgst, totalTax, discountAmount };
  };
  
  const calc = calculateTotals();
  
  // Get GST display info
  const getGSTDisplay = () => {
    if (!bill || bill.gstType === "without_gst" || !bill.gstRate || bill.gstRate === 0) {
      return null;
    }
    const rateInfo = GST_RATES[bill.gstRate];
    return {
      rate: bill.gstRate,
      label: rateInfo?.label || `${bill.gstRate}%`,
      cgstPercent: rateInfo?.cgst || 0,
      sgstPercent: rateInfo?.sgst || 0,
    };
  };
  
  const gstInfo = getGSTDisplay();

  // Helper to get client display name
  const getClientDisplayName = () => {
    if (!client) return "Loading...";
    return client.companyName || client.name || "Guest Customer";
  };

  // Helper to get client address display
  const getClientAddressDisplay = () => {
    if (!client) return "Loading address...";
    const addr = client.billingAddress || client.address;
    if (addr && addr !== "Address not available") return addr;
    return "Address not provided";
  };

  // Helper to get client city/state/zip
  const getClientLocationDisplay = () => {
    if (!client) return "";
    const parts = [];
    if (client.city) parts.push(client.city);
    if (client.state) parts.push(client.state);
    if (client.pincode) parts.push(`- ${client.pincode}`);
    return parts.join(" ");
  };

  // Get client WhatsApp number
  const getClientWhatsApp = () => {
    if (!client) return "";
    return client.whatsapp || client.phone || "";
  };

  // ─── Print Handler ─────────────────────────────────────────────────────────
  const handlePrint = () => {
    setPrinting(true);
    try {
      const printContent = printRef.current;
      if (!printContent) {
        alert("Print content not found");
        setPrinting(false);
        return;
      }

      const printWindow = window.open("", "_blank", "width=900,height=750,toolbar=yes,menubar=yes");
      
      if (!printWindow) {
        alert("Please allow popups for this site to print.");
        setPrinting(false);
        return;
      }

      const htmlContent = printContent.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Invoice ${bill?.invoiceNo || ""} – ${COMPANY.name}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Calibri', 'Trebuchet MS', 'Segoe UI', sans-serif;
                font-size: 12px;
                color: #222;
                background: #fff;
                padding: 20px;
              }
              @media print {
                body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: A4; margin: 1.2cm; }
              }
              .invoice-container { max-width: 794px; margin: 0 auto; background: white; }
              table { border-collapse: collapse; width: 100%; }
              th, td { vertical-align: top; }
            </style>
          </head>
          <body>
            <div class="invoice-container">${htmlContent}</div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 100);
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
      alert("Error preparing print. Please try again.");
    } finally {
      setTimeout(() => setPrinting(false), 1000);
    }
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #2BBFBF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 20px" }} />
          <div style={{ fontFamily: FONT, fontSize: 14, color: "#666" }}>Loading invoice details...</div>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────────────
  if (error || !bill) {
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: "#e74c3c", marginBottom: 20 }}>{error || "Invoice not found"}</div>
          <button onClick={onClose} style={{ padding: "8px 20px", background: "#2BBFBF", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    );
  }

  // ─── Invoice Body Component ────────────────────────────────────────────────
  const InvoiceBody = () => (
    <div style={{ fontFamily: FONT, fontSize: 12, color: "#222", background: "white", padding: "32px 36px", maxWidth: 780, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEAL, marginBottom: 4 }}>{COMPANY.name}</div>
          <div style={{ fontSize: 11, color: "#444", lineHeight: 1.7 }}>
            <div>{COMPANY.address}</div>
            <div>{COMPANY.email}</div>
            <div>Mob No: {COMPANY.phone}</div>
            <div>GSTIN: {COMPANY.gstin}</div>
            {COMPANY.pan && <div>PAN: {COMPANY.pan}</div>}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <img
            ref={logoRef}
            src={logo}
            alt={COMPANY.name}
            style={{ width: 110, height: "auto", display: "block", margin: "0 auto", objectFit: "contain" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          {COMPANY.tagline && (
            <div style={{ fontSize: 11, color: "#666", fontStyle: "italic", marginTop: 5 }}>{COMPANY.tagline}</div>
          )}
          <div style={{ fontSize: 18, fontWeight: 700, color: TEAL, marginTop: 4 }}>Tax Invoice</div>
          {gstInfo && bill.gstType === "with_gst" && (
            <div style={{ fontSize: 10, color: TEAL, marginTop: 2 }}>GST {gstInfo.label}</div>
          )}
        </div>

        <div />
      </div>

      {/* Bill To & Meta Box */}
      <div style={{ background: TEAL_BG, border: `1px solid ${TEAL}33`, borderRadius: 8, padding: "14px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Bill To:</div>
          <div style={{ fontSize: 12, color: "#333", lineHeight: 1.75 }}>
            <div style={{ fontWeight: 600 }}>{getClientDisplayName()}</div>
            {client?.contactPerson && <div>Attn: {client.contactPerson}</div>}
            <div>{getClientAddressDisplay()}</div>
            {getClientLocationDisplay() ? <div>{getClientLocationDisplay()}</div> : null}
            {client?.gstin && <div>Customer GSTN: {client.gstin}</div>}
            {client?.email && <div>Email: {client.email}</div>}
            {client?.phone && <div>Phone: {client.phone}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#333", lineHeight: 2.1, whiteSpace: "nowrap" }}>
          <div><span style={{ color: TEAL, fontWeight: 600 }}>Invoice No: </span>{bill.invoiceNo}</div>
          <div><span style={{ color: TEAL, fontWeight: 600 }}>Invoice Date: </span>{formatDate(bill.date)}</div>
          {bill.dueDate && <div><span style={{ color: TEAL, fontWeight: 600 }}>Due Date: </span>{formatDate(bill.dueDate)}</div>}
          <div><span style={{ color: TEAL, fontWeight: 600 }}>Place of Supply: </span>{client?.state || "Maharashtra"}</div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: TEAL, color: "white" }}>
            {["ID", "Description", "Qty", "Rate", "Amount"].map((h, i) => (
              <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "center" : i >= 3 ? "right" : "left", fontSize: 12, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #e0e0e0", background: idx % 2 === 0 ? "white" : "#fafafa" }}>
              <td style={{ padding: "10px 12px", textAlign: "center", width: 40 }}>{idx + 1}</td>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ fontWeight: 500 }}>{item.desc}</div>
                {item.hsn && <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>HSN/SAC: {item.hsn}</div>}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "center", width: 60 }}>{item.qty}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", width: 100 }}>₹ {Number(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", width: 120 }}>₹ {Number(item.qty * item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", borderTop: "2px solid #ddd" }}>
        <div style={{ padding: "16px 12px" }}>
          <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginBottom: 8 }}>Thank you for your business!</div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Amount in Words: </span>{numberToWords(calc.total)}
          </div>
          {bill.notes && <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}><strong>Note:</strong> {bill.notes}</div>}
          {(bill.terms || COMPANY.terms) && <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}><strong>Terms:</strong> {bill.terms || COMPANY.terms}</div>}
          
          {/* Payment Summary Section */}
          {(bill.advancePayment > 0 || payments.length > 0) && (
            <div style={{ marginTop: 12, padding: 8, background: "#f8f9fa", borderRadius: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>💰 Payment Summary:</div>
              {bill.advancePayment > 0 && <div>Advance: {fc(bill.advancePayment)}</div>}
              {payments.length > 0 && <div>Payments: {fc(payments.reduce((sum, p) => sum + p.amount, 0))}</div>}
              <div style={{ marginTop: 4, fontWeight: 600, color: bill.balanceDue > 0 ? TEAL : "#27AE60" }}>
                Balance Due: {fc(bill.balanceDue)}
              </div>
            </div>
          )}
        </div>

        <div style={{ borderLeft: "1px solid #ddd" }}>
          {[
            { label: "Subtotal", value: calc.subtotal, show: true },
            { label: `Discount (${bill.discountType === "percentage" ? `${bill.discount}%` : "Fixed"})`, value: calc.discountAmount, show: bill.discount > 0, minus: true, color: "#27AE60" },
            { label: "Taxable Value", value: calc.afterDiscount, show: bill.discount > 0 || (bill.gstType === "with_gst") },
            ...(bill.gstType === "with_gst" && gstInfo && gstInfo.rate > 0 ? [
              { label: `CGST (${gstInfo.cgstPercent}%)`, value: calc.cgst, show: true, color: TEAL },
              { label: `SGST (${gstInfo.sgstPercent}%)`, value: calc.sgst, show: true, color: TEAL },
            ] : []),
          ].filter(r => r.show).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #eee", fontSize: 12, color: row.color || "#333" }}>
              <span>{row.label}</span>
              <span>{row.minus ? `-${fc(row.value)}` : fc(row.value)}</span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: TEAL, color: "white", fontWeight: 700, fontSize: 13, borderBottomLeftRadius: (bill.advancePayment > 0 || payments.length > 0) ? 0 : 6, borderBottomRightRadius: (bill.advancePayment > 0 || payments.length > 0) ? 0 : 6 }}>
            <span>Total</span>
            <span>{fc(calc.total)}</span>
          </div>

          {bill.advancePayment > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #eee", fontSize: 12, color: "#333" }}>
              <span>Advance Received</span>
              <span>-{fc(bill.advancePayment)}</span>
            </div>
          )}

          {payments.map((payment, idx) => (
            <div key={`payment-${idx}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #eee", fontSize: 12, color: "#333" }}>
              <span>Payment ({new Date(payment.paymentDate).toLocaleDateString()})</span>
              <span>-{fc(payment.amount)}</span>
            </div>
          ))}

          {(bill.advancePayment > 0 || payments.length > 0) && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#FFF3CD", fontWeight: 700, fontSize: 13, color: "#856404", borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
              <span>Balance Due</span>
              <span>{fc(bill.balanceDue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details */}
      {COMPANY.bank && (
        <div style={{ marginTop: 24, borderTop: "1px solid #ddd", paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 10 }}>Bank Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", fontSize: 12, color: "#333" }}>
            <div>Bank account name: <strong>{COMPANY.bank.accountName}</strong></div>
            <div>Account number: <strong>{COMPANY.bank.accountNumber}</strong></div>
            <div>Bank name: <strong>{COMPANY.bank.bankName}</strong></div>
            <div>IFSC Code: <strong>{COMPANY.bank.ifsc}</strong></div>
            {COMPANY.bank.upiId && <div>UPI ID: <strong>{COMPANY.bank.upiId}</strong></div>}
          </div>
        </div>
      )}

      {/* GST Summary for Without GST */}
      {bill.gstType === "without_gst" && (
        <div style={{ marginTop: 16, padding: 8, background: "#f8f9fa", borderRadius: 4, textAlign: "center", fontSize: 10, color: "#666" }}>
          * This invoice is exempt from GST / GST not applicable *
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 10, textAlign: "center", fontSize: 10, color: "#aaa" }}>
        This is a computer generated invoice and does not require a physical signature.
      </div>
    </div>
  );

  // Get client WhatsApp for action bar
  const clientWhatsApp = getClientWhatsApp();

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>

      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>

          <div ref={printRef}>
            <InvoiceBody />
          </div>

          {/* Action Bar */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #eee", background: "#fafafa", display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap", borderRadius: "0 0 16px 16px", position: "sticky", bottom: 0 }}>

            {(bill.advancePayment > 0 || payments.length > 0) && (
              <ActionButton
                onClick={() => setShowPaymentHistory(true)}
                bg="#6C757D"
                hover="#5a6268"
                icon={PAYMENT_ICON}
              >
                Payment History ({payments.length + (bill.advancePayment > 0 ? 1 : 0)})
              </ActionButton>
            )}

            {/* WhatsApp button - commented out but kept for reference
            <ActionButton
              onClick={() => setShowWA(true)}
              bg="#25D366"
              hover="#128C7E"
              icon={WA_ICON}
            >
              WhatsApp
              {clientWhatsApp && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.85 }}>({clientWhatsApp})</span>}
            </ActionButton> */}

            <ActionButton
              onClick={handlePrint}
              loading={printing}
              bg={TEAL}
              hover={TEAL_DARK}
              icon={PRINT_ICON}
            >
              {printing ? "Preparing..." : "Print Invoice"}
            </ActionButton>

            <ActionButton
              onClick={onClose}
              bg="white"
              hover="#f0f0f0"
              color="#555"
            >
              Close
            </ActionButton>
          </div>
        </div>
      </div>

      {showWA && (
        <WhatsAppModal
          defaultPhone={clientWhatsApp}
          invoiceNo={bill.invoiceNo}
          total={calc.total}
          onSend={() => setShowWA(false)}
          onClose={() => setShowWA(false)}
        />
      )}
      
      {showPaymentHistory && (
        <PaymentHistoryModal
          bill={bill}
          payments={payments}
          onClose={() => setShowPaymentHistory(false)}
        />
      )}
    </>
  );
}