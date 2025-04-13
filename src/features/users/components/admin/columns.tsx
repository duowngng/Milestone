"use client";

import { format } from "date-fns";
import { toast } from "sonner";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CopyIcon, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { User } from "../../types";
import { UserActions } from "./user-actions";

export const columns: ColumnDef<User>[] = [
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
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
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
        toast.success("User ID copied to clipboard");
      };

      return (
        <Badge
          variant="secondary"
          className=" font-mono text-xs cursor-pointer"
          onClick={handleCopy}
        >
          <CopyIcon className="size-3 mr-2" />
          {id}
        </Badge>
      );
    },
  },
  {
    accessorKey: "labels",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Labels
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const labels = row.original.labels || [];
      return (
        <div className="flex flex-wrap gap-1">
          {labels.map((label) => (
            <Badge key={label} variant="secondary" className="text-sm">
              {label}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "registration",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Joined
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.registration
            ? format(new Date(row.original.registration), "MMM dd, yyyy")
            : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "accessedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Activity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.accessedAt
            ? format(new Date(row.original.accessedAt), "MMM dd, yyyy HH:mm")
            : "Never"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;

      return (
        <UserActions id={id}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </UserActions>
      );
    },
  },
];
