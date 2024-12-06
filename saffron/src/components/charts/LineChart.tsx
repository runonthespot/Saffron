import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import { useTheme } from "@mui/material/styles";

interface DataPoint {
  [key: string]: number | string;
}

interface LineChartProps {
  data: DataPoint[];
  lines: {
    key: string;
    color?: string;
    name?: string;
    areaOpacity?: number;
  }[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number | string;
  tooltipFormatter?: (value: number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  showArea?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  height = 400,
  tooltipFormatter,
  showGrid = true,
  showLegend = true,
  showArea = false,
}) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.grey[200]}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          label={
            xAxisLabel
              ? {
                  value: xAxisLabel,
                  position: "bottom",
                  offset: -10,
                }
              : undefined
          }
          tick={{ fill: theme.palette.text.secondary }}
        />
        <YAxis
          label={
            yAxisLabel
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                }
              : undefined
          }
          tick={{ fill: theme.palette.text.secondary }}
        />
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
        )}
        {lines.map(({ key, color, name, areaOpacity = 0.1 }) => (
          <React.Fragment key={key}>
            {showArea && (
              <Area
                type="monotone"
                dataKey={key}
                name={name || key}
                stroke={color || theme.palette.primary.main}
                fill={color || theme.palette.primary.main}
                fillOpacity={areaOpacity}
              />
            )}
            <Line
              type="monotone"
              dataKey={key}
              name={name || key}
              stroke={color || theme.palette.primary.main}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </React.Fragment>
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
