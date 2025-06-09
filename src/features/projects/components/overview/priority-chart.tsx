"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const PRIORITY_COLORS = {
  LOW: "#eff6ff",
  MEDIUM: "#bfdbfe",
  HIGH: "#60a5fa",
  URGENT: "#f87171",
};

function formatData(
  data: Record<string, number>,
  colors: Record<string, string>
) {
  return Object.entries(data).map(([key, value]) => {
    return {
      name: key.toLowerCase(),
      displayName: snakeCaseToTitleCase(key),
      value,
      fill: colors[key] || "#ccc",
    };
  });
}

function generateChartConfig(
  data: { name: string; displayName: string }[],
  colors: Record<string, string>
) {
  const config: Record<string, { label: string; color: string }> = {};
  data.forEach(({ name, displayName }) => {
    config[name] = {
      label: displayName,
      color: colors[name.toUpperCase()] || "#ccc",
    };
  });
  return config;
}

export const DonutPriorityChart = React.memo(
  ({ groupByPriority }: { groupByPriority: Record<string, number> }) => {
    const priorityData = React.useMemo(
      () => formatData(groupByPriority, PRIORITY_COLORS),
      [groupByPriority]
    );
    const chartConfig = React.useMemo(
      () => generateChartConfig(priorityData, PRIORITY_COLORS),
      [priorityData]
    );

    const isSmallScreen = useMediaQuery("(max-width: 640px)");

    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Grouped by Task Priority</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full h-[250px] sm:h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={isSmallScreen ? 40 : 60}
                  outerRadius={isSmallScreen ? 70 : 100}
                  strokeWidth={3}
                  paddingAngle={4}
                  cx={isSmallScreen ? "50%" : "40%"}
                />
                <ChartLegend
                  layout={isSmallScreen ? "horizontal" : "vertical"}
                  verticalAlign={isSmallScreen ? "bottom" : "middle"}
                  align={isSmallScreen ? "center" : "right"}
                  content={<ChartLegendContent nameKey="name" />}
                  wrapperStyle={
                    isSmallScreen
                      ? { paddingTop: "20px" }
                      : { paddingLeft: "40px" }
                  }
                  className={
                    isSmallScreen
                      ? "flex flex-row flex-wrap justify-center gap-2"
                      : "flex flex-col items-start gap-1"
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);
DonutPriorityChart.displayName = "DonutPriorityChart";
