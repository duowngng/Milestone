import "server-only";

import { Models } from "node-appwrite";

import { createMiddleware } from "hono/factory";

type Context = {
  Variables: {
    user: Models.User<Models.Preferences>;
  };
};

export const adminMiddleware = createMiddleware<Context>(async (c, next) => {
  const user = c.get("user");

  if (!user || !user.labels?.includes("admin")) {
    return c.json({ error: "Unauthorized: Admin access required" }, 401);
  }

  await next();
});
