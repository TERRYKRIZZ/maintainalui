import { useEffect, useState } from "react";
import "./SpareParts.css";

const initialParts = [
  {
    id: "SP-001",
    name: "Electrical Cable",
    category: "Electrical",
    quantity: 25,
    unit: "metres",
    minimum: 10,
    location: "Maintenance Store",
  },
  {
    id: "SP-002",
    name: "Air Filter",
    category: "HVAC",
    quantity: 4,
    unit: "pieces",
    minimum: 8,
    location: "Maintenance Store",
  },
  {
    id: "SP-003",
    name: "Water Pump Seal",
    category: "Plumbing",
    quantity: 12,
    unit: "pieces",
    minimum: 5,
    location: "Store Room B",
  },
  {
    id: "SP-004",
    name: "Electrical Fuse",
    category: "Electrical",
    quantity: 3,
    unit: "pieces",
    minimum: 10,
    location: "Maintenance Store",
  },
];

function SpareParts() {
  const [parts, setParts] = useState(() => {
  const savedParts = localStorage.getItem("maintainalUI_spareParts");

  return savedParts ? JSON.parse(savedParts) : initialParts;
});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
useEffect(() => {
  localStorage.setItem(
    "maintainalUI_spareParts",
    JSON.stringify(parts)
  );
}, [parts]);
  const [form, setForm] = useState({
    name: "",
    category: "Electrical", 
    quantity: "",
    unit: "pieces",
    minimum: "",
    location: "",
  });

  const lowStockCount = parts.filter(
    (part) => part.quantity <= part.minimum
  ).length;

  const totalUnits = parts.reduce(
    (total, part) => total + part.quantity,
    0
  );

  const filteredParts = parts.filter((part) =>
    `${part.id} ${part.name} ${part.category} ${part.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextNumber =
      Math.max(
        0,
        ...parts.map((part) => Number(part.id.replace("SP-", "")))
      ) + 1;

    const newPart = {
      ...form,
      id: `SP-${String(nextNumber).padStart(3, "0")}`,
      quantity: Number(form.quantity),
      minimum: Number(form.minimum),
    };

    setParts((current) => [...current, newPart]);

    setForm({
      name: "",
      category: "Electrical",
      quantity: "",
      unit: "pieces",
      minimum: "",
      location: "",
    });

    setShowForm(false);
  };

  const updateQuantity = (id) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;

    const value = window.prompt(
      `Enter the new stock quantity for ${part.name}:`,
      String(part.quantity)
    );

    if (value === null || value.trim() === "") return;

    const newQuantity = Number(value);

    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
      window.alert("Please enter a valid quantity of zero or more.");
      return;
    }

    setParts((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <section className="spare-parts-page">
      <div className="spare-parts-heading">
        <div>
          <p className="eyebrow">INVENTORY MANAGEMENT</p>
          <h2>Spare Parts</h2>
          <p className="spare-parts-subtitle">
            Manage replacement components and monitor stock availability.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Add Spare Part
        </button>
      </div>

      <div className="spare-parts-summary">
        <article>
          <span>Part Types</span>
          <strong>{parts.length}</strong>
        </article>

        <article>
          <span>Total Units</span>
          <strong>{totalUnits}</strong>
        </article>

        <article>
          <span>Low Stock Items</span>
          <strong>{lowStockCount}</strong>
        </article>

        <article>
          <span>Out of Stock</span>
          <strong>
            {parts.filter((part) => part.quantity === 0).length}
          </strong>
        </article>
      </div>

      {showForm && (
        <form className="spare-part-form" onSubmit={handleSubmit}>
          <h3>Add a Spare Part</h3>

          <label>
            Part Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="e.g. Generator Belt"
            />
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              <option>Electrical</option>
              <option>HVAC</option>
              <option>Plumbing</option>
              <option>Mechanical</option>
              <option>General</option>
            </select>
          </label>

          <label>
            Quantity Available
            <input
              required
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={(event) =>
                setForm({ ...form, quantity: event.target.value })
              }
              placeholder="e.g. 15"
            />
          </label>

          <label>
            Unit
            <select
              value={form.unit}
              onChange={(event) =>
                setForm({ ...form, unit: event.target.value })
              }
            >
              <option>pieces</option>
              <option>metres</option>
              <option>litres</option>
              <option>packs</option>
              <option>sets</option>
            </select>
          </label>

          <label>
            Minimum Stock Level
            <input
              required
              type="number"
              min="0"
              step="any"
              value={form.minimum}
              onChange={(event) =>
                setForm({ ...form, minimum: event.target.value })
              }
              placeholder="e.g. 5"
            />
          </label>

          <label>
            Storage Location
            <input
              required
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
              placeholder="e.g. Maintenance Store"
            />
          </label>

          <div className="spare-part-form-actions">
            <button type="submit" className="primary-button">
              Save Spare Part
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

      <div className="spare-parts-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search parts, categories or location..."
          aria-label="Search spare parts"
        />
        <span>{filteredParts.length} parts</span>
      </div>

      <div className="spare-parts-table-wrapper">
        <table className="spare-parts-table">
          <thead>
            <tr>
              <th>Part ID</th>
              <th>Spare Part</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Minimum Level</th>
              <th>Location</th>
              <th>Stock Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredParts.map((part) => {
              const isOutOfStock = part.quantity === 0;
              const isLowStock = part.quantity <= part.minimum;

              return (
                <tr key={part.id}>
                  <td className="spare-part-id">{part.id}</td>

                  <td className="spare-part-name">{part.name}</td>

                  <td>{part.category}</td>

                  <td>
                    {part.quantity} {part.unit}
                  </td>

                  <td>
                    {part.minimum} {part.unit}
                  </td>

                  <td>{part.location}</td>

                  <td>
                    <span
                      className={`spare-stock-status ${
                        isOutOfStock
                          ? "stock-out"
                          : isLowStock
                          ? "stock-low"
                          : "stock-available"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : isLowStock
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="spare-update-button"
                      onClick={() => updateQuantity(part.id)}
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredParts.length === 0 && (
              <tr>
                <td colSpan="8">No matching spare parts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="spare-parts-demo-note">
        Sample inventory records are for demonstration. Persistent storage
        and database integration will be added later.
      </p>
    </section>
  );
}

export default SpareParts;
