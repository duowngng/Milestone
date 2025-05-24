"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CopyIcon, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { Task } from "../../types";
import { TaskActions } from "./task-actions";
import { snakeCaseToTitleCase } from "@/lib/utils";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;

      return <p className="line-clamp-1">{name}</p>;
    },
  },
  {
    accessorKey: "$id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const id = row.original.$id;

      const handleCopy = () => {
        navigator.clipboard.writeText(id);
        toast.success("Task ID copied to clipboard");
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
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;

      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar
            className="size-6"
            name={project?.name}
            image={project?.imageUrl}
          />
          <p className="line-clamp-1">{project?.name || "Unknown Project"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assignee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignee = row.original.assignee;

      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <MemberAvatar
            className="size-6"
            fallbackClassName="text-xs"
            name={assignee?.name}
          />
          <p className="line-clamp-1">{assignee?.name || "Unknown Assignee"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = row.original.startDate;

      return (
        <span className="text-sm whitespace-nowrap">
          {startDate ? format(new Date(startDate), "PP") : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;

      return (
        <span className="text-sm whitespace-nowrap">
          {dueDate ? format(new Date(dueDate), "PP") : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <div className="flex justify-center">
          <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.original.priority;

      return (
        <div className="flex justify-center">
          <Badge variant={priority}>{snakeCaseToTitleCase(priority)}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Progress
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const progress = row.original.progress as number;

      return (
        <div className="flex items-center gap-2 mr-3">
          <Progress value={progress} className="h-2" />
          <span className="w-3 text-xs text-right">{progress}%</span>
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
        <span className="text-sm whitespace-nowrap">
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
        <span className="text-sm whitespace-nowrap">
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
        <TaskActions id={id}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
