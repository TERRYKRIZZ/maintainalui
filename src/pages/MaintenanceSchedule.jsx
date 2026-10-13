
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import "./MaintenanceSchedule.css";

const emptyForm = {
  equipment: "",
  location: "",
  type: "Preventive",
  date: "",
  technician: "",
  status: "Scheduled",
};

function MaintenanceSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const submittingRef = useRef(false);

  // Load saved schedules and equipment from Supabase.
  useEffect(() => {
    async function loadSchedules() {
      try {
        const { data: scheduleRows, error: scheduleError } =
          await supabase
            .from("maintenance_schedules")
            .select("*")
            .order("created_at", { ascending: false });

        if (scheduleError) throw scheduleError;

        const { data: equipmentRows, error: equipmentError } =
          await supabase
            .from("equipment")
            .select("id, name, location");

        if (equipmentError) throw equipmentError;

        const equipmentById = new Map(
          (equipmentRows || []).map((item) => [item.id, item])
        );

        const savedSchedules = (scheduleRows || []).map((item) => {
          const equipment = equipmentById.get(item.equipment_id);

          return {
            id: item.id,
            equipment: equipment?.name || item.title || "Unknown equipment",
            location:
              equipment?.location ||
              (item.notes || "").replace(/^Location:\s*/, ""),
            type: item.maintenance_type || "Preventive",
            date: item.scheduled_date || "",
            technician: item.assigned_to || "",
            status: item.status || "Scheduled",
          };
        });

        setSchedules(savedSchedules);
      } catch (error) {
        console.error("Failed to load maintenance schedules:", error);
        alert("Could not load maintenance schedules: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSchedules();
  }, []);

  const filteredSchedules = schedules.filter((item) =>
    `${item.equipment} ${item.location} ${item.technician} ${item.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Reset the form.
  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingScheduleId(null);
    setShowForm(false);
  };

  // Open an existing schedule for editing.
  const handleEdit = (item) => {
    setEditingScheduleId(item.id);
    setForm({
      equipment: item.equipment || "",
      location: item.location || "",
      type: item.type || "Preventive",
      date: item.date || "",
      technician: item.technician || "",
      status: item.status || "Scheduled",
    });
    setShowForm(true);
  };

  // Create a schedule or update an existing one.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSaving(true);

    const wasEditing = editingScheduleId !== null;

    try {
      const equipmentName = form.equipment.trim();

      if (
        !equipmentName ||
        !form.location.trim() ||
        !form.date ||
        !form.technician.trim()
      ) {
        alert("Please complete all required fields.");
        return;
      }

      const { data: equipmentRecord, error: equipmentError } =
        await supabase
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
          `Equipment "${equipmentName}" is not registered. ` +
            "Please register it first and use its exact name."
        );
        return;
      }

      const schedulePayload = {
        equipment_id: equipmentRecord.id,
        title: `${form.type} maintenance - ${equipmentName}`,
        maintenance_type: form.type,
        scheduled_date: form.date,
        assigned_to: form.technician.trim(),
        status: form.status,
        notes: `Location: ${form.location.trim()}`,
      };

      let data;
      let error;

      if (wasEditing) {
        const result = await supabase
          .from("maintenance_schedules")
          .update(schedulePayload)
          .eq("id", editingScheduleId)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from("maintenance_schedules")
          .insert(schedulePayload)
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        alert("Could not save maintenance schedule: " + error.message);
        return;
      }

      const savedSchedule = {
        id: data.id,
        equipment: equipmentName,
        location: form.location.trim(),
        type: data.maintenance_type || form.type,
        date: data.scheduled_date,
        technician: data.assigned_to || "",
        status: data.status || "Scheduled",
      };

      if (wasEditing) {
        setSchedules((current) =>
          current.map((item) =>
            item.id === editingScheduleId ? savedSchedule : item
          )
        );
      } else {
        setSchedules((current) => [savedSchedule, ...current]);
      }

      resetForm();

      alert(
        wasEditing
          ? "Maintenance schedule updated successfully."
          : "Maintenance schedule saved successfully."
      );
    } catch (error) {
      console.error("Maintenance schedule save failed:", error);
      alert("An unexpected error occurred while saving: " + error.message);
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  };

  // Update a schedule's status in Supabase.
  const handleStatusChange = async (id, newStatus) => {
    const previousSchedules = schedules;

    setSchedules((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    const { error } = await supabase
      .from("maintenance_schedules")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setSchedules(previousSchedules);
      alert("Could not update status: " + error.message);
    }
  };

  // Delete a schedule from Supabase after confirmation.
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete the maintenance schedule for ${item.equipment} on ${item.date}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("maintenance_schedules")
      .delete()
      .eq("id", item.id);

    if (error) {
      alert("Could not delete schedule: " + error.message);
      return;
    }

    setSchedules((current) =>
      current.filter((schedule) => schedule.id !== item.id)
    );

    if (editingScheduleId === item.id) {
      resetForm();
    }

    alert("Maintenance schedule deleted successfully.");
  };

  return (
    <section className="maintenance-page">
      <div className="maintenance-heading">
        <div>
          <p className="eyebrow">PLANNING &amp; PREVENTION</p>
          <h2>Maintenance Schedule</h2>
          <p className="maintenance-subtitle">
            Plan equipment servicing and track upcoming maintenance
            activities.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            if (showForm && editingScheduleId !== null) {
              resetForm();
            } else if (showForm) {
              resetForm();
            } else {
              setForm({ ...emptyForm });
              setEditingScheduleId(null);
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Close Form" : "+ Schedule Maintenance"}
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
          <h3>
            {editingScheduleId !== null
              ? "Edit Maintenance Schedule"
              : "Create Maintenance Schedule"}
          </h3>

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
            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingScheduleId !== null
                  ? "Update Schedule"
                  : "Save Schedule"}
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7">Loading maintenance schedules...</td>
              </tr>
            )}

            {!isLoading &&
              filteredSchedules.map((item) => (
                <tr key={item.id}>
                  <td>{item.equipment}</td>
                  <td>{item.location}</td>
                  <td>{item.type}</td>
                  <td>
                    {item.date
                      ? new Date(`${item.date}T00:00:00`).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>
                  <td>{item.technician}</td>
                  <td>
                    <select
                      className="maintenance-status-select"
                      value={item.status}
                      aria-label={`Update status for ${item.equipment}`}
                      onChange={(event) =>
                        handleStatusChange(item.id, event.target.value)
                      }
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <div className="maintenance-row-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && filteredSchedules.length === 0 && (
              <tr>
                <td colSpan="7">No matching schedules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MaintenanceSchedule;
