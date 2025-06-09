"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

type WorkloadEntry = {
  assigneeId: string;
  total: number;
  completed: number;
  onTime: number;
  overdue: number;
  assignee?: {
    name: string;
    email: string;
    userId: string;
  };
};

type MemberProgressProps = {
  workload: WorkloadEntry[];
};

type ChartDataItem = {
  name: string;
  Completed: number;
  Overdue: number;
  OnTime: number;
};

type CustomLabelProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  index?: number;
  dataKey?: "Completed" | "Overdue" | "OnTime";
};

const MEMBER_PROGRESS_CONFIG = {
  Completed: {
    label: "Completed",
    color: "#34d399",
  },
  Overdue: {
    label: "Overdue",
    color: "#facc15",
  },
  OnTime: {
    label: "On Time",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

type CustomTooltipProps = Omit<TooltipProps<number, string>, "label"> & {
  chartData: ChartDataItem[];
  workload: WorkloadEntry[];
};

const CustomTooltip = React.memo(
  ({ active, payload, chartData, workload }: CustomTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const seriesName = payload[0]?.payload?.name;

    return (
      <div className="rounded-lg border border-border/50 bg-background p-2 shadow-xl text-xs">
        <p className="font-medium mb-1">{seriesName}</p>
        {payload.map((entry) => {
          const dataKey = entry.dataKey as "Completed" | "Overdue" | "OnTime";
          if (!dataKey || !MEMBER_PROGRESS_CONFIG[dataKey]) return null;

          const color = MEMBER_PROGRESS_CONFIG[dataKey].color;

          const memberIndex = chartData.findIndex((d) => d.name === seriesName);
          const member = workload[memberIndex];

          let taskCount = 0;
          if (member) {
            if (dataKey === "Completed") taskCount = member.completed || 0;
            else if (dataKey === "Overdue") taskCount = member.overdue || 0;
            else if (dataKey === "OnTime") {
              taskCount = Math.max(
                0,
                member.total - member.completed - member.overdue
              );
            }
          }

          return (
            <div key={entry.dataKey} className="flex items-center gap-2 mt-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{MEMBER_PROGRESS_CONFIG[dataKey].label}: </span>
              <span className="font-mono">
                {entry.value}% ({taskCount} tasks)
              </span>
            </div>
          );
        })}
      </div>
    );
  }
);
CustomTooltip.displayName = "MemberProgressCustomTooltip";

const CustomLabelComponent = React.memo(
  ({
    x,
    y,
    width,
    height,
    dataKey,
    index,
    chartData,
  }: CustomLabelProps & { chartData: ChartDataItem[] }) => {
    if (!dataKey || typeof index === "undefined") {
      return null;
    }

    const dataValue = chartData[index]?.[dataKey];

    if (width < 50 || !dataValue || dataValue <= 0) return null;

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {dataValue.toFixed(0)}%
      </text>
    );
  }
);
CustomLabelComponent.displayName = "MemberProgressCustomLabel";

export const MemberProgressChart = React.memo(
  ({ workload }: MemberProgressProps) => {
    const chartData = React.useMemo(
      () =>
        workload.map((member) => {
          const totalTasks = member.total || 1;
          const completed = parseFloat(
            ((member.completed / totalTasks) * 100).toFixed(0)
          );
          const overdue = parseFloat(
            ((member.overdue / totalTasks) * 100).toFixed(0)
          );

          let onTime = 100 - completed - overdue;
          if (onTime < 0) onTime = 0;

          return {
            name: member?.assignee?.name || "Unassigned",
            Completed: completed,
            Overdue: overdue,
            OnTime: onTime,
          };
        }),
      [workload]
    );

    const renderCompletedLabel = React.useCallback(
      (props: CustomLabelProps) => (
        <CustomLabelComponent
          {...props}
          dataKey="Completed"
          chartData={chartData}
        />
      ),
      [chartData]
    );
    const renderOverdueLabel = React.useCallback(
      (props: CustomLabelProps) => (
        <CustomLabelComponent
          {...props}
          dataKey="Overdue"
          chartData={chartData}
        />
      ),
      [chartData]
    );
    const renderOnTimeLabel = React.useCallback(
      (props: CustomLabelProps) => (
        <CustomLabelComponent
          {...props}
          dataKey="OnTime"
          chartData={chartData}
        />
      ),
      [chartData]
    );

    const renderCustomTooltip = React.useCallback(
      (props: TooltipProps<number, string>) => (
        <CustomTooltip {...props} chartData={chartData} workload={workload} />
      ),
      [chartData, workload]
    );

    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Member Task Progress</CardTitle>
          <CardDescription>Progress breakdown for each member</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={MEMBER_PROGRESS_CONFIG}
            className="h-[300px] w-full"
          >
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              barSize={20}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={renderCustomTooltip} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="Completed"
                stackId="a"
                fill="var(--color-Completed)"
                label={renderCompletedLabel}
              />
              <Bar
                dataKey="Overdue"
                stackId="a"
                fill="var(--color-Overdue)"
                label={renderOverdueLabel}
              />
              <Bar
                dataKey="OnTime"
                stackId="a"
                fill="var(--color-OnTime)"
                label={renderOnTimeLabel}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);
MemberProgressChart.displayName = "MemberProgressChart";
