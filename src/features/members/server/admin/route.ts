import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";

import { adminMiddleware } from "@/lib/admin-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MEMBERS_ID } from "@/config";

import {
  adminCreateMemberSchema,
  adminUpdateMemberSchema,
} from "../../schemas";

import { MemberRole } from "../../types";

const app = new Hono()
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");

    const name = c.req.query("name");
    const role = c.req.query("role");
    const createdAt = c.req.query("createdAt");

    const queries = [Query.orderDesc("$createdAt")];

    if (name) queries.push(Query.contains("name", name));
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

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      queries
    );

    return c.json({ data: members });
  })

  .get("/:memberId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { memberId } = c.req.param();

    const member = await databases.getDocument(
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
