
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
  
useEffect(() => {
  async function loadFaults() {
    const { data: faultRows, error: faultError } = await supabase
      .from("fault_reports")
      .select("*")
      .order("reported_at", { ascending: false });

    if (faultError) {
      console.error("Failed to load fault reports:", faultError.message);
      return;
    }

    const { data: equipmentRows, error: equipmentError } = await supabase
      .from("equipment")
      .select("id, name, location");

    if (equipmentError) {
      console.error("Failed to load equipment:", equipmentError.message);
      return;
    }

    const equipmentById = new Map(
      equipmentRows.map((item) => [item.id, item])
    );

    const savedFaults = faultRows.map((item) => {
      const linkedEquipment = equipmentById.get(item.equipment_id);

      return {
        id: item.id,
        equipment: linkedEquipment?.name || item.title,
        location: linkedEquipment?.location || "",
        description: item.description,
        severity: item.priority,
        status: item.status === "Open" ? "Pending" : item.status,
        reportedDate: item.reported_at.slice(0, 10),
      };
    });

    setFaults(savedFaults);
  }

  loadFaults();
}, []);

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

  
const handleSubmit = async (event) => {
  event.preventDefault();

  const equipmentName = form.equipment.trim();

  if (!equipmentName || !form.location.trim() || !form.description.trim()) {
    alert("Please complete all required fields.");
    return;
  }

  // Find the equipment record in Supabase.
  const { data: equipmentRecord, error: equipmentError } = await supabase
    .from("equipment")
    .select("id, name, location")
    .eq("name", equipmentName)
    .maybeSingle();

  if (equipmentError) {
    alert("Could not find equipment: " + equipmentError.message);
    return;
  }

  if (!equipmentRecord) {
    alert(
      `Equipment "${equipmentName}" is not registered in the database. ` +
      "Please register the equipment first and use its exact name."
    );
    return;
  }

  // Save the fault report in Supabase.
  const { data, error } = await supabase
    .from("fault_reports")
    .insert({
      equipment_id: equipmentRecord.id,
      title: `${equipmentName} fault report`,
      description: form.description.trim(),
      priority: form.severity,
      status: "Open",
    })
    .select()
    .single();

  if (error) {
    alert("Could not save fault report: " + error.message);
    return;
  }

  const newFault = {
    id: data.id,
    equipment: equipmentRecord.name,
    location: equipmentRecord.location || form.location.trim(),
    description: data.description,
    severity: data.priority,
    status: data.status === "Open" ? "Pending" : data.status,
    reportedDate: data.reported_at.slice(0, 10),
  };

  setFaults((current) => [newFault, ...current]);

  setForm({
    equipment: "",
    location: "",
    description: "",
    severity: "Medium",
  });

  setShowForm(false);
};


  
const updateStatus = async (id, status) => {
  const databaseStatus = status === "Pending" ? "Open" : status;

  const { error } = await supabase
    .from("fault_reports")
    .update({ status: databaseStatus })
    .eq("id", id);

  if (error) {
    alert("Could not update fault status: " + error.message);
    return;
  }

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
