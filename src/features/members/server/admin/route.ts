import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

import { adminMiddleware } from "@/lib/admin-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

import {
  adminCreateMemberSchema,
  adminUpdateMemberSchema,
} from "../../schemas";

import { AdminMember, Member, MemberRole } from "../../types";

const app = new Hono()
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");

    const userId = c.req.query("userId");
    const workspaceId = c.req.query("workspaceId");
    const role = c.req.query("role");
    const createdAt = c.req.query("createdAt");
    const updatedAt = c.req.query("updatedAt");

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

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      queries
    );

    const userIds = Array.from(new Set(members.documents.map((m) => m.userId)));
    const workspaceIds = Array.from(
      new Set(members.documents.map((m) => m.workspaceId))
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

    const populatedMembers = members.documents.map(
      (member) =>
        ({
          ...member,
          user: userMap[member.userId],
          workspace: workspaceMap[member.workspaceId],
        } as AdminMember)
    );

    return c.json({
      data: {
        total: members.total,
        documents: populatedMembers,
      },
    });
  })

  .get("/:memberId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { memberId } = c.req.param();

    const member = await databases.getDocument<Member>(
      DATABASE_ID,
      MEMBERS_ID,
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
        MEMBERS_ID,
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
        MEMBERS_ID,
        memberId
      );

      if (role && role !== MemberRole.ADMIN) {
        const allMembersInWorkspace = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [Query.equal("workspaceId", memberToUpdate.workspaceId)]
        );

        if (allMembersInWorkspace.total === 1) {
          return c.json({ error: "Cannot downgrade the only member" }, 400);
        }
      }

      const updatedMember = await databases.updateDocument(
        DATABASE_ID,
        MEMBERS_ID,
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
      MEMBERS_ID,
      memberId
    );

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  });

export default app;
