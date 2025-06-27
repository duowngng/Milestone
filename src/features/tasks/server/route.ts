import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { createAdminClient } from "@/lib/appwrite";
import { isEqual } from "date-fns";

import { getWorkspaceMember } from "@/features/members/workspace/utils";
import { getProjectMember } from "@/features/members/project/utils";
import { MemberRole } from "@/features/members/types";
import { Project } from "@/features/projects/types";

import {
  DATABASE_ID,
  HISTORIES_ID,
  WORKSPACE_MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
  PROJECT_MEMBERS_ID,
} from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createTaskSchema } from "../schemas";
import { Task, TaskStatus, TaskPriority } from "../types";

const getTaskChanges = (
  existingTask: Task,
  updates: Partial<z.infer<typeof createTaskSchema>>
) => {
  const changedFields: string[] = [];
  const oldValues: Partial<Task> = {};
  const newValues: Record<string, string | Date | number> = {};

  (Object.keys(updates) as Array<keyof typeof updates>).forEach((key) => {
    const newValue = updates[key];
    const oldValue = existingTask[key as keyof Task];

    if (newValue === undefined) return;

    let isDifferent = false;
    if (key === "startDate" || key === "dueDate") {
      if (!isEqual(new Date(newValue as Date), new Date(oldValue as string))) {
        isDifferent = true;
      }
    } else if (String(newValue) !== String(oldValue)) {
      isDifferent = true;
    }

    if (isDifferent) {
      changedFields.push(key);
      oldValues[key as keyof Task] = oldValue;
      newValues[key] = newValue;
    }
  });

  return { changedFields, oldValues, newValues };
};

const checkUpdatePermissions = (
  isManager: boolean,
  changedFields: string[]
): boolean => {
  if (isManager) {
    return true;
  }

  const restrictedFields: string[] = [
    "name",
    "projectId",
    "startDate",
    "dueDate",
    "assigneeId",
    "description",
    "priority",
  ];

  const hasRestrictedChanges = changedFields.some((field) =>
    restrictedFields.includes(field)
  );

  return !hasRestrictedChanges;
};

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        priority: z.nativeEnum(TaskPriority).nullish(),
        search: z.string().nullish(),
        startDate: z.string().nullish(),
        dueDate: z.string().nullish(),
        progress: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const {
        workspaceId,
        projectId,
        assigneeId,
        status,
        priority,
        search,
        startDate,
        dueDate,
        progress,
      } = c.req.valid("query");

      const workspaceMember = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!workspaceMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (workspaceMember.role === MemberRole.MANAGER) {
        if (projectId) {
          query.push(Query.equal("projectId", projectId));
        }
      } else {
        const projectMembers = await databases.listDocuments(
          DATABASE_ID,
          PROJECT_MEMBERS_ID,
          [Query.equal("userId", user.$id)]
        );

        const userProjectIds = projectMembers.documents.map(
          (pm) => pm.projectId
        );

        if (userProjectIds.length === 0) {
          return c.json({ data: { documents: [], total: 0 } });
        }

        if (projectId) {
          if (!userProjectIds.includes(projectId)) {
            return c.json({ error: "Unauthorized" }, 401);
          }
          query.push(Query.equal("projectId", projectId));
        } else {
          query.push(Query.equal("projectId", userProjectIds));
        }
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
        const [from, to] = startDate.split(",");
        if (from) query.push(Query.greaterThanEqual("startDate", from));
        if (to) query.push(Query.lessThanEqual("startDate", to));
      }

      if (dueDate) {
        const [from, to] = dueDate.split(",");
        if (from) query.push(Query.greaterThanEqual("dueDate", from));
        if (to) query.push(Query.lessThanEqual("dueDate", to));
      }

      if (progress) {
        query.push(Query.equal("progress", parseInt(progress)));
      }

      if (search) {
        query.push(Query.search("name", search));
      }

      const limit = 100;
      let offset = 0;
      let tasks: Task[] = [];

      while (true) {
        const batch = await databases.listDocuments<Task>(
          DATABASE_ID,
          TASKS_ID,
          [...query, Query.limit(limit), Query.offset(offset)]
        );

        tasks = tasks.concat(batch.documents);

        if (batch.documents.length < limit) {
          break;
        }

        offset += limit;
      }

      const projectIds = tasks.map((task) => task.projectId);
      const assigneeIds = tasks.map((task) => task.assigneeId);

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

      const populatedTasks = tasks.map((task) => {
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
          total: tasks.length,
          documents: populatedTasks,
        },
      });
    }
  )
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const currentMember = await getProjectMember({
      databases,
      projectId: task.projectId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

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
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
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

      const member = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.MANAGER) {
        return c.json({ error: "Unauthorized" }, 403);
      }

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
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();
      const jsonUpdates = c.req.valid("json");

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const workspaceMember = await getWorkspaceMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!workspaceMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectMember = await getProjectMember({
        databases,
        projectId: existingTask.projectId,
        userId: user.$id,
      });

      if (!projectMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const isManager = projectMember.role === MemberRole.MANAGER;
      const isAssignee = existingTask.assigneeId === workspaceMember.$id;

      if (!isManager && !isAssignee) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const { changedFields, oldValues, newValues } = getTaskChanges(
        existingTask,
        jsonUpdates
      );

      if (!checkUpdatePermissions(isManager, changedFields)) {
        return c.json(
          { error: "Unauthorized to update one or more fields" },
          403
        );
      }

      const task = await databases.updateDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          ...jsonUpdates,
          progress: jsonUpdates.progress
            ? parseInt(jsonUpdates.progress)
            : undefined,
        }
      );

      if (changedFields.length > 0) {
        if (newValues.progress) {
          newValues.progress = parseInt(newValues.progress as string);
        }

        await databases.createDocument(DATABASE_ID, HISTORIES_ID, ID.unique(), {
          taskId,
          editorId: workspaceMember.$id,
          fields: changedFields,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify(newValues),
        });
      }

      return c.json({ data: task });
    }
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const member = await getProjectMember({
      databases,
      projectId: task.projectId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.MANAGER) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const histories = await databases.listDocuments(DATABASE_ID, HISTORIES_ID, [
      Query.equal("taskId", taskId),
    ]);

    for (const history of histories.documents) {
      await databases.deleteDocument(DATABASE_ID, HISTORIES_ID, history.$id);
    }

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: task.$id } });
  })
  .post(
    "/bulk-update",
    sessionMiddleware,
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
      const user = c.get("user");
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");

      const taskToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.contains(
            "$id",
            tasks.map((task) => task.$id)
          ),
        ]
      );

      const workspaceIds = new Set(
        taskToUpdate.documents.map((task) => task.workspaceId)
      );
      if (workspaceIds.size !== 1) {
        return c.json({ error: "All tasks must belong to the same workspace" });
      }

      const workspaceId = workspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json({ error: "Workspace ID is required" }, 400);
      }

      const member = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

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
