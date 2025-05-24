"use client";

import { format } from "date-fns";
import { toast } from "sonner";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CopyIcon, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AdminWorkspaceMember } from "@/features/members/types";
import { MemberActions } from "./member-actions";

export const columns: ColumnDef<AdminWorkspaceMember>[] = [
  {
    accessorKey: "$id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const id = row.original.$id;

      const handleCopy = () => {
        navigator.clipboard.writeText(id);
        toast.success("Member ID copied to clipboard");
      };

      return (
        <Badge
          variant="secondary"
          className="font-mono text-xs cursor-pointer"
          onClick={handleCopy}
        >
          <CopyIcon className="size-3 mr-2" />
          {id}
        </Badge>
      );
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original.user;

      if (!user) {
        return <span className="text-red-500">Unknown User</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "workspace",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Workspace
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const workspace = row.original.workspace;

      if (!workspace) {
        return <span className="text-red-500">Unknown Workspace</span>;
      }

      return <span className="text-sm">{workspace.name}</span>;
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.original.role;
      return <span className="text-sm">{role || "N/A"}</span>;
    },
  },
  {
    accessorKey: "$createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.$createdAt
            ? format(new Date(row.original.$createdAt), "PPp")
            : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "$updatedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Updated At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.$updatedAt
            ? format(new Date(row.original.$updatedAt), "PPp")
            : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;

      return (
        <MemberActions id={id}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </MemberActions>
      );
    },
  },
];
