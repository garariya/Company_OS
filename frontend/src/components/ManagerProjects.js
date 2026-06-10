import React from "react";

function ManagerProjects() {
  return (
    <div>
      <h2>Managed Projects</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {/* map projects here */}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerProjects;