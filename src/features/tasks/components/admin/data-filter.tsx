"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderIcon,
  ListCheckIcon,
  UserIcon,
  ArrowUpNarrowWide,
  LoaderCircle,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";
import { useGetMembers } from "@/features/members/workspace/api/admin/use-get-admin-members";
import { useGetProjects } from "@/features/projects/api/admin/use-get-admin-projects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/date-range-picker";
import { PageLoader } from "@/components/page-loader";

import { TaskPriority, TaskStatus } from "../../types";
import { useAdminTaskFilters } from "../../hooks/admin/use-task-filters";

export const DataFilter = () => {
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers();

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name || member.email,
  }));

  const [
    {
      name,
      projectId,
      assigneeId,
      status,
      priority,
      startDate,
      dueDate,
      progress,
      createdAt,
      updatedAt,
    },
    setFilters,
  ] = useAdminTaskFilters();

  const [searchTerm, setSearchTerm] = useState(name || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const onStatusChange = useCallback(
    (value: string) => {
      setFilters({ status: value === "all" ? null : (value as TaskStatus) });
    },
    [setFilters]
  );

  const onPriorityChange = useCallback(
    (value: string) => {
      setFilters({
        priority: value === "all" ? null : (value as TaskPriority),
      });
    },
    [setFilters]
  );

  const onAssigneeChange = useCallback(
    (value: string) => {
      setFilters({ assigneeId: value === "all" ? null : (value as string) });
    },
    [setFilters]
  );

  const onProjectChange = useCallback(
    (value: string) => {
      setFilters({ projectId: value === "all" ? null : (value as string) });
    },
    [setFilters]
  );

  const onStartDateChange = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      setFilters({
        startDate: `${range?.from?.toISOString() || ""},${
          range?.to?.toISOString() || ""
        }`,
      });
    },
    [setFilters]
  );

  const onDueDateChange = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      setFilters({
        dueDate: `${range?.from?.toISOString() || ""},${
          range?.to?.toISOString() || ""
        }`,
      });
    },
    [setFilters]
  );

  const onProgressChange = useCallback(
    (value: string) => {
      setFilters({ progress: value === "all" ? null : (value as string) });
    },
    [setFilters]
  );

  const onCreatedAtChange = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      setFilters({
        createdAt: `${range?.from?.toISOString() || ""},${
          range?.to?.toISOString() || ""
        }`,
      });
    },
    [setFilters]
  );

  const onUpdatedAtChange = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      setFilters({
        updatedAt: `${range?.from?.toISOString() || ""},${
          range?.to?.toISOString() || ""
        }`,
      });
    },
    [setFilters]
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (debouncedSearchTerm !== name) {
      setFilters({ name: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, name, setFilters]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-full lg:w-auto flex flex-col lg:flex-row gap-2">
          <Select
            defaultValue={status ?? undefined}
            onValueChange={(value) => onStatusChange(value)}
          >
            <SelectTrigger className="w-full lg:w-auto h-8">
              <div className="flex items-center pr-2">
                <ListCheckIcon className="size-4 mr-2" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectSeparator />
              <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
              <SelectItem value={TaskStatus.TODO}>To do</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS}>
                In progress
              </SelectItem>
              <SelectItem value={TaskStatus.IN_REVIEW}>In review</SelectItem>
              <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue={priority ?? undefined}
            onValueChange={(value) => onPriorityChange(value)}
          >
            <SelectTrigger className="w-full lg:w-auto h-8">
              <div className="flex items-center pr-2">
                <ArrowUpNarrowWide className="size-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Priority</SelectItem>
              <SelectSeparator />
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={assigneeId ?? undefined}
            onValueChange={(value) => onAssigneeChange(value)}
          >
            <SelectTrigger className="w-full lg:w-auto h-8">
              <div className="flex items-center pr-2">
                <UserIcon className="size-4 mr-2" />
                <SelectValue placeholder="Assignee" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Assignee</SelectItem>
              <SelectSeparator />
              {memberOptions?.map((member) => (
                <SelectItem key={member.value} value={member.value}>
                  {member.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            defaultValue={projectId ?? undefined}
            onValueChange={(value) => onProjectChange(value)}
          >
            <SelectTrigger className="w-full lg:w-auto h-8">
              <div className="flex items-center pr-2">
                <FolderIcon className="size-4 mr-2" />
                <SelectValue placeholder="Project" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Project</SelectItem>
              <SelectSeparator />
              {projectOptions?.map((project) => (
                <SelectItem key={project.value} value={project.value}>
                  {project.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={progress?.toString() ?? "all"}
            onValueChange={(value) => onProgressChange(value)}
          >
            <SelectTrigger className="w-full lg:w-auto h-8">
              <div className="flex items-center pr-2">
                <LoaderCircle className="size-4 mr-2" />
                <SelectValue placeholder="Progress" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Progress</SelectItem>
              <SelectSeparator />
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="10">10%</SelectItem>
              <SelectItem value="20">20%</SelectItem>
              <SelectItem value="30">30%</SelectItem>
              <SelectItem value="40">40%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="60">60%</SelectItem>
              <SelectItem value="70">70%</SelectItem>
              <SelectItem value="80">80%</SelectItem>
              <SelectItem value="90">90%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search by name"
          value={searchTerm}
          onChange={onSearchChange}
          className="w-auto h-8 hidden lg:block"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <DateRangePicker
          placeholder="Start date"
          className="w-full lg:w-auto h-8"
          value={
            startDate
              ? {
                  from: startDate.split(",")[0]
                    ? new Date(startDate.split(",")[0])
                    : undefined,
                  to: startDate.split(",")[1]
                    ? new Date(startDate.split(",")[1])
                    : undefined,
                }
              : undefined
          }
          onChange={onStartDateChange}
        />
        <DateRangePicker
          placeholder="Due date"
          className="w-full lg:w-auto h-8"
          value={
            dueDate
              ? {
                  from: dueDate.split(",")[0]
                    ? new Date(dueDate.split(",")[0])
                    : undefined,
                  to: dueDate.split(",")[1]
                    ? new Date(dueDate.split(",")[1])
                    : undefined,
                }
              : undefined
          }
          onChange={onDueDateChange}
        />
        <DateRangePicker
          placeholder="Created date"
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
          placeholder="Updated date"
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
        className="w-full lg:w-auto h-8 block lg:hidden"
      />
    </div>
  );
};
