import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";

import {
  DATABASE_ID,
  MEMBERS_ID,
  TASKS_ID,
  HISTORIES_ID,
  PROJECTS_ID,
} from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createHistorySchema } from "../schemas";
import { History } from "../types";

const app = new Hono()
  .get("/:taskId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const currentUser = c.get("user");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const histories = await databases.listDocuments<History>(
      DATABASE_ID,
      HISTORIES_ID,
      [Query.equal("taskId", taskId), Query.orderDesc("$createdAt")]
    );

    const populatedHistories = await Promise.all(
      histories.documents.map(async (history) => {
        const member = await databases.getDocument(
          DATABASE_ID,
          MEMBERS_ID,
          history.editorId
        );

        const user = await users.get(member.userId);

        const oldValues = JSON.parse(history.oldValues);
        const newValues = JSON.parse(history.newValues);

        const response = {
          ...history,
          oldValues,
          newValues,
          editor: {
            ...member,
            name: user.name || user.email,
            email: user.email,
          },
        };

        if (newValues.projectId) {
          const newProject = await databases.getDocument(
            DATABASE_ID,
            PROJECTS_ID,
            newValues.projectId
          );

          const oldProject = await databases.getDocument(
            DATABASE_ID,
            PROJECTS_ID,
            oldValues.projectId
          );

          response.newValues.project = newProject.name;
          response.oldValues.project = oldProject.name;
        }

        if (newValues.assigneeId) {
          const newAssignee = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            newValues.assigneeId
          );

          const oldAssignee = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            oldValues.assigneeId
          );

          const newUser = await users.get(newAssignee.userId);
          const oldUser = await users.get(oldAssignee.userId);

          response.newValues.assignee = newUser.name || newUser.email;
          response.oldValues.assignee = oldUser.name || oldUser.email;
        }

        return response;
      })
    );

    return c.json({
      data: populatedHistories,
    });
  })

  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createHistorySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { taskId, fields, oldValues, newValues } = c.req.valid("json");

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const history = await databases.createDocument(
        DATABASE_ID,
        HISTORIES_ID,
        ID.unique(),
        {
          taskId,
          editorId: member.$id,
          fields,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify(newValues),
        }
      );

      return c.json({ data: history });
    }
  );

export default app;
