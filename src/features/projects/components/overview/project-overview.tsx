import { ProjectAnayticsResponseType } from "@/features/projects/api/use-get-project-analytics";

import { Analytics } from "@/components/analytics";

import { ProjectProgressChart } from "./project-progress-chart";
import { DonutStatusChart } from "./status-chart";
import { DonutPriorityChart } from "./priority-chart";
import { WorkloadChart } from "./workload-chart";
import { MemberProgressChart } from "./member-progress-chart";

interface ProjectOverviewProps {
  data?: ProjectAnayticsResponseType["data"];
}

export const ProjectOverview = ({ data }: ProjectOverviewProps) => {
  if (!data) return null;

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics data={data} />
      <ProjectProgressChart data={data} />
      <div className="flex flex-col lg:flex-row gap-4">
        <DonutStatusChart groupByStatus={data.groupByStatus} />
        <DonutPriorityChart groupByPriority={data.groupByPriority} />
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <WorkloadChart
          workload={data.workload}
          totalTaskCount={data.totalTaskCount}
        />
        <MemberProgressChart workload={data.workload} />
      </div>
    </div>
  );
};
