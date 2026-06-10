import db from "../config/db.js";


// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Department name is required"
      });
    }

    const existingDepartment =
      await db.department.findUnique({
        where: {
          name
        }
      });

    if (existingDepartment) {
      return res.status(400).json({
        message: "Department already exists"
      });
    }

    const department =
      await db.department.create({
        data: {
          name
        }
      });

    return res.status(201).json({
      message: "Department created successfully",
      department
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// GET ALL DEPARTMENTS
export const getDepartments = async (req, res) => {
  try {
    const departments =
      await db.department.findMany({
        orderBy: {
          createdAt: "desc"
        }
      });

    return res.status(200).json({
      departments
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// GET DEPARTMENT BY ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department =
      await db.department.findUnique({
        where: {
          id: Number(id)
        }
      });

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    return res.status(200).json({
      department
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// UPDATE DEPARTMENT
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const department =
      await db.department.findUnique({
        where: {
          id: Number(id)
        }
      });

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    const updatedDepartment =
      await db.department.update({
        where: {
          id: Number(id)
        },
        data: {
          name
        }
      });

    return res.status(200).json({
      message: "Department updated successfully",
      department: updatedDepartment
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// DELETE DEPARTMENT
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department =
      await db.department.findUnique({
        where: {
          id: Number(id)
        }
      });

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    await db.department.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      message: "Department deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};