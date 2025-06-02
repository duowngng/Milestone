import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { sessionMiddleware } from "@/lib/session-middleware";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  PROJECT_MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
  WORKSPACE_MEMBERS_ID,
} from "@/config";
import { getWorkspaceMember } from "@/features/members/workspace/utils";
import { MemberRole } from "@/features/members/types";
import { Task, TaskStatus } from "@/features/tasks/types";

import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { getProjectMember } from "@/features/members/project/utils";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const { workspaceId } = c.req.valid("query");

      if (!workspaceId) {
        return c.json({ message: "Missing workspaceId" }, 400);
      }

      const member = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      if (member.role !== MemberRole.MANAGER) {
        const projectMembers = await databases.listDocuments(
          DATABASE_ID,
          PROJECT_MEMBERS_ID,
          [Query.equal("userId", user.$id)]
        );

        const projectIds = projectMembers.documents.map((pm) => pm.projectId);

        if (projectIds.length === 0) {
          return c.json({ data: { documents: [], total: 0 } });
        }

        const projects = await databases.listDocuments<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          [
            Query.equal("workspaceId", workspaceId),
            Query.equal("$id", projectIds),
          ]
        );

        return c.json({ data: projects });
      }

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
      );

      return c.json({ data: projects });
    }
  )
  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const workspaceMember = await getWorkspaceMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!workspaceMember) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    if (workspaceMember.role !== MemberRole.MANAGER) {
      const projectMember = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });

      if (!projectMember) {
        return c.json({ message: "Unauthorized" }, 401);
      }
    }

    return c.json({ data: project });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.MANAGER) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        }
      );

      return c.json({ data: project });
    }
  )
  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.MANAGER) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      } else {
        uploadedImageUrl = image;
      }

      const project = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({ data: project });
    }
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { projectId } = c.req.param();

    const member = await getProjectMember({
      databases,
      projectId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.MANAGER) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("projectId", projectId),
    ]);

    for (const task of tasks.documents) {
      await databases.deleteDocument(DATABASE_ID, TASKS_ID, task.$id);
    }

    await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

    return c.json({ data: { $id: projectId } });
  })
  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );
    const workspaceMember = await getWorkspaceMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });
    if (!workspaceMember) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    if (workspaceMember.role !== MemberRole.MANAGER) {
      const projectMember = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });
      if (!projectMember) {
        return c.json({ message: "Unauthorized" }, 401);
      }
    }

    const now = new Date();

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const batchSize = 100;

    let thisMonthOffset = 0;
    let thisMonthTasks: Task[] = [];
    let thisMonthTaskCount = 0;

    while (true) {
      const batch = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("startDate", thisMonthStart.toISOString()),
        Query.lessThanEqual("startDate", thisMonthEnd.toISOString()),
        Query.limit(batchSize),
        Query.offset(thisMonthOffset),
      ]);

      thisMonthTasks = thisMonthTasks.concat(batch.documents);

      if (thisMonthOffset === 0) {
        thisMonthTaskCount = batch.total;
      }

      if (batch.documents.length < batchSize) {
        break;
      }

      thisMonthOffset += batchSize;
    }

    let lastMonthOffset = 0;
    let lastMonthTasks: Task[] = [];
    let lastMonthTaskCount = 0;

    while (true) {
      const batch = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("startDate", lastMonthStart.toISOString()),
        Query.lessThanEqual("startDate", lastMonthEnd.toISOString()),
        Query.limit(batchSize),
        Query.offset(lastMonthOffset),
      ]);

      lastMonthTasks = lastMonthTasks.concat(batch.documents);

      if (lastMonthOffset === 0) {
        lastMonthTaskCount = batch.total;
      }

      if (batch.documents.length < batchSize) {
        break;
      }

      lastMonthOffset += batchSize;
    }

    const monthlyTaskCount = thisMonthTaskCount;
    const monthlyTaskDifference = thisMonthTaskCount - lastMonthTaskCount;

    const thisMonthAssignedTasks = thisMonthTasks.filter(
      (task) => task.assigneeId === workspaceMember.$id
    );
    const lastMonthAssignedTasks = lastMonthTasks.filter(
      (task) => task.assigneeId === workspaceMember.$id
    );
    const monthlyAssignedTaskCount = thisMonthAssignedTasks.length;
    const monthlyAssignedTaskDifference =
      monthlyAssignedTaskCount - lastMonthAssignedTasks.length;

    const thisMonthIncompleteTasks = thisMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE
    );
    const lastMonthIncompleteTasks = lastMonthTasks.filter(
      (task) => task.status !== TaskStatus.DONE
    );
    const monthlyIncompleteTaskCount = thisMonthIncompleteTasks.length;
    const monthlyIncompleteTaskDifference =
      monthlyIncompleteTaskCount - lastMonthIncompleteTasks.length;

    const thisMonthCompletedTasks = thisMonthTasks.filter(
      (task) => task.status === TaskStatus.DONE
    );
    const lastMonthCompletedTasks = lastMonthTasks.filter(
      (task) => task.status === TaskStatus.DONE
    );
    const monthlyCompletedTaskCount = thisMonthCompletedTasks.length;
    const monthlyCompletedTaskDifference =
      monthlyCompletedTaskCount - lastMonthCompletedTasks.length;

    const thisMonthOverdueTasks = thisMonthTasks.filter(
      (task) => new Date(task.dueDate) < now && task.status !== TaskStatus.DONE
    );
    const lastMonthOverdueTasks = lastMonthTasks.filter(
      (task) => new Date(task.dueDate) < now && task.status !== TaskStatus.DONE
    );
    const monthlyOverdueTaskCount = thisMonthOverdueTasks.length;
    const monthlyOverdueTaskDifference =
      monthlyOverdueTaskCount - lastMonthOverdueTasks.length;

    // Project tasks count
    let offset = 0;
    let allTasks: Task[] = [];
    let totalTaskCount = 0;

    while (true) {
      const batch = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal("projectId", projectId),
        Query.limit(batchSize),
        Query.offset(offset),
      ]);

      allTasks = allTasks.concat(batch.documents);

      if (offset === 0) {
        totalTaskCount = batch.total;
      }

      if (batch.documents.length < batchSize) {
        break;
      }

      offset += batchSize;
    }

    const totalCompletedTaskCount = allTasks.filter(
      (t) => t.status === TaskStatus.DONE
    ).length;
    const totalOverdueTaskCount = allTasks.filter(
      (t) => new Date(t.dueDate) < now && t.status !== TaskStatus.DONE
    ).length;
    const totalOnTimeTaskCount =
      totalTaskCount - totalCompletedTaskCount - totalOverdueTaskCount;

    // Group tasks by status
    const groupByStatus: Record<string, number> = {};
    for (const t of allTasks) {
      const key = t.status;
      if (!groupByStatus[key]) {
        groupByStatus[key] = 0;
      }
      groupByStatus[key]++;
    }

    // 4. Group tasks by priority
    const groupByPriority: Record<string, number> = {};
    for (const t of allTasks) {
      const key = t.priority;
      if (!groupByPriority[key]) {
        groupByPriority[key] = 0;
      }
      groupByPriority[key]++;
    }

    // Team workload and progress
    type WorkloadItem = {
      total: number;
      completed: number;
      onTime: number;
      overdue: number;
      assignee?: {
        name: string;
        email: string;
        userId: string;
      };
    };
    const workloadMap: Record<string, WorkloadItem> = {};

    for (const t of allTasks) {
      const assignee = t.assigneeId;
      if (!workloadMap[assignee]) {
        workloadMap[assignee] = {
          total: 0,
          completed: 0,
          onTime: 0,
          overdue: 0,
        };
      }
      workloadMap[assignee].total++;

      if (t.status === TaskStatus.DONE) {
        workloadMap[assignee].completed++;
      } else {
        if (new Date(t.dueDate) < now) {
          workloadMap[assignee].overdue++;
        } else {
          workloadMap[assignee].onTime++;
        }
      }
    }

    const { users } = await createAdminClient();
    const assigneeIds = Object.keys(workloadMap);

    const members = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_MEMBERS_ID,
      assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
    );

    await Promise.all(
      members.documents.map(async (member) => {
        if (workloadMap[member.$id]) {
          const user = await users.get(member.userId);
          workloadMap[member.$id].assignee = {
            name: user.name || user.email,
            email: user.email,
            userId: user.$id,
          };
        }
      })
    );

    return c.json({
      data: {
        monthlyTaskCount,
        monthlyTaskDifference,

        monthlyAssignedTaskCount,
        monthlyAssignedTaskDifference,

        monthlyIncompleteTaskCount,
        monthlyIncompleteTaskDifference,

        monthlyCompletedTaskCount,
        monthlyCompletedTaskDifference,

        monthlyOverdueTaskCount,
        monthlyOverdueTaskDifference,

        totalTaskCount,
        totalCompletedTaskCount,
        totalOnTimeTaskCount,
        totalOverdueTaskCount,

        groupByStatus,
        groupByPriority,

        workload: Object.entries(workloadMap).map(([assigneeId, item]) => ({
          assigneeId,
          ...item,
        })),
      },
    });
  });

export default app;
