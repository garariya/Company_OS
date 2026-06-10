import React from "react";

function MyTasks() {
  return (
    <div>
      <h2>My Tasks</h2>

      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Priority</th>
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

export default MyTasks;