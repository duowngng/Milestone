"use client";

import { useState } from "react";
import { useDebounce } from "react-use";

import { Loader } from "lucide-react";

import { DataTable } from "@/features/users/components/admin/data-table";
import { columns } from "@/features/users/components/admin/columns";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";

import { useGetUsers } from "@/features/users/api/admin/use-get-admin-users";

export const AdminUsersClient = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  useDebounce(
    () => {
      setDebouncedSearch(search);
      setPage(1);
    },
    300,
    [search]
  );

  const { data, isLoading } = useGetUsers({
    search: debouncedSearch,
    limit,
    offset: (page - 1) * limit,
  });

  return (
    <div className="h-fit flex flex-col border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users ({data?.total})</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[250px] h-8"
          />
        </div>
      </div>
      <DottedSeparator className="my-4" />
      {isLoading ? (
        <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <PageError message="Failed to load users" />
      ) : (
        <DataTable columns={columns} data={data.users} />
      )}
    </div>
  );
};
