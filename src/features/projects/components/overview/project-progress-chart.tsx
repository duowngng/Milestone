"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ProjectProgressProps = {
  data: {
    totalCompletedTaskCount: number;
    totalOverdueTaskCount: number;
    totalOnTimeTaskCount: number;
    totalTaskCount: number;
  };
};

type CustomLabelProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  value?: number;
  index?: number;
  dataKey: "Completed" | "Overdue" | "OnTime";
};

const chartConfig = {
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

const CustomLabel = React.memo(
  ({
    x,
    y,
    width,
    height,
    dataKey,
    chartData,
  }: CustomLabelProps & {
    chartData: Array<{
      name: string;
      Completed: number;
      Overdue: number;
      OnTime: number;
    }>;
  }) => {
    const dataValue = chartData[0]?.[dataKey];

    if (typeof dataValue !== "number" || dataValue <= 0) return null;

    if (width < 30) return null;

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
CustomLabel.displayName = "ProjectProgressCustomLabel";

export const ProjectProgressChart = React.memo(
  ({ data }: ProjectProgressProps) => {
    const {
      totalCompletedTaskCount,
      totalOverdueTaskCount,
      totalOnTimeTaskCount,
      totalTaskCount,
    } = data;

    const chartData = React.useMemo(() => {
      const safeTotalTaskCount = totalTaskCount || 1;
      return [
        {
          name: "Progress",
          Completed: parseFloat(
            ((totalCompletedTaskCount / safeTotalTaskCount) * 100).toFixed(0)
          ),
          Overdue: parseFloat(
            ((totalOverdueTaskCount / safeTotalTaskCount) * 100).toFixed(0)
          ),
          OnTime: parseFloat(
            ((totalOnTimeTaskCount / safeTotalTaskCount) * 100).toFixed(0)
          ),
        },
      ];
    }, [
      totalCompletedTaskCount,
      totalOverdueTaskCount,
      totalOnTimeTaskCount,
      totalTaskCount,
    ]);

    const renderCompletedLabel = React.useCallback(
      (props: Omit<CustomLabelProps, "dataKey" | "chartData">) => (
        <CustomLabel {...props} dataKey="Completed" chartData={chartData} />
      ),
      [chartData]
    );
    const renderOverdueLabel = React.useCallback(
      (props: Omit<CustomLabelProps, "dataKey" | "chartData">) => (
        <CustomLabel {...props} dataKey="Overdue" chartData={chartData} />
      ),
      [chartData]
    );
    const renderOnTimeLabel = React.useCallback(
      (props: Omit<CustomLabelProps, "dataKey" | "chartData">) => (
        <CustomLabel {...props} dataKey="OnTime" chartData={chartData} />
      ),
      [chartData]
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[75px] aspect-auto" config={chartConfig}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ left: 10, right: 10 }}
              barSize={40}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />

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
ProjectProgressChart.displayName = "ProjectProgressChart";
