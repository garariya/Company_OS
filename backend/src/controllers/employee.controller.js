import db from "../config/db.js";


// CREATE EMPLOYEE
export const createEmployee = async (req, res) => {
  try {
    const {
      userId,
      departmentId,
      designation,
      salary,
      joiningDate
    } = req.body;

    const user = await db.user.findUnique({
      where: {
        id: Number(userId)
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const department =
      await db.department.findUnique({
        where: {
          id: Number(departmentId)
        }
      });

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    const existingEmployee =
      await db.employee.findUnique({
        where: {
          userId: Number(userId)
        }
      });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee already exists"
      });
    }

    const employee =
      await db.employee.create({
        data: {
          userId: Number(userId),
          departmentId: Number(departmentId),
          designation,
          salary: salary
            ? parseFloat(salary)
            : null,
          joiningDate: new Date(joiningDate)
        }
      });

    return res.status(201).json({
      message: "Employee created successfully",
      employee
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// GET ALL EMPLOYEES
export const getEmployees = async (req, res) => {
  try {
    const employees =
      await db.employee.findMany({
        include: {
          user: true,
          department: true
        }
      });

    return res.status(200).json({
      employees
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// GET EMPLOYEE BY ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee =
      await db.employee.findUnique({
        where: {
          id: Number(id)
        },
        include: {
          user: true,
          department: true
        }
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      employee
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// UPDATE EMPLOYEE
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      departmentId,
      designation,
      salary,
      role
    } = req.body;

    const employee =
      await db.employee.findUnique({
        where: {
          id: Number(id)
        },
        include: {
          user: true
        }
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    let roleUpdated = false;
    if (role && role !== employee.user.role) {
      const allowedRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role value"
        });
      }

      await db.user.update({
        where: {
          id: employee.userId
        },
        data: {
          role
        }
      });

      roleUpdated = true;

      // Automatically create a notification
      try {
        await db.notification.create({
          data: {
            userId: employee.userId,
            title: "Role Updated",
            message: `Your role has been changed to ${role}`,
            isRead: false
          }
        });
      } catch (notifErr) {
        console.error("Error creating role updated notification:", notifErr);
      }
    }

    const updatedEmployee =
      await db.employee.update({
        where: {
          id: Number(id)
        },
        data: {
          departmentId:
            departmentId
              ? Number(departmentId)
              : employee.departmentId,

          designation:
            designation ??
            employee.designation,

          salary:
            salary
              ? parseFloat(salary)
              : employee.salary
        },
        include: {
          user: true,
          department: true
        }
      });

    return res.status(200).json({
      message: roleUpdated 
        ? "Employee and role updated successfully" 
        : "Employee updated successfully",
      employee: updatedEmployee
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// DELETE EMPLOYEE
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee =
      await db.employee.findUnique({
        where: {
          id: Number(id)
        }
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    await db.employee.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      message: "Employee deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};