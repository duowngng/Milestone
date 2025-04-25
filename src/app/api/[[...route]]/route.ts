import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import workspaceMembers from "@/features/members/workspace/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import histories from "@/features/histories/server/route";
import adminUsers from "@/features/users/server/admin/route";
import adminWorkspaces from "@/features/workspaces/server/admin/route";
import adminWorkspaceMembers from "@/features/members/workspace/server/admin/route";
import adminProjects from "@/features/projects/server/admin/route";

const app = new Hono()
  .basePath("/api")
  .route("/auth", auth)
  .route("/workspaces", workspaces)
  .route("/members/workspace", workspaceMembers)
  .route("/projects", projects)
  .route("/tasks", tasks)
  .route("/histories", histories)
  .route("/admin/users", adminUsers)
  .route("/admin/workspaces", adminWorkspaces)
  .route("/admin/members/workspace", adminWorkspaceMembers)
  .route("/admin/projects", adminProjects);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
