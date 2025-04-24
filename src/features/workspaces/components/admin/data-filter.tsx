"use client";

import { UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/date-range-picker";

import { useWorkspaceFilters } from "@/features/workspaces/hooks/admin/use-workspace-filters";
import { useGetUsers } from "@/features/users/api/admin/use-get-admin-users";

export const DataFilter = () => {
  const { data: usersData } = useGetUsers();

  const userOptions = usersData?.users.map((user) => ({
    value: user.$id,
    label: user.name,
  }));

  const [{ name, userId, createdAt, updatedAt }, setFilters] =
    useWorkspaceFilters();
  const [searchTerm, setSearchTerm] = useState(name || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (debouncedSearchTerm !== name) {
      setFilters({ name: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, name, setFilters]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-2">
        <Select value={userId || "all"} onValueChange={onUserChange}>
          <SelectTrigger className="w-full lg:w-auto h-8">
            <div className="flex items-center pr-2">
              <UserIcon className="size-4 mr-2" />
              <SelectValue placeholder="User" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">User</SelectItem>
            <SelectSeparator />
            {userOptions?.map((user) => (
              <SelectItem key={user.value} value={user.value}>
                {user.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
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

        <DateRangePicker
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
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full lg:w-auto h-8"
      />
    </div>
  );
};
