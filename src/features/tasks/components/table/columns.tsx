"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { Task } from "../../types";
import { TaskDate } from "../task-date";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "../task-actions";

export const columns = (hideProject: boolean = false): ColumnDef<Task>[] => {
  const cols: (ColumnDef<Task> | false)[] = [
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
    !hideProject && {
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
              name={project.name}
              image={project.imageUrl}
            />
            <p className="line-clamp-1">{project.name}</p>
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
              name={assignee.name}
            />
            <p className="line-clamp-1">{assignee.name}</p>
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
        const status = row.original.status;

        return <TaskDate value={startDate} status={status} />;
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
        const status = row.original.status;

        return <TaskDate value={dueDate} status={status} />;
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
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.$id;
        const projectId = row.original.projectId;

        return (
          <TaskActions id={id} projectId={projectId} task={row.original}>
            <Button variant="ghost" className="size-8 p-0">
              <MoreVertical className="size-4" />
            </Button>
          </TaskActions>
        );
      },
    },
  ];

  return cols.filter(Boolean) as ColumnDef<Task>[];
};
