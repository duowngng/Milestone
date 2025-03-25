import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { createAdminClient } from "@/lib/appwrite";

import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { adminMiddleware } from "@/lib/admin-middleware";

import { Task, TaskStatus } from "../../types";
import { Project } from "@/features/projects/types";

const app = new Hono().get(
  "/",
  sessionMiddleware,
  adminMiddleware,
  zValidator(
    "query",
    z.object({
      projectId: z.string().nullish(),
      assigneeId: z.string().nullish(),
      status: z.nativeEnum(TaskStatus).nullish(),
      search: z.string().nullish(),
      dueDate: z.string().nullish(),
    })
  ),
  async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");

    const { projectId, assigneeId, status, search, dueDate } =
      c.req.valid("query");

    const query = [Query.orderDesc("$createdAt")];

    if (projectId) {
      query.push(Query.equal("projectId", projectId));
    }

    if (status) {
      query.push(Query.equal("status", status));
    }

    if (assigneeId) {
      query.push(Query.equal("assigneeId", assigneeId));
    }

    if (dueDate) {
      query.push(Query.equal("dueDate", dueDate));
    }

    if (search) {
      query.push(Query.search("name", search));
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

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
    );

    const assignees = await Promise.all(
      members.documents.map(async (member) => {
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
        ...tasks,
        documents: populatedTasks,
      },
    });
  }
);

export default app;
