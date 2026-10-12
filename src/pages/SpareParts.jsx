import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./SpareParts.css";

function SpareParts() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Electrical",
    quantity: "",
    unit: "pieces",
    minimum: "",
    location: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadParts() {
      const { data, error } = await supabase
        .from("spare_parts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load spare parts:", error.message);
        setParts([]);
        return;
      }

      const savedParts = (data || []).map((item) => ({
        id: item.part_number,
        name: item.name,
        category: item.category || "General",
        quantity: Number(item.quantity),
        unit: item.unit || "pieces",
        minimum: Number(item.reorder_level),
        location: item.location || "",
      }));

      setParts(savedParts);
    }

    loadParts();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const minimum = Number(form.minimum);

    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isInteger(minimum) ||
      minimum < 0
    ) {
      window.alert(
        "Enter a part name and location, and use whole numbers of zero or more for quantity and minimum stock."
      );
      return;
    }

    const existingNumbers = parts
      .map((part) => String(part.id).match(/^SP-(\d+)$/))
      .filter(Boolean)
      .map((match) => Number(match[1]));
    const nextNumber = Math.max(0, ...existingNumbers) + 1;
    const partNumber = `SP-${String(nextNumber).padStart(3, "0")}`;

    const { data, error } = await supabase
      .from("spare_parts")
      .insert({
        part_number: partNumber,
        name: form.name.trim(),
        category: form.category,
        quantity,
        unit: form.unit,
        reorder_level: minimum,
        location: form.location.trim(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to save spare part:", error.message);
      window.alert(`Could not save spare part: ${error.message}`);
      return;
    }

    const newPart = {
      id: data.part_number,
      name: data.name,
      category: data.category || "General",
      quantity: Number(data.quantity),
      unit: data.unit || "pieces",
      minimum: Number(data.reorder_level),
      location: data.location || "",
    };

    setParts((current) => [newPart, ...current]);
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

  const updateQuantity = async (id) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;

    const value = window.prompt(
      `Enter the new stock quantity for ${part.name}:`,
      String(part.quantity)
    );

    if (value === null || value.trim() === "") return;

    const newQuantity = Number(value);

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      window.alert("Please enter a whole-number quantity of zero or more.");
      return;
    }

    const { data, error } = await supabase
      .from("spare_parts")
      .update({ quantity: newQuantity })
      .eq("part_number", id)
      .select("part_number, quantity")
      .single();

    if (error) {
      console.error("Failed to update spare-part quantity:", error.message);
      window.alert(`Could not update stock: ${error.message}`);
      return;
    }

    setParts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Number(data.quantity) } : item
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
          <strong>{parts.filter((part) => part.quantity === 0).length}</strong>
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
              step="1"
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
              step="1"
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
        Inventory records are loaded from the database. Stock changes are saved
        when made by an authenticated user.
      </p>
    </section>
  );
}

export default SpareParts;
