import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { adminMiddleware } from "@/lib/admin-middleware";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    adminMiddleware,
    zValidator(
      "query",
      z.object({
        search: z.string().optional(),
        limit: z.preprocess(
          (val) => (val === undefined ? 25 : Number(val)),
          z.number().int().min(1).max(100)
        ),
        offset: z.preprocess(
          (val) => (val === undefined ? 0 : Number(val)),
          z.number().int().min(0)
        ),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const { search, limit, offset } = c.req.valid("query");

      const queries = [Query.limit(limit), Query.offset(offset)];
      if (search) {
        queries.push(
          Query.or([
            Query.contains("email", search),
            Query.contains("name", search),
          ])
        );
      }

      const usersList = await users.list(queries);

      const populatedUsers = usersList.users.map((user) => ({
        $id: user.$id,
        name: user.name,
        email: user.email,
        registration: user.registration,
        accessedAt: user.accessedAt,
        labels: user.labels || [],
      }));

      return c.json({
        data: {
          total: usersList.total,
          users: populatedUsers,
        },
      });
    }
  )
  .delete("/:userId", sessionMiddleware, adminMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const { userId } = c.req.param();

    await users.delete(userId);

    return c.json({ data: { $id: userId } });
  });

export default app;
