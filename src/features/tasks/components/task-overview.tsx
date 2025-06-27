import { PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DottedSeparator } from "@/components/dotted-separator";
import { snakeCaseToTitleCase } from "@/lib/utils";

import { MemberAvatar } from "@/features/members/components/member-avatar";

import { OverviewProperty } from "./overview-property";
import { TaskDate } from "./task-date";

import { Task } from "../types";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useCanManageTask } from "../hooks/use-can-manage-task";

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();
  const { canEditLimitedFields, isLoading } = useCanManageTask({ task });

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>
          {canEditLimitedFields && !isLoading && (
            <Button
              onClick={() => open(task.$id)}
              size="sm"
              variant="secondary"
            >
              <PencilIcon className="size-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            <MemberAvatar name={task.assignee.name} className="size-6" />
            <p className="text-sm font-medium">{task.assignee.name}</p>
          </OverviewProperty>
          <div className="md:grid md:grid-cols-2 md:grid-rows-2 gap-y-4">
            <OverviewProperty label="Start date">
              <TaskDate
                value={task.startDate}
                status={task.status}
                dateType="startDate"
                className="text-sm font-medium"
              />
            </OverviewProperty>
            <OverviewProperty label="Due date">
              <TaskDate
                value={task.dueDate}
                status={task.status}
                dateType="dueDate"
                className="text-sm font-medium"
              />
            </OverviewProperty>

            <OverviewProperty label="Status">
              <Badge variant={task.status}>
                {snakeCaseToTitleCase(task.status)}
              </Badge>
            </OverviewProperty>
            <OverviewProperty label="Priority">
              <Badge variant={task.priority}>
                {snakeCaseToTitleCase(task.priority)}
              </Badge>
            </OverviewProperty>
          </div>
          <OverviewProperty label="Progress">
            <Progress value={task.progress} className="w-40 md:w-80" />
            <span className="w-3 text-xs text-right">{task.progress}%</span>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};
