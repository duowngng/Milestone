import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import members from "@/features/members/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import adminUsers from "@/features/users/server/admin/route";
import adminWorkspaces from "@/features/workspaces/server/admin/route";
import adminMemsers from "@/features/members/server/admin/route";

const app = new Hono()
  .basePath("/api")
  .route("/auth", auth)
  .route("/workspaces", workspaces)
  .route("/members", members)
  .route("/projects", projects)
  .route("/tasks", tasks)
  .route("/admin/users", adminUsers)
  .route("/admin/workspaces", adminWorkspaces)
  .route("/admin/members", adminMemsers);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
