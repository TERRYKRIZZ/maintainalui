
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Reports.css";

const reportStats = [
  {
    label: "Total Equipment",
    value: "248",
    description: "Registered assets",
    icon: "⚙️",
  },
  {
    label: "Reported Faults",
    value: "12",
    description: "Illustrative figure",
    icon: "⚠️",
  },
  {
    label: "Open Work Orders",
    value: "18",
    description: "Illustrative figure",
    icon: "🛠️",
  },
  {
    label: "Completed Jobs",
    value: "86",
    description: "Illustrative figure",
    icon: "✅",
  },
];

const workOrderSummary = [
  { label: "Pending", count: 6, className: "report-pending" },
  { label: "In Progress", count: 8, className: "report-progress" },
  { label: "Completed", count: 4, className: "report-completed" },
];

const inventorySummary = [
  { label: "Total stock units", value: "44" },
  { label: "Low-stock items", value: "3" },
  { label: "Out-of-stock items", value: "0" },
];

function Reports() {
    
  const [liveReportStats, setLiveReportStats] = useState([
    { label: "Total Equipment", value: "—", description: "Loading data", icon: "⚙️" },
    { label: "Reported Faults", value: "—", description: "Loading data", icon: "⚠️" },
    { label: "Open Work Orders", value: "—", description: "Loading data", icon: "🛠️" },
    { label: "Completed Jobs", value: "—", description: "Loading data", icon: "✅" },
  ]);

  const [liveWorkOrderSummary, setLiveWorkOrderSummary] = useState([
    { label: "Pending", count: 0, className: "report-pending" },
    { label: "In Progress", count: 0, className: "report-progress" },
    { label: "Completed", count: 0, className: "report-completed" },
  ]);

  const [liveInventorySummary, setLiveInventorySummary] = useState([
    { label: "Total stock units", value: "0" },
    { label: "Low-stock items", value: "0" },
    { label: "Out-of-stock items", value: "0" },
  ]);

  useEffect(() => {
    async function loadReports() {
      const [
        equipmentResult,
        faultsResult,
        ordersResult,
        partsResult,
      ] = await Promise.all([
        supabase.from("equipment").select("id", { count: "exact", head: true }),
        supabase.from("fault_reports").select("id", { count: "exact", head: true }),
        supabase.from("work_orders").select("status"),
        supabase.from("spare_parts").select("quantity, reorder_level"),
      ]);

      const errors = [
        equipmentResult.error,
        faultsResult.error,
        ordersResult.error,
        partsResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error("Failed to load reports:", errors);
        return;
      }

      const orders = ordersResult.data || [];
      const parts = partsResult.data || [];

      const openOrders = orders.filter(
        (order) => !["Completed", "Cancelled"].includes(order.status)
      ).length;

      const completedJobs = orders.filter(
        (order) => order.status === "Completed"
      ).length;

      setLiveReportStats([
        {
          label: "Total Equipment",
          value: String(equipmentResult.count ?? 0),
          description: "Registered assets",
          icon: "⚙️",
        },
        {
          label: "Reported Faults",
          value: String(faultsResult.count ?? 0),
          description: "Saved fault reports",
          icon: "⚠️",
        },
        {
          label: "Open Work Orders",
          value: String(openOrders),
          description: "Not yet completed",
          icon: "🛠️",
        },
        {
          label: "Completed Jobs",
          value: String(completedJobs),
          description: "Completed work orders",
          icon: "✅",
        },
      ]);

      setLiveWorkOrderSummary([
        {
          label: "Pending",
          count: orders.filter((order) =>
            ["Open", "Pending"].includes(order.status)
          ).length,
          className: "report-pending",
        },
        {
          label: "In Progress",
          count: orders.filter((order) => order.status === "In Progress").length,
          className: "report-progress",
        },
        {
          label: "Completed",
          count: completedJobs,
          className: "report-completed",
        },
      ]);

      const totalUnits = parts.reduce(
        (total, part) => total + Number(part.quantity || 0),
        0
      );

      setLiveInventorySummary([
        { label: "Total stock units", value: String(totalUnits) },
        {
          label: "Low-stock items",
          value: String(
            parts.filter(
              (part) => Number(part.quantity) <= Number(part.reorder_level)
            ).length
          ),
        },
        {
          label: "Out-of-stock items",
          value: String(
            parts.filter((part) => Number(part.quantity) === 0).length
          ),
        },
      ]);
    }

    loadReports();
  }, []);

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <p className="eyebrow">FACILITIES MANAGEMENT</p>
          <h1>Reports</h1>
          <p className="page-subtitle">
            Review maintenance activity and inventory summaries.
          </p>
        </div>
      </div>

      <div className="reports-stats">
        {liveReportStats.map((stat) => (
          <article className="reports-stat-card" key={stat.label}>
            <div className="reports-stat-top">
              <span>{stat.label}</span>
              <span className="reports-stat-icon">{stat.icon}</span>
            </div>
            <h2>{stat.value}</h2>
            <p>{stat.description}</p>
          </article>
        ))}
      </div>

      <div className="reports-panels">
        <section className="reports-panel">
          <h2>Work Order Summary</h2>
          <p className="reports-panel-description">
            Current work orders grouped by status.
          </p>

          <div className="report-status-list">
            {liveWorkOrderSummary.map((item) => (
              <div className="report-status-row" key={item.label}>
                <span className="report-status-label">
                  <span className={`report-status-dot ${item.className}`} />
                  {item.label}
                </span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="reports-panel">
          <h2>Spare Parts Summary</h2>
          <p className="reports-panel-description">
            Current stock quantities and reorder levels.
          </p>

          <div className="report-inventory-list">
            {liveInventorySummary.map((item) => (
              <div className="report-inventory-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      
<p className="reports-footnote">
  These figures reflect records currently saved in MaintainalUI.
  Enter verified university records before using them for operational decisions.
</p>

    </div>
  );
}

export default Reports;
