
import { useState } from "react";
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextNumber =
      Math.max(
        1048,
        ...workOrders.map((order) => Number(order.id.replace("WO-", "")))
      ) + 1;

    const newOrder = {
      ...form,
      id: `WO-${nextNumber}`,
      status: "Open",
      date: new Date().toISOString().slice(0, 10),
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

  const updateStatus = (id, status) => {
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
