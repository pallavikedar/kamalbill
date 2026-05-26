// ─── GST Rates ────────────────────────────────────────────────────────────────
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;

// ─── Company Info ─────────────────────────────────────────────────────────────
export const COMPANY = {
  name: "Kamal Celebrations",
  tagline: "Celebrate with Elegance",
  address: "Plot No. 4, Rajeshwar Nagar, Besa-Pipla Road, Nagpur - 440034",
  email: "Kamalcelebrationsgroup@gmail.com",
  phone: "9209841329",
  gstin: "27AENPD8180P1ZR",
  bank: {
    accountName: "Kamal Celebrations",
    accountNumber: "41309369916",
    bankName: "State Bank Of India",
    ifsc: "SBIN006153",
  },
};

// ─── Seed Clients ─────────────────────────────────────────────────────────────
export const SEED_CLIENTS = [
  {
    id: "c1",
    name: "Enviro Health",
    address: "111 Old Dhyneshwar Nagar, Manewada Road, Nagpur - 440027",
    gstin: "27BALPN9242B1ZM",
    phone: "",
  },
  {
    id: "c2",
    name: "Raj Enterprises",
    address: "45 Sitabuldi Main Road, Nagpur - 440012",
    gstin: "27AABCR1234D1ZP",
    phone: "9876543210",
  },
];

// ─── Seed Bills ───────────────────────────────────────────────────────────────
export const SEED_BILLS = [
  {
    id: "b1",
    invoiceNo: "A090",
    date: "2025-05-14",
    clientId: "c1",
    status: "paid",
    items: [{ id: 1, desc: "Chetan Shingare Wedding", qty: 100, rate: 1000 }],
  },
  {
    id: "b2",
    invoiceNo: "A091",
    date: "2025-05-20",
    clientId: "c2",
    status: "pending",
    items: [{ id: 1, desc: "Corporate Event Decoration", qty: 1, rate: 50000 }],
  },
  {
    id: "b3",
    invoiceNo: "A092",
    date: "2025-04-10",
    clientId: "c1",
    status: "paid",
    items: [{ id: 1, desc: "Birthday Celebration", qty: 50, rate: 800 }],
  },
  {
    id: "b4",
    invoiceNo: "A093",
    date: "2025-03-22",
    clientId: "c2",
    status: "paid",
    items: [{ id: 1, desc: "Anniversary Dinner Setup", qty: 1, rate: 35000 }],
  },
];

// ─── Navigation Tabs ──────────────────────────────────────────────────────────
export const NAV_TABS = ["Bills", "Clients", "New Bill"];
