"use client";

import { format } from "date-fns";
import { toast } from "sonner";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CopyIcon, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "../project-avatar";

import { AdminProject } from "../../types";
import { ProjectActions } from "./project-actions";

export const columns: ColumnDef<AdminProject>[] = [
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
      const project = row.original;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar
            className="size-6"
            name={project.name}
            image={project.imageUrl}
          />
          <p className="line-clamp-1">{project.name}</p>
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
        toast.success("Project ID copied to clipboard");
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
    accessorKey: "workspace",
    header: "Workspace",
    cell: ({ row }) => {
      const workspace = row.original.workspace;

      if (!workspace) {
        return <span className="text-red-500">Unknown Workspace</span>;
      }

      return <span className="font-medium">{workspace.name}</span>;
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
            ? format(new Date(row.original.$createdAt), "MMM dd, yyyy HH:mm")
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
            ? format(new Date(row.original.$updatedAt), "MMM dd, yyyy HH:mm")
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
        <ProjectActions id={id}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </ProjectActions>
      );
    },
  },
];
