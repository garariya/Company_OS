import db from "../config/db.js";


// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await db.project.create({
      data: {
        name,
        description,
        createdById: req.user.id
      }
    });

    return res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// GET ALL PROJECTS
export const getProjects = async (req, res) => {
  try {
    const projects = await db.project.findMany({
      include: {
        createdBy: {
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
      projects
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// GET PROJECT BY ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db.project.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        createdBy: true,
        tasks: true,
        members: true
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    return res.status(200).json({
      project
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// UPDATE PROJECT
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      status
    } = req.body;

    const project = await db.project.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const updatedProject =
      await db.project.update({
        where: {
          id: Number(id)
        },
        data: {
          name,
          description,
          status
        }
      });

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


// DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db.project.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    await db.project.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};