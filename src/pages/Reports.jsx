
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

      <div className="reports-notice">
        The figures on this page are illustrative sample data. They are not
        live totals from the other MaintainalUI modules.
      </div>

      <div className="reports-stats">
        {reportStats.map((stat) => (
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
            Example breakdown by work-order status.
          </p>

          <div className="report-status-list">
            {workOrderSummary.map((item) => (
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
            Example inventory indicators.
          </p>

          <div className="report-inventory-list">
            {inventorySummary.map((item) => (
              <div className="report-inventory-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="reports-footnote">
        Report figures should be connected to verified application data before
        they are used for operational decisions.
      </p>
    </div>
  );
}

export default Reports;
