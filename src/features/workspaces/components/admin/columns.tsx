"use client";

import { format } from "date-fns";
import { toast } from "sonner";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CopyIcon,
  MoreVertical,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AdminWorkspace } from "../../types";
import { WorkspaceAvatar } from "../workspace-avatar";
import { WorkspaceActions } from "./workspace-actions";

export const columns: ColumnDef<AdminWorkspace>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const workspace = row.original;
      return (
        <div className="flex space-x-2 items-center">
          <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
          <span className="font-medium">{workspace.name}</span>
        </div>
      );
    },
  },
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
        toast.success("Workspace ID copied to clipboard");
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
        Created User
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
    accessorKey: "inviteCode",
    header: "Invite Code",
    cell: ({ row }) => {
      const inviteCode = row.original.inviteCode;
      return <span className="font-mono text-xs">{inviteCode}</span>;
    },
  },
  {
    accessorKey: "members",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Members
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const workspace = row.original;
      const memberCount = workspace.members?.length || 0;
      const isOpen = workspace._isOpen;

      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="size-3.5 mr-2" />
            <span>
              {memberCount} Member{memberCount !== 1 && "s"}
            </span>
          </div>
          <div className="mr-4">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      );
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
        <WorkspaceActions id={id}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </WorkspaceActions>
      );
    },
  },
];
