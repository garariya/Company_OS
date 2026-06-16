import db from "../config/db.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === "ADMIN") {
      // 1. Basic counts
      const [employeeCount, departmentCount, projectCount, taskCount] = await Promise.all([
        db.employee.count(),
        db.department.count(),
        db.project.count(),
        db.task.count()
      ]);

      // 2. Task status distribution
      const [todoTasks, inProgressTasks, doneTasks] = await Promise.all([
        db.task.count({ where: { status: "TODO" } }),
        db.task.count({ where: { status: "IN_PROGRESS" } }),
        db.task.count({ where: { status: "DONE" } })
      ]);

      // 3. Project progress (all projects)
      const projects = await db.project.findMany({
        select: {
          id: true,
          name: true,
          tasks: {
            select: {
              status: true
            }
          }
        }
      });

      const projectProgress = projects.map((p) => {
        const total = p.tasks.length;
        const done = p.tasks.filter((t) => t.status === "DONE").length;
        const todo = p.tasks.filter((t) => t.status === "TODO").length;
        const inProgress = p.tasks.filter((t) => t.status === "IN_PROGRESS").length;
        return {
          id: p.id,
          name: p.name,
          totalTasks: total,
          doneTasks: done,
          todoTasks: todo,
          inProgressTasks: inProgress,
          progressPercentage: total > 0 ? Math.round((done / total) * 100) : 0
        };
      });

      // 4. Employee workload
      const employeesList = await db.employee.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              assignedTasks: {
                select: {
                  status: true
                }
              }
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const employeeWorkload = employeesList.map((emp) => {
        const u = emp.user;
        const tasks = u?.assignedTasks || [];
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === "DONE").length;
        const todo = tasks.filter((t) => t.status === "TODO").length;
        const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;

        return {
          id: u?.id || 0,
          employeeId: emp.id,
          name: `${u?.firstName || ""} ${u?.lastName || ""}`.trim(),
          assignedTasksCount: total,
          todoTasks: todo,
          inProgressTasks: inProgress,
          doneTasks: done,
          departmentId: emp.department?.id || 0,
          departmentName: emp.department?.name || ""
        };
      });

      // 5. Department employee counts
      const departmentsList = await db.department.findMany({
        select: {
          id: true,
          name: true,
          employees: {
            select: {
              id: true
            }
          }
        }
      });

      const departmentAnalytics = departmentsList.map((dept) => ({
        id: dept.id,
        name: dept.name,
        employeeCount: dept.employees.length
      }));

      return res.status(200).json({
        role: "ADMIN",
        employees: employeeCount,
        departments: departmentCount,
        projects: projectCount,
        tasks: taskCount,
        todoTasks,
        inProgressTasks,
        doneTasks,
        projectProgress,
        employeeWorkload,
        departmentAnalytics
      });

    } else if (userRole === "MANAGER") {
      // Fetch projects managed by this manager
      const managedProjects = await db.project.findMany({
        where: {
          createdById: userId
        },
        select: {
          id: true,
          name: true,
          tasks: {
            select: {
              status: true,
              assignedToId: true
            }
          },
          members: {
            select: {
              employeeId: true
            }
          }
        }
      });

      const projectsManagedCount = managedProjects.length;

      // Calculate unique team members
      const employeeIds = new Set();
      managedProjects.forEach((p) => {
        p.members.forEach((m) => {
          employeeIds.add(m.employeeId);
        });
      });
      const teamMembersCount = employeeIds.size;

      // Calculate team tasks & status breakdown
      let totalTeamTasks = 0;
      let managerTodoTasks = 0;
      let managerInProgressTasks = 0;
      let managerDoneTasks = 0;

      const projectProgress = managedProjects.map((p) => {
        const total = p.tasks.length;
        const done = p.tasks.filter((t) => t.status === "DONE").length;
        const todo = p.tasks.filter((t) => t.status === "TODO").length;
        const inProgress = p.tasks.filter((t) => t.status === "IN_PROGRESS").length;

        totalTeamTasks += total;
        managerTodoTasks += todo;
        managerInProgressTasks += inProgress;
        managerDoneTasks += done;

        return {
          id: p.id,
          name: p.name,
          totalTasks: total,
          doneTasks: done,
          todoTasks: todo,
          inProgressTasks: inProgress,
          progressPercentage: total > 0 ? Math.round((done / total) * 100) : 0
        };
      });

      // Fetch team members details and their workloads in managed projects
      const teamMembersList = employeeIds.size > 0 ? await db.employee.findMany({
        where: {
          id: { in: Array.from(employeeIds) }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }) : [];

      const teamMembersWorkload = teamMembersList.map((emp) => {
        let total = 0;
        let todo = 0;
        let inProgress = 0;
        let done = 0;

        managedProjects.forEach((p) => {
          p.tasks.forEach((t) => {
            if (t.assignedToId === emp.userId) {
              total++;
              if (t.status === "TODO") todo++;
              else if (t.status === "IN_PROGRESS") inProgress++;
              else if (t.status === "DONE") done++;
            }
          });
        });

        return {
          id: emp.userId,
          employeeId: emp.id,
          name: `${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`.trim(),
          assignedTasksCount: total,
          todoTasks: todo,
          inProgressTasks: inProgress,
          doneTasks: done
        };
      });

      return res.status(200).json({
        role: "MANAGER",
        projectsManaged: projectsManagedCount,
        teamMembers: teamMembersCount,
        teamTasks: totalTeamTasks,
        todoTasks: managerTodoTasks,
        inProgressTasks: managerInProgressTasks,
        doneTasks: managerDoneTasks,
        projectProgress,
        teamMembersWorkload
      });

    } else if (userRole === "EMPLOYEE") {
      const employeeRecord = await db.employee.findUnique({
        where: { userId }
      });

      const employeeId = employeeRecord?.id;

      // Find projects where they are members
      const memberships = employeeId ? await db.projectMember.findMany({
        where: { employeeId },
        select: { projectId: true }
      }) : [];
      const memberProjectIds = memberships.map((m) => m.projectId);

      // Find tasks assigned to this employee
      const employeeTasks = await db.task.findMany({
        where: { assignedToId: userId },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const taskProjectIds = employeeTasks.map((t) => t.projectId);
      const uniqueProjectIds = Array.from(new Set([...memberProjectIds, ...taskProjectIds]));

      // Load all involved projects
      const projectsInvolved = await db.project.findMany({
        where: {
          id: { in: uniqueProjectIds }
        },
        select: {
          id: true,
          name: true
        }
      });

      const projectProgress = projectsInvolved.map((p) => {
        const pTasks = employeeTasks.filter((t) => t.projectId === p.id);
        const total = pTasks.length;
        const done = pTasks.filter((t) => t.status === "DONE").length;
        const todo = pTasks.filter((t) => t.status === "TODO").length;
        const inProgress = pTasks.filter((t) => t.status === "IN_PROGRESS").length;

        return {
          id: p.id,
          name: p.name,
          totalTasks: total,
          doneTasks: done,
          todoTasks: todo,
          inProgressTasks: inProgress,
          progressPercentage: total > 0 ? Math.round((done / total) * 100) : 0
        };
      });

      const myProjectsCount = uniqueProjectIds.length;
      const myTasksCount = employeeTasks.length;
      const completedTasksCount = employeeTasks.filter((t) => t.status === "DONE").length;
      const pendingTasksCount = employeeTasks.filter((t) => t.status !== "DONE").length;
      const personalCompletionRate = myTasksCount > 0 ? Math.round((completedTasksCount / myTasksCount) * 100) : 0;

      return res.status(200).json({
        role: "EMPLOYEE",
        myProjects: myProjectsCount,
        myTasks: myTasksCount,
        completedTasks: completedTasksCount,
        pendingTasks: pendingTasksCount,
        personalCompletionRate,
        projectProgress
      });
    }

    return res.status(403).json({ message: "Role unauthorized" });

  } catch (error) {
    console.error("Analytics aggregation error:", error);
    return res.status(500).json({ message: "Unable to load analytics." });
  }
};
