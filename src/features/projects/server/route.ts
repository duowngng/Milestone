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
} from "@/config";
import { getWorkspaceMember } from "@/features/members/workspace/utils";
import { MemberRole } from "@/features/members/types";
import { TaskStatus } from "@/features/tasks/types";

import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { getProjectMember } from "@/features/members/project/utils";

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

    const member = await getWorkspaceMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ message: "Unauthorized" }, 401);
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

        const arrayBuffer = await storage.getFilePreview(
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

        const arrayBuffer = await storage.getFilePreview(
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

    const member = await getWorkspaceMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("startDate", thisMonthStart.toISOString()),
        Query.lessThanEqual("startDate", thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("startDate", lastMonthStart.toISOString()),
        Query.lessThanEqual("startDate", lastMonthEnd.toISOString()),
      ]
    );

    const taskCount = thisMonthTasks.total;
    const taskDifferece = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = thisMonthTasks.documents.filter(
      (task) => task.assigneeId === member.$id
    );

    const lastMonthAssignedTasks = lastMonthTasks.documents.filter(
      (task) => task.assigneeId === member.$id
    );

    const assignedTaskCount = thisMonthAssignedTasks.length;
    const assignedTaskDifferece =
      assignedTaskCount - lastMonthAssignedTasks.length;

    const thisMonthIncompleteTasks = thisMonthTasks.documents.filter(
      (task) => task.status !== TaskStatus.DONE
    );

    const lastMonthIncompleteTasks = lastMonthTasks.documents.filter(
      (task) => task.status !== TaskStatus.DONE
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.length;
    const incompleteTaskDifferece =
      incompleteTaskCount - lastMonthIncompleteTasks.length;

    const thisMonthCompletedTasks = thisMonthTasks.documents.filter(
      (task) => task.status === TaskStatus.DONE
    );

    const lastMonthCompletedTasks = lastMonthTasks.documents.filter(
      (task) => task.status === TaskStatus.DONE
    );

    const completedTaskCount = thisMonthCompletedTasks.length;
    const completedTaskDifferece =
      completedTaskCount - lastMonthCompletedTasks.length;

    const thisMonthOverdueTasks = thisMonthTasks.documents.filter(
      (task) => new Date(task.dueDate) < now && task.status !== TaskStatus.DONE
    );

    const lastMonthOverdueTasks = lastMonthTasks.documents.filter(
      (task) => new Date(task.dueDate) < now && task.status !== TaskStatus.DONE
    );

    const overdueTaskCount = thisMonthOverdueTasks.length;
    const overdueTaskDifferece =
      overdueTaskCount - lastMonthOverdueTasks.length;

    return c.json({
      data: {
        taskCount,
        taskDifferece,
        assignedTaskCount,
        assignedTaskDifferece,
        incompleteTaskCount,
        incompleteTaskDifferece,
        completedTaskCount,
        completedTaskDifferece,
        overdueTaskCount,
        overdueTaskDifferece,
      },
    });
  });

export default app;
