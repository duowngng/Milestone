import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
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

import { createProjectMembersSchema } from "../schemas";

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

      const isManager = isWorkspaceManager(workspaceMember);
      let projectMembers: ProjectMember[] = [];

      if (projectId) {
        const projectMember = await getProjectMember({
          databases,
          projectId,
          userId: user.$id,
        });

        if (!isManager && !projectMember) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const result = await databases.listDocuments<ProjectMember>(
          DATABASE_ID,
          PROJECT_MEMBERS_ID,
          [Query.equal("projectId", projectId)]
        );

        projectMembers = result.documents;
      } else {
        if (isManager) {
          const result = await databases.listDocuments<ProjectMember>(
            DATABASE_ID,
            PROJECT_MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId)]
          );
          projectMembers = result.documents;
        } else {
          const myProjects = await databases.listDocuments<ProjectMember>(
            DATABASE_ID,
            PROJECT_MEMBERS_ID,
            [Query.equal("userId", user.$id)]
          );

          if (myProjects.documents.length === 0) {
            return c.json({ data: { documents: [], total: 0 } });
          }

          const projectIds = myProjects.documents.map((pm) => pm.projectId);

          const result = await databases.listDocuments<ProjectMember>(
            DATABASE_ID,
            PROJECT_MEMBERS_ID,
            [Query.equal("projectId", projectIds)]
          );

          projectMembers = result.documents;
        }
      }

      const populatedMembers = await Promise.all(
        projectMembers.map(async (member) => {
          const u = await users.get(member.userId);
          return {
            ...member,
            name: u.name || u.email,
            email: u.email,
          };
        })
      );

      return c.json({
        data: {
          total: populatedMembers.length,
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
  })
  .post(
    "/bulk-create",
    sessionMiddleware,
    zValidator("json", createProjectMembersSchema),
    async (c) => {
      console.log("POST /members/project/bulk-create", c.req.valid("json"));
      const { projectId, userIds } = c.req.valid("json");
      const databases = c.get("databases");
      const user = c.get("user");

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

      if (!workspaceMember || !isWorkspaceManager(workspaceMember)) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const newMembers = await Promise.all(
        userIds.map(async (userId) => {
          return databases.createDocument<ProjectMember>(
            DATABASE_ID,
            PROJECT_MEMBERS_ID,
            ID.unique(),
            {
              projectId,
              userId,
              role: MemberRole.MEMBER,
            }
          );
        })
      );

      return c.json({ data: newMembers });
    }
  );

export default app;
