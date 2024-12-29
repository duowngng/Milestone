import { ProjectAnayticsResponseType } from "@/features/projects/api/use-get-project-analytics";

import { DottedSeparator } from "./dotted-separator";

import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";

export const Analytics = ({ data }: ProjectAnayticsResponseType) => {
  return(
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total Tasks"
            value={data.taskCount}
            variant={data.taskDifferece > 0 ? "up" : "down"}
            increaseValue={data.taskDifferece}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifferece > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDifferece}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed Tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskDifferece > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifferece}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDifferece > 0 ? "up" : "down"}
            increaseValue={data.incompleteTaskDifferece}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifferece > 0 ? "up" : "down"}
            increaseValue={data.overdueTaskDifferece}
          />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
};
