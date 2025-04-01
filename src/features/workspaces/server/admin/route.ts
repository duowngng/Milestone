import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

import {
  DATABASE_ID,
  WORKSPACES_ID,
  MEMBERS_ID,
  IMAGES_BUCKET_ID,
} from "@/config";
import { adminMiddleware } from "@/lib/admin-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";

import { generateInviteCode } from "@/lib/utils";
import {
  adminCreateWorkspaceSchema,
  updateWorkspaceSchema,
} from "../../schemas";

import { MemberRole } from "@/features/members/type";
import { Workspace } from "../../types";

const app = new Hono()
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");

    const name = c.req.query("search");
    const userId = c.req.query("userId");
    const createdAt = c.req.query("createdAt");
    const updatedAt = c.req.query("updatedAt");

    const queries = [Query.orderDesc("$createdAt")];

    if (name) queries.push(Query.contains("name", name));

    if (userId) queries.push(Query.equal("userId", userId));

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

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      queries
    );

    const userIds = Array.from(
      new Set(workspaces.documents.map((w) => w.userId))
    );

    const usersList = await users.list([Query.equal("$id", userIds)]);

    const userMap = Object.fromEntries(
      usersList.users.map((user) => [
        user.$id,
        { name: user.name, email: user.email },
      ])
    );

    const populatedWorkspaces = workspaces.documents.map((workspace) => ({
      $id: workspace.$id,
      userId: workspace.userId,
      name: workspace.name,
      imageUrl: workspace.imageUrl,
      inviteCode: workspace.inviteCode,
      $createdAt: workspace.$createdAt,
      $updatedAt: workspace.$updatedAt,
      user: {
        name: userMap[workspace.userId].name,
        email: userMap[workspace.userId].email,
      },
    }));

    return c.json({
      data: {
        total: workspaces.total,
        documents: populatedWorkspaces,
      },
    });
  })

  .get("/:workspaceId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })

  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator("form", adminCreateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { userId, name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(6),
        }
      );

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        userId,
        workspaceId: workspace.$id,
        role: MemberRole.ADMIN,
      });

      return c.json({ data: workspace });
    }
  )

  .patch(
    "/:workspaceId",
    sessionMiddleware,
    adminMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const updatedWorkspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        { name, imageUrl: image }
      );

      return c.json({ data: updatedWorkspace });
    }
  )

  .delete("/:workspaceId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    return c.json({ data: { $id: workspaceId } });
  });

export default app;
