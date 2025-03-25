"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import {
  FolderIcon as FolderOutline,
  UserGroupIcon as UserGroupOutline,
  BuildingOfficeIcon as BuildingOfficeOutline,
  UserIcon as UserOutline,
} from "@heroicons/react/24/outline";

import {
  FolderIcon as FolderSolid,
  UserGroupIcon as UserGroupSolid,
  BuildingOfficeIcon as BuildingOfficeSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";

const routes = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "Users",
    href: "/users",
    icon: UserOutline,
    activeIcon: UserSolid,
  },
  {
    label: "Workspaces",
    href: "/workspaces",
    icon: BuildingOfficeOutline,
    activeIcon: BuildingOfficeSolid,
  },
  {
    label: "Members",
    href: "/members",
    icon: UserGroupOutline,
    activeIcon: UserGroupSolid,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOutline,
    activeIcon: FolderSolid,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        const fullHref = `/admin${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon
                className="size-5 text-neutral-500"
                {...(item.icon.name?.startsWith("Go")
                  ? { strokeWidth: 0.5 }
                  : { strokeWidth: 1.75 })}
              />
              {item.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
