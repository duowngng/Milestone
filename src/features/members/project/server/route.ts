import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Query } from "node-appwrite";
import { Hono } from "hono";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, PROJECT_MEMBERS_ID, PROJECTS_ID } from "@/config";

import {
  getWorkspaceMember,
  isWorkspaceManager,
} from "@/features/members/workspace/utils";
import {
  getProjectMember,
  isProjectManager,
} from "@/features/members/project/utils";
import { ProjectMember, MemberRole } from "@/features/members/types";
import { Project } from "@/features/projects/types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({ workspaceId: z.string(), projectId: z.string() })
    ),
    async (c) => {
      const { workspaceId, projectId } = c.req.valid("query");
      const databases = c.get("databases");
      const user = c.get("user");
      const { users } = await createAdminClient();

      const workspaceMember = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!workspaceMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectMember = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });

      if (!isWorkspaceManager(workspaceMember) && !projectMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectMembers = await databases.listDocuments<ProjectMember>(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        [Query.equal("projectId", projectId)]
      );

      const populatedMembers = await Promise.all(
        projectMembers.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      return c.json({
        data: {
          ...projectMembers,
          documents: populatedMembers,
        },
      });
    }
  )
  .get(
    "/current",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({ workspaceId: z.string(), projectId: z.string() })
    ),
    async (c) => {
      const { workspaceId, projectId } = c.req.valid("query");
      const databases = c.get("databases");
      const user = c.get("user");

      const workspaceMember = await getWorkspaceMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!workspaceMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectMember = await getProjectMember({
        databases,
        projectId,
        userId: user.$id,
      });

      if (!projectMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data: projectMember });
    }
  )
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const databases = c.get("databases");
      const user = c.get("user");

      const memberToUpdate = await databases.getDocument<ProjectMember>(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        memberId
      );

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        memberToUpdate.projectId
      );

      const workspaceMember = await getWorkspaceMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });

      if (!workspaceMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectMember = await getProjectMember({
        databases,
        projectId: memberToUpdate.projectId,
        userId: user.$id,
      });

      if (
        !isWorkspaceManager(workspaceMember) &&
        !isProjectManager(projectMember)
      ) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await databases.updateDocument(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        memberId,
        {
          role,
        }
      );

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  )
  .delete("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const databases = c.get("databases");
    const user = c.get("user");

    const memberToDelete = await databases.getDocument<ProjectMember>(
      DATABASE_ID,
      PROJECT_MEMBERS_ID,
      memberId
    );

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      memberToDelete.projectId
    );

    const workspaceMember = await getWorkspaceMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!workspaceMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectMember = await getProjectMember({
      databases,
      projectId: memberToDelete.projectId,
      userId: user.$id,
    });

    if (
      !isWorkspaceManager(workspaceMember) &&
      !isProjectManager(projectMember)
    ) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, PROJECT_MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  });

export default app;
