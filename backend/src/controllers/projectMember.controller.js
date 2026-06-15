import db from "../config/db.js";

// POST /api/projects/:projectId/members
export const assignEmployeeToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: Number(projectId) }
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify employee exists
    const employee = await db.employee.findUnique({
      where: { id: Number(employeeId) }
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prevent duplicate assignment
    const existingMember = await db.projectMember.findUnique({
      where: {
        projectId_employeeId: {
          projectId: Number(projectId),
          employeeId: Number(employeeId)
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        message: "Employee is already assigned to this project"
      });
    }

    // Create ProjectMember record
    await db.projectMember.create({
      data: {
        projectId: Number(projectId),
        employeeId: Number(employeeId)
      }
    });

    return res.status(200).json({
      message: "Employee assigned successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// GET /api/projects/:projectId/members
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: Number(projectId) }
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const members = await db.projectMember.findMany({
      where: { projectId: Number(projectId) },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json(members);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// DELETE /api/projects/:projectId/members/:employeeId
export const removeEmployeeFromProject = async (req, res) => {
  try {
    const { projectId, employeeId } = req.params;

    // Verify membership exists
    const membership = await db.projectMember.findUnique({
      where: {
        projectId_employeeId: {
          projectId: Number(projectId),
          employeeId: Number(employeeId)
        }
      }
    });

    if (!membership) {
      return res.status(404).json({
        message: "Membership not found"
      });
    }

    // Delete ProjectMember record
    await db.projectMember.delete({
      where: {
        projectId_employeeId: {
          projectId: Number(projectId),
          employeeId: Number(employeeId)
        }
      }
    });

    return res.status(200).json({
      message: "Employee removed from project"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// GET /api/employees/:employeeId/projects
export const getProjectsOfEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify employee exists
    const employee = await db.employee.findUnique({
      where: { id: Number(employeeId) }
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const memberships = await db.projectMember.findMany({
      where: { employeeId: Number(employeeId) },
      include: {
        project: true
      }
    });

    const projects = memberships.map(m => m.project);

    return res.status(200).json({
      projects
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
