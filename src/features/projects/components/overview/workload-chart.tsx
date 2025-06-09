"use client";

import * as React from "react";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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

type WorkloadProps = {
  totalTaskCount: number;
  workload: WorkloadEntry[];
};

type CustomLabelProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
};

const CustomLabelComponent = React.memo(
  ({ x, y, width, height, value }: CustomLabelProps): JSX.Element | null => {
    if (width < 50 || value <= 0) return null;

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
        {`${value}%`}
      </text>
    );
  }
);
CustomLabelComponent.displayName = "WorkloadCustomLabel";

interface TooltipDataItem {
  payload?: {
    name?: string;
    percentage?: number;
    total?: number;
  };
}

export const WorkloadChart = React.memo(
  ({ totalTaskCount, workload }: WorkloadProps) => {
    const chartData = React.useMemo(
      () =>
        workload.map((member) => {
          const safeTotalTaskCount = totalTaskCount || 1;
          return {
            name: member?.assignee?.name || "Unassigned",
            percentage: parseFloat(
              ((member.total / safeTotalTaskCount) * 100).toFixed(0)
            ),
            total: member.total,
          };
        }),
      [workload, totalTaskCount]
    );

    const chartConfig = {
      percentage: {
        label: "Workload (%)",
        color: "#60a5fa",
      },
    } satisfies Record<string, { label: string; color: string }>;

    const renderCustomBarLabel = React.useCallback(
      (props: CustomLabelProps) => {
        return <CustomLabelComponent {...props} />;
      },
      []
    );

    const tooltipFormatter = React.useCallback(
      (value: number, name: string, props: TooltipDataItem) => {
        const entryPayload = props.payload;
        const memberTaskCount = entryPayload?.total || 0;
        const safeTotalTaskCount = totalTaskCount || 0;

        return [
          <span
            className="font-mono"
            key={`${name}-${value}-${memberTaskCount}`}
          >
            {value}% ({memberTaskCount}/{safeTotalTaskCount} tasks)
          </span>,
        ];
      },
      [totalTaskCount]
    );

    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Project Workload</CardTitle>
          <CardDescription>Workload breakdown for each member</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              barSize={20}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickFormatter={(val) => `${val}%`} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={tooltipFormatter}
              />
              <Bar
                dataKey="percentage"
                fill="#60a5fa"
                label={renderCustomBarLabel}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);
WorkloadChart.displayName = "MemoizedWorkloadChart";
