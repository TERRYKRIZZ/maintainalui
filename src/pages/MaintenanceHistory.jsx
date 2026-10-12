
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./MaintenanceHistory.css";

const maintenanceRecords = [
  {
    id: "MH-001",
    equipment: "Main Generator",
    location: "Central Library",
    date: "08 Oct 2026",
    work: "Routine servicing",
    technician: "Maintenance Team",
    status: "Completed",
  },
  {
    id: "MH-002",
    equipment: "Air Conditioning Unit",
    location: "Faculty of Science",
    date: "06 Oct 2026",
    work: "Filter inspection and cleaning",
    technician: "Maintenance Team",
    status: "Completed",
  },
  {
    id: "MH-003",
    equipment: "Water Pump",
    location: "Student Hostel",
    date: "03 Oct 2026",
    work: "Pump inspection",
    technician: "Maintenance Team",
    status: "Completed",
  },
  {
    id: "MH-004",
    equipment: "Laboratory Microscope",
    location: "Teaching Laboratory",
    date: "01 Oct 2026",
    work: "Calibration and inspection",
    technician: "Maintenance Team",
    status: "Completed",
  },
];

function MaintenanceHistory() {
    
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);

  useEffect(() => {
    async function loadMaintenanceHistory() {
      const { data: historyRows, error: historyError } = await supabase
        .from("maintenance_history")
        .select("*")
        .order("service_date", { ascending: false });

      if (historyError) {
        console.error(
          "Failed to load maintenance history:",
          historyError.message
        );
        return;
      }

      const { data: equipmentRows, error: equipmentError } = await supabase
        .from("equipment")
        .select("id, name, location");

      if (equipmentError) {
        console.error(
          "Failed to load equipment details:",
          equipmentError.message
        );
        return;
      }

      const equipmentById = new Map(
        equipmentRows.map((item) => [item.id, item])
      );

      const savedRecords = historyRows.map((item, index) => {
        const linkedEquipment = equipmentById.get(item.equipment_id);

        return {
          id: `MH-${String(index + 1).padStart(3, "0")}`,
          equipment: linkedEquipment?.name || "Unknown equipment",
          location: linkedEquipment?.location || "",
          date: new Date(
            `${item.service_date}T00:00:00`
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          work: item.action_taken,
          technician: item.technician || "Not assigned",
          status: "Completed",
        };
      });

      setMaintenanceRecords(savedRecords);
    }

    loadMaintenanceHistory();
  }, []);

  return (
    <div className="history-page">
      <div className="history-heading">
        <div>
          <p className="eyebrow">MAINTENANCE RECORDS</p>
          <h1>Maintenance History</h1>
          <p className="page-subtitle">
            Review previously completed maintenance activities.
          </p>
        </div>

        <div className="history-total">
          <span>Completed records</span>
          <strong>{maintenanceRecords.length}</strong>
        </div>
      </div>


      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Equipment</th>
              <th>Location</th>
              <th>Date</th>
              <th>Work performed</th>
              <th>Technician</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {maintenanceRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.equipment}</td>
                <td>{record.location}</td>
                <td>{record.date}</td>
                <td>{record.work}</td>
                <td>{record.technician}</td>
                <td>
                  <span className="history-status">
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaintenanceHistory;
