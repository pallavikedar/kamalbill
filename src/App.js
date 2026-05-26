// // App.jsx
// // ─── Root component: holds all state and renders the active page ──────────────
// //
// // State lives here so any page can read/mutate bills and clients.
// // Tab routing is a simple string — no router library needed.

// import { useState } from "react";

// // Data
// import { SEED_BILLS, SEED_CLIENTS } from "./data/constants";

// // Layout
// import Navbar from "./components/Navbar";

// // Shared modal
// import PrintBill from "./components/PrintBill";

// // Pages (one per nav tab)
// // import Dashboard   from "./pages/Dashboard";
// import BillsList   from "./pages/BillsList";
// import ClientsPage from "./pages/ClientsPage";
// // import ReportsPage from "./pages/ReportsPage";
// import NewBillForm from "./pages/NewBillForm";

// export default function App() {
//   // ── Navigation ──────────────────────────────────────────────────────────────
//   const [activeTab, setActiveTab] = useState("Dashboard");

//   // ── Core data state ─────────────────────────────────────────────────────────
//   const [bills,   setBills]   = useState(SEED_BILLS);
//   const [clients, setClients] = useState(SEED_CLIENTS);

//   // ── PrintBill modal (null = closed, bill object = open) ─────────────────────
//   // const [viewingBill, setViewingBill] = useState(null);
// const [viewingBillId, setViewingBillId] = useState(null);
//   // ── Bill actions ─────────────────────────────────────────────────────────────
//   const addBill = (bill) => {
//     setBills((prev) => [bill, ...prev]);
//     setActiveTab("Bills"); // switch to Bills list after saving
//   };

//   const deleteBill = (id) =>
//     setBills((prev) => prev.filter((b) => b.id !== id));

//   const updateBillStatus = (id, status) =>
//     setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

//   // ── Client actions ───────────────────────────────────────────────────────────
//   const addClient = (client) =>
//     setClients((prev) => [...prev, client]);

//   const deleteClient = (id) =>
//     setClients((prev) => prev.filter((c) => c.id !== id));
//  const handleViewBill = (billId) => {
//   console.log("Viewing bill with ID:", billId);
//   setViewingBillId(billId);
// };

// // Close the print modal
// const handleClosePrint = () => {
//   setViewingBillId(null);
// };
//   // ── Page map ─────────────────────────────────────────────────────────────────
//   const pages = {
//     // Dashboard: (
//     //   <Dashboard bills={bills} clients={clients} />
//     // ),
//     Bills: (
//       <BillsList
//         bills={bills}
//         clients={clients}
//         onView={setViewingBillId}
//         onDelete={deleteBill}
//         onStatusChange={updateBillStatus}
//       />
//     ),
//     Clients: (
//       <ClientsPage
//         clients={clients}
//         bills={bills}
//         onAddClient={addClient}
//         onDeleteClient={deleteClient}
//       />
//     ),
//     // Reports: (
//     //   <ReportsPage bills={bills} clients={clients} />
//     // ),
//     "New Bill": (
//       <NewBillForm
//         clients={clients}
//         bills={bills}
//         onSave={addBill}
//         onAddClient={addClient}
//       />
//     ),
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "var(--color-background-tertiary)",
//         fontFamily: "var(--font-sans)",
//       }}
//     >
//       {/* ── Navigation bar ── */}
//       <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

//       {/* ── Page content ── */}
//       <div style={{  margin: "0 auto", padding: "24px 16px" }}>
//         {pages[activeTab]}
//       </div>

//       {/* ── Print/View modal (rendered above everything when open) ── */}
//       {viewingBillId && (
//   <PrintBill 
//     billId={viewingBillId}
//     onClose={handleClosePrint}
//   />
// )}
//     </div>
//   );
// }



// App.jsx
import { useState, useEffect } from "react";


import { SEED_BILLS, SEED_CLIENTS } from "./data/constants";
import Navbar from "./components/Navbar";
import PrintBill from "./components/PrintBill";
import BillsList from "./pages/BillsList";
import ClientsPage from "./pages/ClientsPage";
import NewBillForm from "./pages/NewBillForm";
import LoginPage from "./components/Login";
// import APPWRITE_CONFIG from "./lib/Appwriteconfig ";
import { account } from "./lib/Appwriteconfig";

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("Bills");

  // ── Core data state ───────────────────────────────────────────────────────
  const [bills,   setBills]   = useState(SEED_BILLS);
  const [clients, setClients] = useState(SEED_CLIENTS);

  // ── Print modal ───────────────────────────────────────────────────────────
  const [viewingBillId, setViewingBillId] = useState(null);

  // ── Check existing Appwrite session on mount ──────────────────────────────
  useEffect(() => {
    account.getSession("current")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogin  = () => setIsLoggedIn(true);

  const handleLogout = async () => {
    await account.deleteSession("current");
    setIsLoggedIn(false);
  };

  // ── Bill actions ──────────────────────────────────────────────────────────
  const addBill = (bill) => {
    setBills((prev) => [bill, ...prev]);
    setActiveTab("Bills");
  };

  const deleteBill = (id) =>
    setBills((prev) => prev.filter((b) => b.id !== id));

  const updateBillStatus = (id, status) =>
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  // ── Client actions ────────────────────────────────────────────────────────
  const addClient = (client) =>
    setClients((prev) => [...prev, client]);

  const deleteClient = (id) =>
    setClients((prev) => prev.filter((c) => c.id !== id));

  // ── Print modal handlers ──────────────────────────────────────────────────
 
  const handleClosePrint = () => setViewingBillId(null);

  // ── Checking session screen ───────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid #E9ECEF",
          borderTop: "3px solid #0A5C8E",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, color: "#ADB5BD" }}>Checking session…</span>
      </div>
    );
  }

  // ── Not logged in → show login page ──────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Page map ──────────────────────────────────────────────────────────────
  const pages = {
    Bills: (
      <BillsList
        bills={bills}
        clients={clients}
        onView={setViewingBillId}
        onDelete={deleteBill}
        onStatusChange={updateBillStatus}
      />
    ),
    Clients: (
      <ClientsPage
        clients={clients}
        bills={bills}
        onAddClient={addClient}
        onDeleteClient={deleteClient}
      />
    ),
    "New Bill": (
      <NewBillForm
        clients={clients}
        bills={bills}
        onSave={addBill}
        onAddClient={addClient}
      />
    ),
  };

  // ── Logged in → show app ──────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-background-tertiary)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* ── Navigation bar ── */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* ── Page content ── */}
      <div style={{ margin: "0 auto", padding: "24px 16px" }}>
        {pages[activeTab]}
      </div>

      {/* ── Print/View modal ── */}
      {viewingBillId && (
        <PrintBill
          billId={viewingBillId}
          onClose={handleClosePrint}
        />
      )}
    </div>
  );
}