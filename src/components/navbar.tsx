"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { usePathname } from "next/navigation";

const pathnameMap = {
  tasks: {
    title: "My Tasks",
    description: "View all of your tasks here",
  },
  projects: {
    title: "My Projects",
    description: "View tasks of your projects here",
  },
  "admin/users": {
    title: "Users",
    description: "Manage all users in the system",
  },
  "admin/workspaces": {
    title: "Workspaces",
    description: "Manage all workspaces in the system",
  },
  "admin/members": {
    title: "Members",
    description: "Manage all members in the system",
  },
  "admin/projects": {
    title: "Projects",
    description: "Manage all projects in the system",
  },
  "admin/tasks": {
    title: "Tasks",
    description: "Manage all tasks in the system",
  },
};

const defaultMap = {
  title: "Home",
  description: "Monitor your projects and tasks here",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const key =
    pathnameParts[1] === "admin"
      ? (`admin/${pathnameParts[2]}` as keyof typeof pathnameMap)
      : (pathnameParts[3] as keyof typeof pathnameMap);

  const { title, description } = pathnameMap[key] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};
