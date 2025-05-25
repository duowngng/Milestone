import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";

import {
  DATABASE_ID,
  PROJECTS_ID,
  WORKSPACES_ID,
  IMAGES_BUCKET_ID,
} from "@/config";
import { adminMiddleware } from "@/lib/admin-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createProjectSchema, updateProjectSchema } from "../../schemas";
import { AdminProject, Project } from "../../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "query",
      z.object({
        name: z.string().optional(),
        workspaceId: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    ),
    async (c) => {
      const databases = c.get("databases");

      const { name, workspaceId, createdAt, updatedAt } = c.req.valid("query");

      const queries = [Query.orderDesc("$createdAt")];

      if (name) queries.push(Query.contains("name", name));

      if (workspaceId) queries.push(Query.equal("workspaceId", workspaceId));

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

      const projects = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_ID,
        queries
      );

      const workspaceIds = Array.from(
        new Set(projects.documents.map((p) => p.workspaceId))
      );

      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [Query.equal("$id", workspaceIds)]
      );

      const workspaceMap = Object.fromEntries(
        workspaces.documents.map((workspace) => [
          workspace.$id,
          { name: workspace.name },
        ])
      );

      const populatedProjects = projects.documents.map(
        (project) =>
          ({
            ...project,
            workspace: workspaceMap[project.workspaceId],
          } as AdminProject)
      );

      return c.json({
        data: {
          total: projects.total,
          documents: populatedProjects,
        },
      });
    }
  )

  .get("/:projectId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    return c.json({ data: project });
  })

  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { name, image, workspaceId } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        }
      );

      return c.json({ data: project });
    }
  )

  .patch(
    "/:projectId",
    sessionMiddleware,
    adminMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const { projectId } = c.req.param();
      const { name, image, workspaceId } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFileView(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const updatedProject = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        }
      );

      return c.json({ data: updatedProject });
    }
  )

  .delete("/:projectId", sessionMiddleware, adminMiddleware, async (c) => {
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

    return c.json({ data: { $id: projectId } });
  });

export default app;
