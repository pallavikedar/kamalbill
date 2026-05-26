import { CGST_RATE, SGST_RATE } from "./constants";

// ─── Currency Formatters ──────────────────────────────────────────────────────

/** Full Indian rupee format: ₹1,18,000 */
export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/** Short format for cards: ₹1.2L, ₹50K, ₹800 */
export const fmtShort = (n) => {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
};

// ─── Bill Calculator ──────────────────────────────────────────────────────────

/**
 * Calculates subtotal, CGST, SGST, and total for a list of line items.
 * @param {Array} items - [{ qty, rate }]
 * @returns {{ subtotal, cgst, sgst, total }}
 */
export const calcBill = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const cgst     = subtotal * CGST_RATE;
  const sgst     = subtotal * SGST_RATE;
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst };
};

// ─── Date Helpers ─────────────────────────────────────────────────────────────

/** Format a date string to "14 May 2025" */
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Get month label from a Date object */
export const getMonthLabel = (date) =>
  date.toLocaleString("en-IN", { month: "short" });

// ─── Invoice Number Generator ─────────────────────────────────────────────────

/** Generate next invoice number based on existing bills count */
export const nextInvoiceNo = (bills) =>
  "A" + String(90 + bills.length + 1).padStart(3, "0");
