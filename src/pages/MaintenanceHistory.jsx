
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

      <div className="history-notice">
        These are sample records for demonstration. Replace them with
        verified maintenance records when available.
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
