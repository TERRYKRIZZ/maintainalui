import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

import Equipment from "./pages/Equipment";
import MaintenanceSchedule from "./pages/MaintenanceSchedule";
import FaultReports from "./pages/FaultReports";
import WorkOrders from "./pages/WorkOrders";
import SpareParts from "./pages/SpareParts";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import Reports from "./pages/Reports";

const initialStats = [
  { label: "Total Equipment", value: "248", detail: "Registered assets", icon: "⚙️" },
  { label: "Needs Attention", value: "12", detail: "Faults reported", icon: "⚠️" },
  { label: "Open Work Orders", value: "18", detail: "Jobs in progress", icon: "🛠️" },
  { label: "Completed Jobs", value: "86", detail: "This month", icon: "✅" },
];

const initialOrders = [
  { id: "WO-1048", equipment: "Main Generator", location: "Central Library", priority: "High", status: "In Progress" },
  { id: "WO-1047", equipment: "Air Conditioning Unit", location: "Faculty of Science", priority: "Medium", status: "Pending" },
  { id: "WO-1046", equipment: "Water Pump", location: "Student Hostel", priority: "Low", status: "Completed" },
  { id: "WO-1045", equipment: "Laboratory Microscope", location: "Teaching Laboratory", priority: "High", status: "Pending" },
];

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activePage, setActivePage] = useState("Overview");
  const [databaseStatus, setDatabaseStatus] = useState("Checking connection...");

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Could not check login session:", error.message);
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function testDatabase() {
      const { error } = await supabase
        .from("equipment")
        .select("id")
        .limit(1);

      if (!isMounted) return;

      setDatabaseStatus(
        error
          ? `Connection test failed: ${error.message}`
          : "Database connection successful!"
      );
    }

    testDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert("Login failed: " + error.message);
      return;
    }

    setSession(data.session);
    setLoginPassword("");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      return;
    }

    setSession(null);
    setActivePage("Overview");
    setLoginPassword("");
  };

  const menuItems = [
    { label: "Overview", icon: "▦" },
    { label: "Equipment", icon: "⚙" },
    { label: "Maintenance Schedule", icon: "▦" },
    { label: "Fault Reports", icon: "⚠" },
    { label: "Work Orders", icon: "🛠" },
    { label: "Spare Parts", icon: "▤" },
    { label: "Maintenance History", icon: "◷" },
    { label: "Reports", icon: "▥" },
  ];

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>MaintainalUI</h1>
          <p>Checking your sign-in session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <h1>MaintainalUI</h1>
          <p>Sign in to the Equipment Maintenance System</p>

          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button type="submit">Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-shell">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⚙</div>
          <div>
            <h2>MaintainalUI</h2>
            <span>Equipment Maintenance System</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activePage === item.label ? "active" : ""}`}
              onClick={() => setActivePage(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">ⓘ</span>
            <strong>Need assistance?</strong>
            <p>Keep campus equipment running smoothly.</p>
          </div>

          <div className="profile">
            <div className="avatar">FM</div>
            <div>
              <strong>Facilities Manager</strong>
              <span>Administrator</span>
            </div>
            <button
              type="button"
              className="profile-menu"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <span className="date-label">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            
<button className="notification-button" aria-label="Notifications">
  ♧<span className="notification-dot" />
</button>

<button
  type="button"
  onClick={handleLogout}
  aria-label="Log out"
  style={{
    border: "none",
    borderRadius: "8px",
    padding: "9px 12px",
    background: "#f56600",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  Logout
</button>

<div className="top-avatar">FM</div>
          </div>
        </header>

        <section className="page-content">
          {activePage === "Equipment" ? (
            <Equipment />
          ) : activePage === "Maintenance Schedule" ? (
            <MaintenanceSchedule />
          ) : activePage === "Fault Reports" ? (
            <FaultReports />
          ) : activePage === "Work Orders" ? (
            <WorkOrders />
          ) : activePage === "Spare Parts" ? (
            <SpareParts />
          ) : activePage === "Maintenance History" ? (
            <MaintenanceHistory />
          ) : activePage === "Reports" ? (
            <Reports />
          ) : (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">UNIVERSITY OF IBADAN</p>
                  <h1>
                    {activePage === "Overview"
                      ? "Maintenance Overview"
                      : activePage}
                  </h1>
                  <p className="page-subtitle">
                    Monitor campus equipment and keep maintenance operations on track.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Work Orders")}
                >
                  <span>＋</span> Create Work Order
                </button>
              </div>

              <div className="stats-grid">
                {initialStats.map((stat) => (
                  <article className="stat-card" key={stat.label}>
                    <div className="stat-card-top">
                      <span>{stat.label}</span>
                      <span className="stat-icon">{stat.icon}</span>
                    </div>
                    <h2>{stat.value}</h2>
                    <p>{stat.detail}</p>
                  </article>
                ))}
              </div>

              <div className="dashboard-grid">
                <section className="panel schedule-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Upcoming Maintenance</h2>
                      <p>Planned servicing across campus</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setActivePage("Maintenance Schedule")}
                    >
                      View schedule →
                    </button>
                  </div>

                  <div className="schedule-list">
                    <div className="schedule-item">
                      <div className="calendar-tile">
                        <span>OCT</span>
                        <strong>12</strong>
                      </div>
                      <div className="schedule-info">
                        <strong>Generator routine servicing</strong>
                        <span>Main Library · Power equipment</span>
                      </div>
                      <span className="status-badge status-planned">Scheduled</span>
                    </div>

                    <div className="schedule-item">
                      <div className="calendar-tile">
                        <span>OCT</span>
                        <strong>14</strong>
                      </div>
                      <div className="schedule-info">
                        <strong>Air conditioner inspection</strong>
                        <span>Faculty of Science · HVAC</span>
                      </div>
                      <span className="status-badge status-progress">Upcoming</span>
                    </div>

                    <div className="schedule-item">
                      <div className="calendar-tile">
                        <span>OCT</span>
                        <strong>16</strong>
                      </div>
                      <div className="schedule-info">
                        <strong>Water pump preventive check</strong>
                        <span>Student Hostel · Plumbing</span>
                      </div>
                      <span className="status-badge status-planned">Scheduled</span>
                    </div>
                  </div>
                </section>

                <section className="panel attention-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Maintenance Health</h2>
                      <p>Illustrative overview</p>
                    </div>
                    <span className="health-symbol">↗</span>
                  </div>

                  <div className="health-score">
                    <div>
                      <strong>92%</strong>
                      <span>Operational status</span>
                    </div>
                    <span className="health-pill">Good condition</span>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill" />
                  </div>

                  <div className="health-row">
                    <span>Equipment operational</span>
                    <strong>228</strong>
                  </div>
                  <div className="health-row">
                    <span>Under maintenance</span>
                    <strong>12</strong>
                  </div>
                  <div className="health-row">
                    <span>Awaiting inspection</span>
                    <strong>8</strong>
                  </div>

                  <p className="demo-note">
                    Sample dashboard figures for demonstration.
                  </p>
                </section>
              </div>

              <section className="panel orders-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent Work Orders</h2>
                    <p>Latest maintenance activities and requests</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Work Orders")}
                  >
                    View all orders →
                  </button>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Work Order</th>
                        <th>Equipment</th>
                        <th>Location</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="order-id">{order.id}</td>
                          <td>{order.equipment}</td>
                          <td>{order.location}</td>
                          <td>
                            <span
                              className={`priority priority-${order.priority.toLowerCase()}`}
                            >
                              {order.priority}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                order.status === "Completed"
                                  ? "status-complete"
                                  : order.status === "In Progress"
                                    ? "status-progress"
                                    : "status-pending"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <footer className="page-footer">
                <span>
                  MaintainalUI · Equipment Maintenance Scheduling System
                </span>
                <span>University of Ibadan · CSC 476</span>
              </footer>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
