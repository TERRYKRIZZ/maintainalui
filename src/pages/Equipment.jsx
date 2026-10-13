
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import "./Equipment.css";

const emptyForm = {
  assetId: "",
  name: "",
  category: "",
  location: "",
  condition: "Operational",
};

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const submittingRef = useRef(false);

  // Load real equipment records from Supabase.
  useEffect(() => {
    async function loadEquipment() {
      try {
        const { data, error } = await supabase
          .from("equipment")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setEquipment(
          (data || []).map((item) => ({
            id: item.id,
            assetId: item.asset_tag || "",
            name: item.name || "",
            category: item.category || "",
            location: item.location || "",
            condition: item.status || "Operational",
          }))
        );
      } catch (error) {
        console.error("Failed to load equipment:", error);
        alert("Could not load equipment: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEquipment();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      item.assetId.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  // Open an existing equipment record for editing.
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      assetId: item.assetId,
      name: item.name,
      category: item.category,
      location: item.location,
      condition: item.condition,
    });
    setShowForm(true);
  };

  // Register new equipment or update an existing record.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSaving(true);

    const wasEditing = editingId !== null;

    try {
      const payload = {
        asset_tag: form.assetId.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        status: form.condition,
      };

      if (
        !payload.asset_tag ||
        !payload.name ||
        !payload.category ||
        !payload.location
      ) {
        alert("Please complete all required fields.");
        return;
      }

      let data;
      let error;

      if (wasEditing) {
        const result = await supabase
          .from("equipment")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from("equipment")
          .insert(payload)
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        alert("Could not save equipment: " + error.message);
        return;
      }

      const savedEquipment = {
        id: data.id,
        assetId: data.asset_tag || "",
        name: data.name || "",
        category: data.category || "",
        location: data.location || "",
        condition: data.status || "Operational",
      };

      if (wasEditing) {
        setEquipment((current) =>
          current.map((item) =>
            item.id === editingId ? savedEquipment : item
          )
        );
      } else {
        setEquipment((current) => [savedEquipment, ...current]);
      }

      resetForm();

      alert(
        wasEditing
          ? "Equipment updated successfully."
          : "Equipment registered successfully."
      );
    } catch (error) {
      console.error("Equipment save failed:", error);
      alert("An unexpected error occurred: " + error.message);
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  };

  // Delete equipment after confirmation.
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.name} (${item.assetId})?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", item.id);

    if (error) {
      alert(
        "Could not delete equipment: " +
          error.message +
          "\n\nCheck whether related maintenance records or database permissions prevent deletion."
      );
      return;
    }

    setEquipment((current) =>
      current.filter((record) => record.id !== item.id)
    );

    if (editingId === item.id) {
      resetForm();
    }

    alert("Equipment deleted successfully.");
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
          type="button"
          className="primary-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setForm({ ...emptyForm });
              setEditingId(null);
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Close Form" : "+ Register Equipment"}
        </button>
      </div>

      {showForm && (
        <form className="equipment-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null
              ? "Edit Equipment"
              : "Register New Equipment"}
          </h3>

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
            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingId !== null
                  ? "Update Equipment"
                  : "Save Equipment"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={isSaving}
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="6">Loading equipment...</td>
              </tr>
            )}

            {!isLoading &&
              filteredEquipment.map((item) => (
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
                  <td>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

            {!isLoading && filteredEquipment.length === 0 && (
              <tr>
                <td colSpan="6">No matching equipment found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Equipment;
