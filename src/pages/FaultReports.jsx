
import { useState } from "react";
import "./FaultReports.css";

const initialFaults = [
  {
    id: "FR-001",
    equipment: "Air Conditioning Unit",
    location: "Faculty of Science",
    description: "Unit is producing warm air.",
    severity: "Medium",
    status: "Pending",
    reportedDate: "2026-10-09",
  },
  {
    id: "FR-002",
    equipment: "Main Generator",
    location: "Central Library",
    description: "Unusual noise during operation.",
    severity: "High",
    status: "Under Investigation",
    reportedDate: "2026-10-10",
  },
  {
    id: "FR-003",
    equipment: "Water Pump",
    location: "Student Hostel",
    description: "Reduced water pressure.",
    severity: "Low",
    status: "Resolved",
    reportedDate: "2026-10-08",
  },
];

function FaultReports() {
  const [faults, setFaults] = useState(initialFaults);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    equipment: "",
    location: "",
    description: "",
    severity: "Medium",
  });

  const filteredFaults = faults.filter((fault) =>
    `${fault.id} ${fault.equipment} ${fault.location} ${fault.description} ${fault.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const newFault = {
      ...form,
      id: `FR-${String(faults.length + 1).padStart(3, "0")}`,
      status: "Pending",
      reportedDate: new Date().toISOString().slice(0, 10),
    };

    setFaults((current) => [...current, newFault]);

    setForm({
      equipment: "",
      location: "",
      description: "",
      severity: "Medium",
    });

    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    setFaults((current) =>
      current.map((fault) =>
        fault.id === id ? { ...fault, status } : fault
      )
    );
  };

  return (
    <section className="fault-page">
      <div className="fault-heading">
        <div>
          <p className="eyebrow">EQUIPMENT INCIDENTS</p>
          <h2>Fault Reports</h2>
          <p className="fault-subtitle">
            Report equipment faults and monitor investigation and resolution.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Report a Fault
        </button>
      </div>

      <div className="fault-summary">
        <article>
          <span>Total Reports</span>
          <strong>{faults.length}</strong>
        </article>

        <article>
          <span>Pending</span>
          <strong>
            {faults.filter((fault) => fault.status === "Pending").length}
          </strong>
        </article>

        <article>
          <span>Under Investigation</span>
          <strong>
            {
              faults.filter(
                (fault) => fault.status === "Under Investigation"
              ).length
            }
          </strong>
        </article>

        <article>
          <span>Resolved</span>
          <strong>
            {faults.filter((fault) => fault.status === "Resolved").length}
          </strong>
        </article>
      </div>

      {showForm && (
        <form className="fault-form" onSubmit={handleSubmit}>
          <h3>Submit a Fault Report</h3>

          <label>
            Equipment Name
            <input
              required
              value={form.equipment}
              onChange={(event) =>
                setForm({ ...form, equipment: event.target.value })
              }
              placeholder="e.g. Main Generator"
            />
          </label>

          <label>
            Location
            <input
              required
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
              placeholder="e.g. Central Library"
            />
          </label>

          <label>
            Severity
            <select
              value={form.severity}
              onChange={(event) =>
                setForm({ ...form, severity: event.target.value })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </label>

          <label className="fault-description-field">
            Fault Description
            <textarea
              required
              rows="4"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Describe the problem and any symptoms..."
            />
          </label>

          <div className="fault-form-actions">
            <button type="submit" className="primary-button">
              Submit Report
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="fault-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search fault ID, equipment or location..."
          aria-label="Search fault reports"
        />
        <span>{filteredFaults.length} reports</span>
      </div>

      <div className="fault-table-wrapper">
        <table className="fault-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Equipment / Location</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Reported</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredFaults.map((fault) => (
              <tr key={fault.id}>
                <td className="fault-id">{fault.id}</td>

                <td>
                  <strong className="fault-equipment">
                    {fault.equipment}
                  </strong>
                  <span className="fault-location">{fault.location}</span>
                </td>

                <td className="fault-description">
                  {fault.description}
                </td>

                <td>
                  <span
                    className={`fault-severity severity-${fault.severity.toLowerCase()}`}
                  >
                    {fault.severity}
                  </span>
                </td>

                <td>
                  {new Date(
                    `${fault.reportedDate}T00:00:00`
                  ).toLocaleDateString("en-GB")}
                </td>

                <td>
                  <span
                    className={`fault-status status-${fault.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {fault.status}
                  </span>
                </td>

                <td>
                  <select
                    aria-label={`Update status for ${fault.id}`}
                    value={fault.status}
                    onChange={(event) =>
                      updateStatus(fault.id, event.target.value)
                    }
                  >
                    <option>Pending</option>
                    <option>Under Investigation</option>
                    <option>Resolved</option>
                  </select>
                </td>
              </tr>
            ))}

            {filteredFaults.length === 0 && (
              <tr>
                <td colSpan="7">No matching fault reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="fault-demo-note">
        Sample fault records are for demonstration. Persistent storage and
        database integration will be added later.
      </p>
    </section>
  );
}

export default FaultReports;
