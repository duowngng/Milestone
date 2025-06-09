import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import {
  DATABASE_ID,
  WORKSPACES_ID,
  WORKSPACE_MEMBERS_ID,
  IMAGES_BUCKET_ID,
  TASKS_ID,
  PROJECTS_ID,
  PROJECT_MEMBERS_ID,
  MILESTONES_ID,
  HISTORIES_ID,
} from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { generateInviteCode } from "@/lib/utils";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";

import { MemberRole } from "@/features/members/types";
import { Task, TaskStatus } from "@/features/tasks/types";
import { getWorkspaceMember } from "@/features/members/workspace/utils";
import { Workspace } from "../types";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const workspaceMembers = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );

    if (workspaceMembers.total === 0) {
      const response = { data: { documents: [], total: 0 } };
      return c.json(response);
    }

    const workspaceIds = workspaceMembers.documents.map(
      (member) => member.workspaceId
    );

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );

    return c.json({ data: workspaces });
  })

  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const member = await getWorkspaceMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })

  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
      },
    });
  })

  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

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

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(6),
        }
      );

      await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.MANAGER,
        }
      );

      return c.json({ data: workspace });
    }
  )

  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getWorkspaceMember({
        databases,
        workspaceId,
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

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({ data: workspace });
    }
  )

  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getWorkspaceMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.MANAGER) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
    ]);

    for (const task of tasks.documents) {
      const histories = await databases.listDocuments(
        DATABASE_ID,
        HISTORIES_ID,
        [Query.equal("taskId", task.$id)]
      );

      for (const history of histories.documents) {
        await databases.deleteDocument(DATABASE_ID, HISTORIES_ID, history.$id);
      }

      await databases.deleteDocument(DATABASE_ID, TASKS_ID, task.$id);
    }

    const milestones = await databases.listDocuments(
      DATABASE_ID,
      MILESTONES_ID,
      [Query.equal("workspaceId", workspaceId)]
    );

    for (const milestone of milestones.documents) {
      await databases.deleteDocument(DATABASE_ID, MILESTONES_ID, milestone.$id);
    }

    const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
      Query.equal("workspaceId", workspaceId),
    ]);

    for (const project of projects.documents) {
      const projectMembers = await databases.listDocuments(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        [Query.equal("projectId", project.$id)]
      );

      for (const projectMember of projectMembers.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          PROJECT_MEMBERS_ID,
          projectMember.$id
        );
      }

      await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, project.$id);
    }

    const workspaceMembers = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_MEMBERS_ID,
      [Query.equal("workspaceId", workspaceId)]
    );

    for (const workspaceMember of workspaceMembers.documents) {
      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        workspaceMember.$id
      );
    }

    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    return c.json({ data: { $id: workspaceId } });
  })

  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getWorkspaceMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.MANAGER) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
      {
        inviteCode: generateInviteCode(6),
      }
    );

    return c.json({ data: workspace });
  })

  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role: MemberRole.MEMBER,
        }
      );

      return c.json({ data: workspace });
    }
  )

  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getWorkspaceMember({
      databases,
      workspaceId,
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
    const batchSize = 100;

    let thisMonthOffset = 0;
    let thisMonthTasks: Task[] = [];
    let thisMonthTaskCount = 0;

    while (true) {
      const batch = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal("workspaceId", workspaceId),
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
        Query.equal("workspaceId", workspaceId),
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
      (task) => task.assigneeId === member.$id
    );

    const lastMonthAssignedTasks = lastMonthTasks.filter(
      (task) => task.assigneeId === member.$id
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
      },
    });
  });

export default app;
