import { z } from "zod";
import { Hono } from "hono";
import { Query, ID } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { createAdminClient } from "@/lib/appwrite";

import {
  DATABASE_ID,
  WORKSPACE_MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
} from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { adminMiddleware } from "@/lib/admin-middleware";

import { Task, TaskStatus, TaskPriority } from "../../types";
import { Project } from "@/features/projects/types";
import { createTaskSchema } from "../../schemas";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "query",
      z.object({
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        priority: z.nativeEnum(TaskPriority).nullish(),
        name: z.string().nullish(),
        startDate: z.string().nullish(),
        dueDate: z.string().nullish(),
        progress: z.string().nullish(),
        createdAt: z.string().nullish(),
        updatedAt: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");

      const {
        projectId,
        assigneeId,
        status,
        priority,
        name,
        startDate,
        dueDate,
        progress,
        createdAt,
        updatedAt,
      } = c.req.valid("query");

      const query = [Query.orderDesc("$createdAt")];

      if (projectId) {
        query.push(Query.equal("projectId", projectId));
      }

      if (status) {
        query.push(Query.equal("status", status));
      }

      if (priority) {
        query.push(Query.equal("priority", priority));
      }

      if (assigneeId) {
        query.push(Query.equal("assigneeId", assigneeId));
      }

      if (startDate) {
        try {
          const [from, to] = decodeURIComponent(startDate).split(",");
          if (from) query.push(Query.greaterThanEqual("startDate", from));
          if (to) query.push(Query.lessThanEqual("startDate", to));
        } catch (error) {
          console.error("Invalid startDate format", error);
        }
      }

      if (dueDate) {
        try {
          const [from, to] = decodeURIComponent(dueDate).split(",");
          if (from) query.push(Query.greaterThanEqual("dueDate", from));
          if (to) query.push(Query.lessThanEqual("dueDate", to));
        } catch (error) {
          console.error("Invalid dueDate format", error);
        }
      }

      if (progress) {
        query.push(Query.equal("progress", parseInt(progress)));
      }

      if (name) query.push(Query.contains("name", name));

      if (createdAt) {
        try {
          const [from, to] = decodeURIComponent(createdAt).split(",");
          if (from) query.push(Query.greaterThanEqual("$createdAt", from));
          if (to) query.push(Query.lessThanEqual("$createdAt", to));
        } catch (error) {
          console.error("Invalid createdAt format", error);
        }
      }

      if (updatedAt) {
        try {
          const [from, to] = decodeURIComponent(updatedAt).split(",");
          if (from) query.push(Query.greaterThanEqual("$updatedAt", from));
          if (to) query.push(Query.lessThanEqual("$updatedAt", to));
        } catch (error) {
          console.error("Invalid updatedAt format", error);
        }
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );

      const workspaceMembers = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
      );

      const assignees = await Promise.all(
        workspaceMembers.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );

        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({
        data: {
          total: tasks.total,
          documents: populatedTasks,
        },
      });
    }
  )
  .get("/:taskId", sessionMiddleware, adminMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    const member = await databases.getDocument(
      DATABASE_ID,
      WORKSPACE_MEMBERS_ID,
      task.assigneeId
    );

    const user = await users.get(member.userId);

    const assignee = {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };

    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })
  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const databases = c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        progress,
        priority,
        description,
      } = c.req.valid("json");

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ]
      );

      const newPosition =
        highestPositionTask?.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          startDate,
          dueDate,
          assigneeId,
          progress: parseInt(progress),
          priority,
          position: newPosition,
          description,
        }
      );

      return c.json({ data: task });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    adminMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const databases = c.get("databases");
      const { taskId } = c.req.param();
      const {
        name,
        status,
        workspaceId,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        progress,
        priority,
        description,
      } = c.req.valid("json");

      const task = await databases.updateDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          name,
          status,
          workspaceId,
          projectId,
          startDate,
          dueDate,
          assigneeId,
          progress: progress !== undefined ? parseInt(progress) : undefined,
          priority,
          description,
        }
      );

      return c.json({ data: task });
    }
  )
  .delete("/:taskId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: taskId } });
  })
  .post(
    "/bulk-update",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, {
            status,
            position,
          });
        })
      );

      return c.json({ data: updatedTasks });
    }
  );

export default app;
