
import { useState } from "react";
import "./Equipment.css";

const startingEquipment = [
  {
    id: 1,
    assetId: "EQ-001",
    name: "Main Generator",
    category: "Power Equipment",
    location: "Central Library",
    condition: "Operational",
  },
  {
    id: 2,
    assetId: "EQ-002",
    name: "Air Conditioning Unit",
    category: "HVAC",
    location: "Faculty of Science",
    condition: "Needs Attention",
  },
  {
    id: 3,
    assetId: "EQ-003",
    name: "Water Pump",
    category: "Plumbing",
    location: "Student Hostel",
    condition: "Operational",
  },
];

function Equipment() {
  const [equipment, setEquipment] = useState(startingEquipment);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetId: "",
    name: "",
    category: "",
    location: "",
    condition: "Operational",
  });

  const filteredEquipment = equipment.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      item.assetId.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const newEquipment = {
      ...form,
      id: Date.now(),
    };

    setEquipment((current) => [...current, newEquipment]);

    setForm({
      assetId: "",
      name: "",
      category: "",
      location: "",
      condition: "Operational",
    });

    setShowForm(false);
  };

  return (
    <section className="equipment-page">
      <div className="equipment-heading">
        <div>
          <p className="eyebrow">ASSET MANAGEMENT</p>
          <h2>Equipment Management</h2>
          <p className="equipment-subtitle">
            Register, search and monitor campus equipment.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Register Equipment
        </button>
      </div>

      {showForm && (
        <form className="equipment-form" onSubmit={handleSubmit}>
          <h3>Register New Equipment</h3>

          <label>
            Asset ID
            <input
              required
              value={form.assetId}
              onChange={(event) =>
                setForm({ ...form, assetId: event.target.value })
              }
              placeholder="e.g. EQ-004"
            />
          </label>

          <label>
            Equipment Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Enter equipment name"
            />
          </label>

          <label>
            Category
            <input
              required
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              placeholder="e.g. Electrical"
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
            Condition
            <select
              value={form.condition}
              onChange={(event) =>
                setForm({ ...form, condition: event.target.value })
              }
            >
              <option>Operational</option>
              <option>Needs Attention</option>
              <option>Under Maintenance</option>
            </select>
          </label>

          <div className="equipment-form-actions">
            <button type="submit" className="primary-button">
              Save Equipment
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

      <div className="equipment-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, asset ID or location..."
          aria-label="Search equipment"
        />

        <span>{filteredEquipment.length} equipment records</span>
      </div>

      <div className="equipment-table-wrapper">
        <table className="equipment-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Equipment</th>
              <th>Category</th>
              <th>Location</th>
              <th>Condition</th>
            </tr>
          </thead>

          <tbody>
            {filteredEquipment.map((item) => (
              <tr key={item.id}>
                <td className="order-id">{item.assetId}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.location}</td>
                <td>
                  <span
                    className={`equipment-condition ${
                      item.condition === "Operational"
                        ? "condition-good"
                        : item.condition === "Needs Attention"
                          ? "condition-warning"
                          : "condition-maintenance"
                    }`}
                  >
                    {item.condition}
                  </span>
                </td>
              </tr>
            ))}

            {filteredEquipment.length === 0 && (
              <tr>
                <td colSpan="5">No matching equipment found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="equipment-demo-note">
        Demonstration records only. Replace these with verified equipment
        records when the database is connected.
      </p>
    </section>
  );
}

export default Equipment;
