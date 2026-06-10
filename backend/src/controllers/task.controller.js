import db from "../config/db.js";


// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedToId,
      priority,
      dueDate
    } = req.body;

    const project = await db.project.findUnique({
      where: {
        id: Number(projectId)
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: Number(assignedToId)
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Assigned user not found"
      });
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        projectId: Number(projectId),
        assignedToId: Number(assignedToId),
        priority,
        dueDate: dueDate
          ? new Date(dueDate)
          : null
      }
    });

    return res.status(201).json({
      message: "Task created successfully",
      task
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};



// GET ALL TASKS
export const getTasks = async (req, res) => {
  try {
    const tasks = await db.task.findMany({
      include: {
        project: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      tasks
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};



// GET TASK BY ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db.task.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        project: true,
        assignedTo: true
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json({
      task
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};



// UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      dueDate
    } = req.body;

    const task = await db.task.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const updatedTask = await db.task.update({
      where: {
        id: Number(id)
      },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate
          ? new Date(dueDate)
          : task.dueDate
      }
    });

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};



// DELETE TASK
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db.task.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    await db.task.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};