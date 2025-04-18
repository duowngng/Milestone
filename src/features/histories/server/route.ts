import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";

import { DATABASE_ID, MEMBERS_ID, TASKS_ID, HISTORIES_ID } from "@/config";
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

        return {
          ...history,
          oldValues: JSON.parse(history.oldValues),
          newValues: JSON.parse(history.newValues),
          editor: {
            ...member,
            name: user.name || user.email,
            email: user.email,
          },
        };
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

      const { taskId, editorId, fields, oldValues, newValues } =
        c.req.valid("json");

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
          editorId,
          fields,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify(newValues),
        }
      );

      return c.json({ data: history });
    }
  );

export default app;
