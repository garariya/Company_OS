import React from "react";

function ManagerTasks() {
  return (
    <div>
      <h2>Team Tasks</h2>

      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Assigned To</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {/* map tasks */}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerTasks;