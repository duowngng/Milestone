import { DottedSeparator } from "./dotted-separator";

import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";

interface AnalyticsProps {
  data: {
    monthlyTaskCount: number;
    monthlyTaskDifference: number;
    monthlyAssignedTaskCount: number;
    monthlyAssignedTaskDifference: number;
    monthlyCompletedTaskCount: number;
    monthlyCompletedTaskDifference: number;
    monthlyIncompleteTaskCount: number;
    monthlyIncompleteTaskDifference: number;
    monthlyOverdueTaskCount: number;
    monthlyOverdueTaskDifference: number;
  };
}

export const Analytics = ({ data }: AnalyticsProps) => {
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total Tasks"
            value={data.monthlyTaskCount}
            variant={data.monthlyTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.monthlyTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.monthlyAssignedTaskCount}
            variant={data.monthlyAssignedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.monthlyAssignedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed Tasks"
            value={data.monthlyCompletedTaskCount}
            variant={data.monthlyCompletedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.monthlyCompletedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.monthlyIncompleteTaskCount}
            variant={data.monthlyIncompleteTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.monthlyIncompleteTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.monthlyOverdueTaskCount}
            variant={data.monthlyOverdueTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.monthlyOverdueTaskDifference}
          />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
