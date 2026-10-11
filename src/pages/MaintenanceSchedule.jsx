
import { useState } from "react";
import "./MaintenanceSchedule.css";

const initialSchedules = [
  {
    id: 1,
    equipment: "Main Generator",
    location: "Central Library",
    type: "Preventive",
    date: "2026-10-12",
    technician: "Maintenance Team A",
    status: "Scheduled",
  },
  {
    id: 2,
    equipment: "Air Conditioning Unit",
    location: "Faculty of Science",
    type: "Inspection",
    date: "2026-10-14",
    technician: "Maintenance Team B",
    status: "Scheduled",
  },
  {
    id: 3,
    equipment: "Water Pump",
    location: "Student Hostel",
    type: "Preventive",
    date: "2026-10-16",
    technician: "Maintenance Team A",
    status: "In Progress",
  },
];

function MaintenanceSchedule() {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    equipment: "",
    location: "",
    type: "Preventive",
    date: "",
    technician: "",
    status: "Scheduled",
  });

  const filteredSchedules = schedules.filter((item) =>
    `${item.equipment} ${item.location} ${item.technician} ${item.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const newSchedule = {
      ...form,
      id: Date.now(),
    };

    setSchedules((current) => [...current, newSchedule]);

    setForm({
      equipment: "",
      location: "",
      type: "Preventive",
      date: "",
      technician: "",
      status: "Scheduled",
    });

    setShowForm(false);
  };

  return (
    <section className="maintenance-page">
      <div className="maintenance-heading">
        <div>
          <p className="eyebrow">PLANNING & PREVENTION</p>
          <h2>Maintenance Schedule</h2>
          <p className="maintenance-subtitle">
            Plan equipment servicing and track upcoming maintenance activities.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Schedule Maintenance
        </button>
      </div>

      <div className="maintenance-summary">
        <article>
          <span>Total Schedules</span>
          <strong>{schedules.length}</strong>
        </article>
        <article>
          <span>Scheduled</span>
          <strong>
            {schedules.filter((item) => item.status === "Scheduled").length}
          </strong>
        </article>
        <article>
          <span>In Progress</span>
          <strong>
            {schedules.filter((item) => item.status === "In Progress").length}
          </strong>
        </article>
      </div>

      {showForm && (
        <form className="maintenance-form" onSubmit={handleSubmit}>
          <h3>Create Maintenance Schedule</h3>

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
            Equipment Location
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
            Maintenance Type
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option>Preventive</option>
              <option>Inspection</option>
              <option>Corrective</option>
              <option>Emergency</option>
            </select>
          </label>

          <label>
            Maintenance Date
            <input
              type="date"
              required
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
            />
          </label>

          <label>
            Assigned Technician or Team
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
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
            >
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>

          <div className="maintenance-form-actions">
            <button type="submit" className="primary-button">
              Save Schedule
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

      <div className="maintenance-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search equipment, location or technician..."
          aria-label="Search maintenance schedules"
        />
        <span>{filteredSchedules.length} schedules</span>
      </div>

      <div className="maintenance-table-wrapper">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Location</th>
              <th>Type</th>
              <th>Date</th>
              <th>Technician</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredSchedules.map((item) => (
              <tr key={item.id}>
                <td>{item.equipment}</td>
                <td>{item.location}</td>
                <td>{item.type}</td>
                <td>
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </td>
                <td>{item.technician}</td>
                <td>
                  <span
                    className={`maintenance-status ${
                      item.status === "Completed"
                        ? "maintenance-status-complete"
                        : item.status === "In Progress"
                          ? "maintenance-status-progress"
                          : "maintenance-status-scheduled"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredSchedules.length === 0 && (
              <tr>
                <td colSpan="6">No matching schedules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="maintenance-demo-note">
        Sample schedules are for demonstration. Database integration will be
        added in a later step.
      </p>
    </section>
  );
}

export default MaintenanceSchedule;
