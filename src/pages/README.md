# Kamal Celebrations — Billing App

## Folder Structure

```
KamalBillingApp/
│
├── App.jsx                   ← Root: all state + tab routing
│
├── data/
│   ├── constants.js          ← Company info, seed data, GST rates, nav tabs
│   └── utils.js              ← formatters (fmt, fmtShort), calcBill(), date helpers
│
├── components/               ← Reusable UI pieces
│   ├── Logo.jsx              ← Brand logo (SVG icon + name)
│   ├── Navbar.jsx            ← Top navigation bar
│   ├── StatCard.jsx          ← Summary metric card (label + big number)
│   ├── Badge.jsx             ← Status pill: Paid | Pending | Overdue
│   ├── MiniBar.jsx           ← Compact bar chart for Dashboard
│   └── PrintBill.jsx         ← Full GST invoice modal (print-ready)
│
└── pages/                    ← One file per nav tab
    ├── Dashboard.jsx         ← Overview: stat cards, bar chart, recent bills
    ├── BillsList.jsx         ← All bills: search + filter + actions
    ├── ClientsPage.jsx       ← Client list, add/remove, per-client revenue
    ├── ReportsPage.jsx       ← Daily / weekly / monthly / yearly charts
    └── NewBillForm.jsx       ← Create invoice with line items + GST calc
```

## Data Flow

```
App.jsx
  ├── bills state  ──► Dashboard, BillsList, ReportsPage, NewBillForm
  ├── clients state ──► Dashboard, BillsList, ClientsPage, ReportsPage, NewBillForm
  └── viewingBill  ──► PrintBill modal
```

All state lives in `App.jsx`. Pages receive data as props and call
action callbacks (`onSave`, `onDelete`, `onAddClient`, etc.) to update state.

## GST Calculation (utils.js → calcBill)

```
subtotal = Σ (qty × rate)
CGST     = subtotal × 9%
SGST     = subtotal × 9%
total    = subtotal + CGST + SGST
```

## Setup

```bash
npx create-react-app kamal-billing
cp -r KamalBillingApp/. kamal-billing/src/
cd kamal-billing
npm start
```
