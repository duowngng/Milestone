import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MILESTONES_ID } from "@/config";

import { getProjectMember } from "@/features/members/project/utils";
import { getWorkspaceMember } from "@/features/members/workspace/utils";
import { MemberRole } from "@/features/members/types";

import { createMilestoneSchema, updateMilestoneSchema } from "../schemas";
import { Milestone } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const { workspaceId, projectId } = c.req.valid("query");

      const workspaceMember = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!workspaceMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!projectId && workspaceMember.role !== MemberRole.MANAGER) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (projectId) {
        const projectMember = await getProjectMember({
          databases,
          projectId,
          userId: user.$id,
        });

        if (!projectMember && workspaceMember.role !== MemberRole.MANAGER) {
          return c.json({ error: "Unauthorized" }, 401);
        }
      }

      const queries = [
        Query.equal("workspaceId", workspaceId),
        ...(projectId ? [Query.equal("projectId", projectId)] : []),
        Query.orderDesc("date"),
      ];

      const milestones = await databases.listDocuments<Milestone>(
        DATABASE_ID,
        MILESTONES_ID,
        queries
      );

      return c.json({ data: milestones });
    }
  )
  .get("/:milestoneId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { milestoneId } = c.req.param();

    const milestone = await databases.getDocument<Milestone>(
      DATABASE_ID,
      MILESTONES_ID,
      milestoneId
    );

    const workspaceMember = await getWorkspaceMember({
      databases,
      workspaceId: milestone.workspaceId,
      userId: user.$id,
    });

    if (!workspaceMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Workspace managers can access all milestones
    if (workspaceMember.role === MemberRole.MANAGER) {
      return c.json({ data: milestone });
    }

    // Otherwise, check if user is a member of the milestone's project
    const projectMember = await getProjectMember({
      databases,
      projectId: milestone.projectId,
      userId: user.$id,
    });

    if (!projectMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ data: milestone });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createMilestoneSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { name, date, projectId, workspaceId } = c.req.valid("json");

      const member = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.MANAGER) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const milestone = await databases.createDocument(
        DATABASE_ID,
        MILESTONES_ID,
        ID.unique(),
        {
          name,
          date,
          projectId,
          workspaceId,
        }
      );

      return c.json({ data: milestone });
    }
  )
  .patch(
    "/:milestoneId",
    sessionMiddleware,
    zValidator("json", updateMilestoneSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { milestoneId } = c.req.param();
      const { name, date } = c.req.valid("json");

      const existingMilestone = await databases.getDocument<Milestone>(
        DATABASE_ID,
        MILESTONES_ID,
        milestoneId
      );

      const member = await getProjectMember({
        databases,
        projectId: existingMilestone.projectId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.MANAGER) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const milestone = await databases.updateDocument(
        DATABASE_ID,
        MILESTONES_ID,
        milestoneId,
        {
          ...(name && { name }),
          ...(date && { date }),
        }
      );

      return c.json({ data: milestone });
    }
  )
  .delete("/:milestoneId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { milestoneId } = c.req.param();

    const existingMilestone = await databases.getDocument<Milestone>(
      DATABASE_ID,
      MILESTONES_ID,
      milestoneId
    );

    const member = await getProjectMember({
      databases,
      projectId: existingMilestone.projectId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.MANAGER) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, MILESTONES_ID, milestoneId);

    return c.json({
      data: {
        $id: milestoneId,
        projectId: existingMilestone.projectId,
        workspaceId: existingMilestone.workspaceId,
      },
    });
  });

export default app;
