import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

import { adminMiddleware } from "@/lib/admin-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, PROJECT_MEMBERS_ID, PROJECTS_ID } from "@/config";

import {
  AdminProjectMember,
  ProjectMember,
  MemberRole,
} from "@/features/members/types";

import { adminCreateProjectMembersSchema } from "../../schemas";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "query",
      z.object({
        projectId: z.string().optional(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");

      const { projectId } = c.req.valid("query");

      const queries = [Query.orderDesc("$createdAt")];

      if (projectId) queries.push(Query.equal("projectId", projectId));

      const projectMembers = await databases.listDocuments(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        queries
      );

      if (projectMembers.total === 0) {
        return c.json({
          data: {
            total: 0,
            documents: [],
          },
        });
      }

      const userIds = Array.from(
        new Set(projectMembers.documents.map((m) => m.userId))
      );
      const projectIds = Array.from(
        new Set(projectMembers.documents.map((m) => m.projectId))
      );

      const usersList = await users.list([Query.equal("$id", userIds)]);
      const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
        Query.equal("$id", projectIds),
      ]);

      const userMap = Object.fromEntries(
        usersList.users.map((user) => [
          user.$id,
          { name: user.name, email: user.email },
        ])
      );

      const projectMap = Object.fromEntries(
        projects.documents.map((project) => [
          project.$id,
          { name: project.name },
        ])
      );

      const populatedMembers = projectMembers.documents.map(
        (member) =>
          ({
            ...member,
            user: userMap[member.userId],
            project: projectMap[member.projectId],
          } as AdminProjectMember)
      );

      return c.json({
        data: {
          total: projectMembers.total,
          documents: populatedMembers,
        },
      });
    }
  )

  .get("/:memberId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { memberId } = c.req.param();

    const member = await databases.getDocument<ProjectMember>(
      DATABASE_ID,
      PROJECT_MEMBERS_ID,
      memberId
    );

    return c.json({ data: member });
  })

  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "form",
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(MemberRole),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const { projectId, userId, role } = c.req.valid("form");

      const newMember = await databases.createDocument(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        ID.unique(),
        {
          projectId,
          userId,
          role,
        }
      );

      return c.json({ data: newMember });
    }
  )

  .patch(
    "/:memberId",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "form",
      z.object({
        projectId: z.string().optional(),
        userId: z.string().optional(),
        role: z.nativeEnum(MemberRole).optional(),
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const { memberId } = c.req.param();
      const { role, projectId, userId } = c.req.valid("form");

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        memberId
      );

      if (role && role !== MemberRole.MANAGER) {
        const allMembersInProject = await databases.listDocuments(
          DATABASE_ID,
          PROJECT_MEMBERS_ID,
          [Query.equal("projectId", memberToUpdate.projectId)]
        );

        if (allMembersInProject.total === 1) {
          return c.json({ error: "Cannot downgrade the only member" }, 400);
        }
      }

      const updatedMember = await databases.updateDocument(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        memberId,
        {
          userId,
          projectId,
          role,
        }
      );

      return c.json({ data: updatedMember });
    }
  )

  .delete("/:memberId", sessionMiddleware, adminMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const databases = c.get("databases");

    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      PROJECT_MEMBERS_ID,
      memberId
    );

    const allMembersInProject = await databases.listDocuments(
      DATABASE_ID,
      PROJECT_MEMBERS_ID,
      [Query.equal("projectId", memberToDelete.projectId)]
    );

    if (allMembersInProject.total === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, PROJECT_MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  })
  .post(
    "/bulk-create",
    sessionMiddleware,
    adminMiddleware,
    zValidator("json", adminCreateProjectMembersSchema),
    async (c) => {
      const databases = c.get("databases");
      const { projectId, userIds } = c.req.valid("json");

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
