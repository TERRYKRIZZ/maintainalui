
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./WorkOrders.css";


const initialWorkOrders = [
  {
    id: "WO-1048",
    equipment: "Main Generator",
    location: "Central Library",
    issue: "Routine generator servicing",
    technician: "Maintenance Team A",
    priority: "High",
    status: "In Progress",
    date: "2026-10-10",
  },
  {
    id: "WO-1047",
    equipment: "Air Conditioning Unit",
    location: "Faculty of Science",
    issue: "Inspect cooling performance",
    technician: "Technician B",
    priority: "Medium",
    status: "Open",
    date: "2026-10-10",
  },
  {
    id: "WO-1046",
    equipment: "Water Pump",
    location: "Student Hostel",
    issue: "Investigate reduced water pressure",
    technician: "Technician C",
    priority: "Critical",
    status: "Open",
    date: "2026-10-09",
  },
];

function WorkOrders() {
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  
useEffect(() => {
  async function loadWorkOrders() {
    const { data: orderRows, error: orderError } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error("Failed to load work orders:", orderError.message);
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

    const savedOrders = orderRows.map((item) => {
      const linkedEquipment = equipmentById.get(item.equipment_id);

      return {
        id: item.work_order_code || item.id,
        equipment: linkedEquipment?.name || item.title,
        location: item.location || linkedEquipment?.location || "",
        issue: item.description || item.title,
        technician: item.assigned_to || "",
        priority: item.priority,
        status: item.status,
        date: item.scheduled_date || item.created_at.slice(0, 10),
      };
    });

    setWorkOrders(savedOrders);
  }

  loadWorkOrders();
}, []);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    equipment: "",
    location: "",
    issue: "",
    technician: "",
    priority: "Medium",
  });

  const filteredOrders = workOrders.filter((order) =>
    `${order.id} ${order.equipment} ${order.location} ${order.issue} ${order.technician} ${order.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  
const handleSubmit = async (event) => {
  event.preventDefault();

  const equipmentName = form.equipment.trim();

  if (
    !equipmentName ||
    !form.location.trim() ||
    !form.technician.trim() ||
    !form.issue.trim()
  ) {
    alert("Please complete all required fields.");
    return;
  }

  // Find the equipment in Supabase.
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
      "Please use the exact name of registered equipment."
    );
    return;
  }

  // Generate the next work-order number for this page.
  const existingNumbers = workOrders
    .map((order) => String(order.id).match(/^WO-(\d+)$/))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  const nextNumber = Math.max(1048, ...existingNumbers) + 1;
  const workOrderCode = `WO-${nextNumber}`;

  // Save the work order to Supabase.
  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      work_order_code: workOrderCode,
      equipment_id: equipmentRecord.id,
      title: form.issue.trim(),
      description: form.issue.trim(),
      priority: form.priority,
      status: "Open",
      assigned_to: form.technician.trim(),
      location: form.location.trim(),
    })
    .select()
    .single();

  if (error) {
    alert("Could not save work order: " + error.message);
    return;
  }

  const newOrder = {
    id: data.work_order_code,
    equipment: equipmentRecord.name,
    location: data.location || equipmentRecord.location || "",
    issue: data.description || data.title,
    technician: data.assigned_to || "",
    priority: data.priority,
    status: data.status,
    date: data.scheduled_date || data.created_at.slice(0, 10),
  };

  setWorkOrders((current) => [...current, newOrder]);

  setForm({
    equipment: "",
    location: "",
    issue: "",
    technician: "",
    priority: "Medium",
  });

  setShowForm(false);
};


  
const updateStatus = async (id, status) => {
  const { error } = await supabase
    .from("work_orders")
    .update({ status })
    .eq("work_order_code", id);

  if (error) {
    alert("Could not update work order status: " + error.message);
    return;
  }

  setWorkOrders((current) =>
    current.map((order) =>
      order.id === id ? { ...order, status } : order
    )
  );
};


  const openCount = workOrders.filter(
    (order) => order.status === "Open"
  ).length;

  const inProgressCount = workOrders.filter(
    (order) => order.status === "In Progress"
  ).length;

  const completedCount = workOrders.filter(
    (order) => order.status === "Completed"
  ).length;

  return (
    <section className="work-orders-page">
      <div className="work-orders-heading">
        <div>
          <p className="eyebrow">MAINTENANCE OPERATIONS</p>
          <h2>Work Orders</h2>
          <p className="work-orders-subtitle">
            Assign repair jobs, monitor progress and record completed work.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Create Work Order
        </button>
      </div>

      <div className="work-orders-summary">
        <article>
          <span>Total Work Orders</span>
          <strong>{workOrders.length}</strong>
        </article>

        <article>
          <span>Open</span>
          <strong>{openCount}</strong>
        </article>

        <article>
          <span>In Progress</span>
          <strong>{inProgressCount}</strong>
        </article>

        <article>
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
      </div>

      {showForm && (
        <form className="work-order-form" onSubmit={handleSubmit}>
          <h3>Create a Work Order</h3>

          <label>
            Equipment Name
            <input
              required
              value={form.equipment}
              onChange={(event) =>
                setForm({ ...form, equipment: event.target.value })
              }
              placeholder="e.g. Classroom Projector"
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
              placeholder="e.g. Faculty of Science"
            />
          </label>

          <label>
            Assigned Technician
            <input
              required
              value={form.technician}
              onChange={(event) =>
                setForm({ ...form, technician: event.target.value })
              }
              placeholder="e.g. Maintenance Team A"
            />
          </label>

          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </label>

          <label className="work-order-issue-field">
            Job Description
            <textarea
              required
              rows="4"
              value={form.issue}
              onChange={(event) =>
                setForm({ ...form, issue: event.target.value })
              }
              placeholder="Describe the maintenance work required..."
            />
          </label>

          <div className="work-order-form-actions">
            <button type="submit" className="primary-button">
              Save Work Order
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

      <div className="work-orders-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search work orders, equipment or technician..."
          aria-label="Search work orders"
        />
        <span>{filteredOrders.length} work orders</span>
      </div>

      <div className="work-orders-table-wrapper">
        <table className="work-orders-table">
          <thead>
            <tr>
              <th>Work Order</th>
              <th>Equipment / Location</th>
              <th>Job Description</th>
              <th>Technician</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="work-order-id">{order.id}</td>

                <td>
                  <strong className="work-order-equipment">
                    {order.equipment}
                  </strong>
                  <span className="work-order-location">
                    {order.location}
                  </span>
                </td>

                <td className="work-order-description">{order.issue}</td>

                <td>{order.technician}</td>

                <td>
                  <span
                    className={`work-order-priority priority-${order.priority.toLowerCase()}`}
                  >
                    {order.priority}
                  </span>
                </td>

                <td>
                  {new Date(`${order.date}T00:00:00`).toLocaleDateString(
                    "en-GB"
                  )}
                </td>

                <td>
                  <span
                    className={`work-order-status status-${order.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td>
                  <select
                    aria-label={`Update status for ${order.id}`}
                    value={order.status}
                    onChange={(event) =>
                      updateStatus(order.id, event.target.value)
                    }
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="8">No matching work orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="work-orders-demo-note">
        Sample work orders are for demonstration. Database integration and
        persistent storage will be added later.
      </p>
    </section>
  );
}

export default WorkOrders;
