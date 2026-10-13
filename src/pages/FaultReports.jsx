
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./FaultReports.css";

function FaultReports({ onCreateWorkOrder }) {
  const [faults, setFaults] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    equipment: "",
    location: "",
    description: "",
    severity: "Medium",
  });

  useEffect(() => {
    async function loadFaults() {
      setLoading(true);
      setLoadError("");

      try {
        // Load work orders from Supabase.
        const {
          data: workOrderRows,
          error: workOrderError,
        } = await supabase
          .from("work_orders")
          .select(
            "id, work_order_code, fault_report_id, status, created_at"
          )
          .order("created_at", { ascending: false });

        if (workOrderError) {
          throw new Error(
            "Failed to load work orders: " + workOrderError.message
          );
        }

        setWorkOrders(workOrderRows || []);

        // Load fault reports from Supabase.
        const {
          data: faultRows,
          error: faultError,
        } = await supabase
          .from("fault_reports")
          .select("*")
          .order("reported_at", { ascending: false });

        if (faultError) {
          throw new Error(
            "Failed to load fault reports: " + faultError.message
          );
        }

        // Load equipment details.
        const {
          data: equipmentRows,
          error: equipmentError,
        } = await supabase
          .from("equipment")
          .select("id, name, location");

        if (equipmentError) {
          throw new Error(
            "Failed to load equipment: " + equipmentError.message
          );
        }

        // Match equipment IDs to equipment records.
        const equipmentById = new Map(
          (equipmentRows || []).map((item) => [item.id, item])
        );

        // Match each fault report to its linked work order.
        // If multiple orders are linked, use the newest one.
        const workOrdersByFaultReport = new Map();

        for (const order of workOrderRows || []) {
          if (
            order.fault_report_id &&
            !workOrdersByFaultReport.has(order.fault_report_id)
          ) {
            workOrdersByFaultReport.set(order.fault_report_id, order);
          }
        }

        // Prepare the fault reports for display.
        const savedFaults = (faultRows || []).map((item) => {
          const linkedEquipment = equipmentById.get(item.equipment_id);
          const linkedWorkOrder = workOrdersByFaultReport.get(item.id);

          return {
            id: item.id,
            equipment: linkedEquipment?.name || item.title || "Unknown equipment",
            location: linkedEquipment?.location || "",
            description: item.description || "",
            severity: item.priority || "Medium",
            status: item.status === "Open" ? "Pending" : item.status,
            reportedDate: item.reported_at
              ? item.reported_at.slice(0, 10)
              : item.created_at
                ? item.created_at.slice(0, 10)
                : "",
            workOrder: linkedWorkOrder
              ? {
                  id:
                    linkedWorkOrder.work_order_code ||
                    linkedWorkOrder.id,
                  status: linkedWorkOrder.status,
                }
              : null,
          };
        });

        setFaults(savedFaults);
      } catch (error) {
        console.error(error.message);
        setLoadError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadFaults();
  }, []);

  // Search fault reports and linked work orders.
  const filteredFaults = faults.filter((fault) =>
    `${fault.id} ${fault.equipment} ${fault.location} ${
      fault.description
    } ${fault.status} ${fault.workOrder?.id || ""} ${
      fault.workOrder?.status || ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Create a new fault report.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const equipmentName = form.equipment.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!equipmentName || !location || !description) {
      alert("Please complete all required fields.");
      return;
    }

    // Find the registered equipment.
    const {
      data: equipmentRecord,
      error: equipmentError,
    } = await supabase
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

    // Get the authenticated user.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please sign in before submitting a fault report.");
      return;
    }

    // Save the fault report.
    const {
      data,
      error,
    } = await supabase
      .from("fault_reports")
      .insert({
        equipment_id: equipmentRecord.id,
        title: `${equipmentName} fault report`,
        description,
        priority: form.severity,
        status: "Open",
        created_by: user.id,
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
      location: equipmentRecord.location || location,
      description: data.description,
      severity: data.priority,
      status: data.status === "Open" ? "Pending" : data.status,
      reportedDate: data.reported_at
        ? data.reported_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      workOrder: null,
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
const createWorkOrderFromFault = (fault) => {
  if (typeof onCreateWorkOrder === "function") {
    onCreateWorkOrder(fault);
  }
};
  // Update a fault report's status in Supabase.
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

  const pendingCount = faults.filter(
    (fault) => fault.status === "Pending"
  ).length;

  const investigationCount = faults.filter(
    (fault) => fault.status === "Under Investigation"
  ).length;

  const resolvedCount = faults.filter(
    (fault) => fault.status === "Resolved"
  ).length;

  const linkedOrderCount = faults.filter(
    (fault) => fault.workOrder
  ).length;

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
          <strong>{pendingCount}</strong>
        </article>

        <article>
          <span>Under Investigation</span>
          <strong>{investigationCount}</strong>
        </article>

        <article>
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
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
          placeholder="Search fault ID, equipment or work order..."
          aria-label="Search fault reports"
        />
        <span>{filteredFaults.length} reports</span>
      </div>

      {loading && <p>Loading fault reports...</p>}

      {!loading && loadError && (
        <p role="alert">
          Could not load fault reports. Please check the browser console for
          details and refresh the page.
        </p>
      )}

      {!loading && !loadError && (
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
                <th>Linked Work Order</th>
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
                    <span className="fault-location">
                      {fault.location}
                    </span>
                  </td>

                  <td className="fault-description">
                    {fault.description}
                  </td>

                  <td>
                    <span
                      className={`fault-severity severity-${(
                        fault.severity || "medium"
                      ).toLowerCase()}`}
                    >
                      {fault.severity}
                    </span>
                  </td>

                  <td>
                    {fault.reportedDate
                      ? new Date(
                          `${fault.reportedDate}T00:00:00`
                        ).toLocaleDateString("en-GB")
                      : "—"}
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
  {fault.workOrder ? (
    <span>Work order: {fault.workOrder.id}</span>
  ) : (
    <button
      type="button"
      className="primary-button"
      onClick={() => createWorkOrderFromFault(fault)}
    >
      Create Work Order
    </button>
  )}
</td>

                  <td>
                    {fault.workOrder ? (
                      <div>
                        <strong>{fault.workOrder.id}</strong>
                        <span className="fault-location">
                          {fault.workOrder.status}
                        </span>
                      </div>
                    ) : (
                      <span>Not linked</span>
                    )}
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
                  <td colSpan="8">No matching fault reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="fault-subtitle">
        {linkedOrderCount} of {faults.length} fault reports linked to work
        orders.
      </p>
    </section>
  );
}

export default FaultReports;
