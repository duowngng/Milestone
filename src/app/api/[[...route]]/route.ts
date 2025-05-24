import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route";
import workspaceMembers from "@/features/members/workspace/server/route";
import projects from "@/features/projects/server/route";
import projectMembers from "@/features/members/project/server/route";
import tasks from "@/features/tasks/server/route";
import histories from "@/features/histories/server/route";
import milestones from "@/features/milestones/server/route";
import adminUsers from "@/features/users/server/admin/route";
import adminWorkspaces from "@/features/workspaces/server/admin/route";
import adminWorkspaceMembers from "@/features/members/workspace/server/admin/route";
import adminProjects from "@/features/projects/server/admin/route";
import adminProjectMembers from "@/features/members/project/server/admin/route";
import adminTasks from "@/features/tasks/server/admin/route";

const app = new Hono()
  .basePath("/api")
  .route("/auth", auth)
  .route("/workspaces", workspaces)
  .route("/members/workspace", workspaceMembers)
  .route("/projects", projects)
  .route("/members/project", projectMembers)
  .route("/tasks", tasks)
  .route("/histories", histories)
  .route("/milestones", milestones)
  .route("/admin/users", adminUsers)
  .route("/admin/workspaces", adminWorkspaces)
  .route("/admin/members/workspace", adminWorkspaceMembers)
  .route("/admin/projects", adminProjects)
  .route("/admin/members/project", adminProjectMembers)
  .route("/admin/tasks", adminTasks);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
