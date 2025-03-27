"use client";

import { UserIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/date-range-picker";

import { useWorkspaceFilters } from "@/features/workspaces/api/admin/use-workspace-filters";

interface DataFilterProps {
  users: { id: string; name: string }[];
}

export const DataFilter = ({ users }: DataFilterProps) => {
  const [{ name, userId, createdAt, updatedAt }, setFilters] =
    useWorkspaceFilters();

  const onUserChange = (value: string) => {
    setFilters({ userId: value === "all" ? null : value });
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

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ name: e.target.value });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-2">
        <Select value={userId || "all"} onValueChange={onUserChange}>
          <SelectTrigger className="w-full lg:w-auto h-8">
            <div className="flex items-center pr-2">
              <UserIcon className="size-4 mr-2" />
              <SelectValue placeholder="All users" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectSeparator />
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePickerWithRange
          placeholder="Created at"
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

        <DatePickerWithRange
          placeholder="Updated at"
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
      <Input
        placeholder="Search by name"
        value={name || ""}
        onChange={onSearchChange}
        className="w-full lg:w-auto h-8"
      />
    </div>
  );
};
