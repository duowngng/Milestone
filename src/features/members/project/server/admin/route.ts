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

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "query",
      z.object({
        userId: z.string().optional(),
        projectId: z.string().optional(),
        role: z.nativeEnum(MemberRole).optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");

      const { userId, projectId, role, createdAt, updatedAt } =
        c.req.valid("query");

      const queries = [Query.orderDesc("$createdAt")];

      if (userId) queries.push(Query.equal("userId", userId));
      if (projectId) queries.push(Query.equal("projectId", projectId));
      if (role) queries.push(Query.equal("role", role));

      if (createdAt) {
        try {
          const [from, to] = decodeURIComponent(createdAt).split(",");
          if (from) queries.push(Query.greaterThanEqual("$createdAt", from));
          if (to) queries.push(Query.lessThanEqual("$createdAt", to));
        } catch (error) {
          console.error("Invalid createdAt format", error);
        }
      }

      if (updatedAt) {
        try {
          const [from, to] = decodeURIComponent(updatedAt).split(",");
          if (from) queries.push(Query.greaterThanEqual("$updatedAt", from));
          if (to) queries.push(Query.lessThanEqual("$updatedAt", to));
        } catch (error) {
          console.error("Invalid updatedAt format", error);
        }
      }

      const projectMembers = await databases.listDocuments(
        DATABASE_ID,
        PROJECT_MEMBERS_ID,
        queries
      );

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
  });

export default app;
