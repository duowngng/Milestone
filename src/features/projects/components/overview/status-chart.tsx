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

const STATUS_COLORS: Record<string, string> = {
  TODO: "#f87171",
  IN_PROGRESS: "#facc15",
  IN_REVIEW: "#60a5fa",
  DONE: "#34d399",
  BACKLOG: "#f472b6",
};

type FormattedDataEntry = {
  name: string;
  displayName: string;
  value: number;
  fill: string;
};

function formatData(
  data: Record<string, number>,
  colors: Record<string, string>
): FormattedDataEntry[] {
  return Object.entries(data).map(([key, value]) => {
    return {
      name: key.toLowerCase(),
      displayName: snakeCaseToTitleCase(key),
      value,
      fill: colors[key] || "#ccc",
    };
  });
}

type GeneratedChartConfig = Record<string, { label: string; color: string }>;

function generateChartConfig(
  data: FormattedDataEntry[],
  colors: Record<string, string>
): GeneratedChartConfig {
  const config: GeneratedChartConfig = {};
  data.forEach(({ name, displayName }) => {
    config[name] = {
      label: displayName,
      color: colors[name] || "#ccc",
    };
  });
  return config;
}

export const DonutStatusChart = React.memo(
  ({ groupByStatus }: { groupByStatus: Record<string, number> }) => {
    const statusData = React.useMemo(
      () => formatData(groupByStatus, STATUS_COLORS),
      [groupByStatus]
    );
    const chartConfig = React.useMemo(
      () => generateChartConfig(statusData, STATUS_COLORS),
      [statusData]
    );

    const isSmallScreen = useMediaQuery("(max-width: 640px)");

    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Grouped by Task Status</CardDescription>
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
                  data={statusData}
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
DonutStatusChart.displayName = "DonutStatusChart";
