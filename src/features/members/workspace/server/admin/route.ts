import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

import { adminMiddleware } from "@/lib/admin-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, WORKSPACE_MEMBERS_ID, WORKSPACES_ID } from "@/config";

import {
  adminCreateMemberSchema,
  adminUpdateMemberSchema,
} from "@/features/members/schemas";

import {
  AdminWorkspaceMember,
  WorkspaceMember,
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
        workspaceId: z.string().optional(),
        role: z.nativeEnum(MemberRole).optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");

      const { userId, workspaceId, role, createdAt, updatedAt } =
        c.req.valid("query");

      const queries = [Query.orderDesc("$createdAt")];

      if (userId) queries.push(Query.equal("userId", userId));

      if (workspaceId) queries.push(Query.equal("workspaceId", workspaceId));

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

      const workspaceMembers = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        queries
      );

      const userIds = Array.from(
        new Set(workspaceMembers.documents.map((m) => m.userId))
      );
      const workspaceIds = Array.from(
        new Set(workspaceMembers.documents.map((m) => m.workspaceId))
      );

      const usersList = await users.list([Query.equal("$id", userIds)]);
      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [Query.equal("$id", workspaceIds)]
      );

      const userMap = Object.fromEntries(
        usersList.users.map((user) => [
          user.$id,
          { name: user.name, email: user.email },
        ])
      );

      const workspaceMap = Object.fromEntries(
        workspaces.documents.map((workspace) => [
          workspace.$id,
          { name: workspace.name },
        ])
      );

      const populatedMembers = workspaceMembers.documents.map(
        (member) =>
          ({
            ...member,
            user: userMap[member.userId],
            workspace: workspaceMap[member.workspaceId],
          } as AdminWorkspaceMember)
      );

      return c.json({
        data: {
          total: workspaceMembers.total,
          documents: populatedMembers,
        },
      });
    }
  )

  .get("/:memberId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { memberId } = c.req.param();

    const member = await databases.getDocument<WorkspaceMember>(
      DATABASE_ID,
      WORKSPACE_MEMBERS_ID,
      memberId
    );

    return c.json({ data: member });
  })

  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator("form", adminCreateMemberSchema),
    async (c) => {
      const databases = c.get("databases");
      const { workspaceId, userId, role } = c.req.valid("form");

      const newMember = await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
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
    zValidator("form", adminUpdateMemberSchema),
    async (c) => {
      const databases = c.get("databases");
      const { memberId } = c.req.param();
      const { role, workspaceId, userId } = c.req.valid("form");

      console.log(memberId);

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        memberId
      );

      if (role && role !== MemberRole.MANAGER) {
        const allMembersInWorkspace = await databases.listDocuments(
          DATABASE_ID,
          WORKSPACE_MEMBERS_ID,
          [Query.equal("workspaceId", memberToUpdate.workspaceId)]
        );

        if (allMembersInWorkspace.total === 1) {
          return c.json({ error: "Cannot downgrade the only member" }, 400);
        }
      }

      const updatedMember = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_MEMBERS_ID,
        memberId,
        {
          userId,
          workspaceId,
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
      WORKSPACE_MEMBERS_ID,
      memberId
    );

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, WORKSPACE_MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  });

export default app;
