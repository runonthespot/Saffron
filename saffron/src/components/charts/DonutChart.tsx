import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DataPoint[];
  height?: number | string;
  innerRadius?: number;
  outerRadius?: number;
  tooltipFormatter?: (value: number) => string;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

const RADIAN = Math.PI / 180;

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 400,
  innerRadius = 60,
  outerRadius = 80,
  tooltipFormatter,
  showLegend = true,
  centerLabel,
  centerValue,
}) => {
  const theme = useTheme();

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill={theme.palette.text.primary}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderCenterLabel = () => {
    if (!centerLabel && !centerValue) return null;

    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: "14px", fill: theme.palette.text.primary }}
      >
        {centerLabel && (
          <tspan x="50%" dy="-1em">
            {centerLabel}
          </tspan>
        )}
        {centerValue && (
          <tspan x="50%" dy="1.5em">
            {centerValue}
          </tspan>
        )}
      </text>
    );
  };

  return (
    <Box sx={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || theme.palette.primary.main}
              />
            ))}
          </Pie>
          {renderCenterLabel()}
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  {value}
                </Typography>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DonutChart;
