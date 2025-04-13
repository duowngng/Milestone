"use client";

import { UserIcon, BuildingIcon, UserCogIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/date-range-picker";

import { useMemberFilters } from "../../hooks/admin/use-member-filters";
import { useGetUsers } from "@/features/users/api/admin/use-get-admin-users";
import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { MemberRole } from "../../types";

export const DataFilter = () => {
  const { data: usersData } = useGetUsers();
  const { data: workspacesData } = useGetWorkspaces();

  const userOptions = usersData?.users.map((user) => ({
    value: user.$id,
    label: user.name,
  }));

  const workspaceOptions = workspacesData?.documents.map((workspace) => ({
    value: workspace.$id,
    label: workspace.name,
  }));

  const roleOptions = Object.values(MemberRole).map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
  }));

  const [{ userId, workspaceId, role, createdAt, updatedAt }, setFilters] =
    useMemberFilters();

  const onUserChange = (value: string) => {
    setFilters({ userId: value === "all" ? null : value });
  };

  const onWorkspaceChange = (value: string) => {
    setFilters({ workspaceId: value === "all" ? null : value });
  };

  const onRoleChange = (value: string) => {
    setFilters({ role: value === "all" ? null : value });
  };

  const onCreatedAtChange = (range: { from?: Date; to?: Date } | undefined) => {
    setFilters({
      createdAt: `${range?.from?.toISOString() || ""},${
        range?.to?.toISOString() || ""
      }`,
    });
  };

  const onUpdatedAtChange = (range: { from?: Date; to?: Date } | undefined) => {
    setFilters({
      updatedAt: `${range?.from?.toISOString() || ""},${
        range?.to?.toISOString() || ""
      }`,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <Select value={userId || "all"} onValueChange={onUserChange}>
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <UserIcon className="size-4 mr-2" />
            <SelectValue placeholder="All Users" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectSeparator />
          {userOptions?.map((user) => (
            <SelectItem key={user.value} value={user.value}>
              {user.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={workspaceId || "all"} onValueChange={onWorkspaceChange}>
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <BuildingIcon className="size-4 mr-2" />
            <SelectValue placeholder="All Workspaces" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Workspaces</SelectItem>
          <SelectSeparator />
          {workspaceOptions?.map((workspace) => (
            <SelectItem key={workspace.value} value={workspace.value}>
              {workspace.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select value={role || "all"} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <UserCogIcon className="size-4 mr-2" />
            <SelectValue placeholder="All Roles" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectSeparator />
          {roleOptions.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Created At Filter */}
      <DateRangePicker
        placeholder="Created At"
        className="w-full lg:w-auto h-8"
        value={
          createdAt
            ? {
                from: createdAt.split(",")[0]
                  ? new Date(createdAt.split(",")[0])
                  : undefined,
                to: createdAt.split(",")[1]
                  ? new Date(createdAt.split(",")[1])
                  : undefined,
              }
            : undefined
        }
        onChange={onCreatedAtChange}
      />

      {/* Updated At Filter */}
      <DateRangePicker
        placeholder="Updated At"
        className="w-full lg:w-auto h-8"
        value={
          updatedAt
            ? {
                from: updatedAt.split(",")[0]
                  ? new Date(updatedAt.split(",")[0])
                  : undefined,
                to: updatedAt.split(",")[1]
                  ? new Date(updatedAt.split(",")[1])
                  : undefined,
              }
            : undefined
        }
        onChange={onUpdatedAtChange}
      />
    </div>
  );
};
