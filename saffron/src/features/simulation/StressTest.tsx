import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
  Slider,
  TextField,
  Chip,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Asset, PortfolioState } from "../portfolio/portfolioSlice";
import useCurrencyFormat from "../../hooks/useCurrencyFormat";

interface StressScenario {
  id: string;
  name: string;
  description: string;
  impacts: {
    equity: number;
    bond: number;
    reit: number;
    crypto: number;
    cash: number;
  };
  duration: number; // months
  recovery?: number; // months to recovery
}

const historicalScenarios: StressScenario[] = [
  {
    id: "2008-crisis",
    name: "2008 Financial Crisis",
    description:
      "Global financial crisis triggered by the housing market collapse",
    impacts: {
      equity: -0.56, // S&P 500 dropped ~56%
      bond: 0.05, // Government bonds gained
      reit: -0.67, // Real estate crashed
      crypto: -0.3, // Hypothetical (didn't exist)
      cash: 0.02, // Slight positive return
    },
    duration: 18,
    recovery: 48,
  },
  {
    id: "covid-crash",
    name: "2020 COVID Crash",
    description: "Market reaction to global pandemic",
    impacts: {
      equity: -0.34,
      bond: 0.07,
      reit: -0.4,
      crypto: -0.5,
      cash: 0.01,
    },
    duration: 2,
    recovery: 6,
  },
  {
    id: "dot-com",
    name: "2000 Dot-com Bubble",
    description: "Tech stock bubble burst",
    impacts: {
      equity: -0.49,
      bond: 0.04,
      reit: -0.18,
      crypto: -0.3,
      cash: 0.03,
    },
    duration: 24,
    recovery: 60,
  },
];

interface StressTestProps {
  portfolio: PortfolioState;
}

const StressTest: React.FC<StressTestProps> = ({ portfolio }) => {
  const [selectedScenario, setSelectedScenario] =
    useState<StressScenario | null>(null);
  const [customScenario, setCustomScenario] = useState({
    equity: 0,
    bond: 0,
    reit: 0,
    crypto: 0,
    cash: 0,
    duration: 12,
  });
  const [activeTab, setActiveTab] = useState(0);
  const currencyFormat = useCurrencyFormat();

  const calculateImpact = (
    scenario: StressScenario | typeof customScenario
  ) => {
    if (!portfolio.totalValue || !portfolio.assets.length) return 0;

    const impacts = "impacts" in scenario ? scenario.impacts : scenario;

    return portfolio.assets.reduce((total, asset) => {
      const impact = impacts[asset.type as keyof typeof impacts] || 0;
      const assetValue = portfolio.totalValue * (asset.allocation / 100);
      return total + assetValue * impact;
    }, 0);
  };

  const generateTimelineData = (scenario: StressScenario) => {
    const months = scenario.duration + (scenario.recovery || 0);
    const data = [];
    let currentValue = portfolio.totalValue;

    for (let month = 0; month <= months; month++) {
      if (month === 0) {
        data.push({ month, value: currentValue });
        continue;
      }

      if (month <= scenario.duration) {
        // During crisis
        const monthlyImpact = calculateImpact(scenario) / scenario.duration;
        currentValue += monthlyImpact;
      } else if (scenario.recovery) {
        // Recovery period
        const recoveryAmount =
          portfolio.totalValue - Math.min(...data.map((d) => d.value));
        const monthlyRecovery = recoveryAmount / scenario.recovery;
        currentValue += monthlyRecovery;
      }

      data.push({ month, value: currentValue });
    }

    return data;
  };

  const renderHistoricalScenarios = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Select Historical Scenario
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        {historicalScenarios.map((scenario) => (
          <Chip
            key={scenario.id}
            label={scenario.name}
            onClick={() => setSelectedScenario(scenario)}
            color={selectedScenario?.id === scenario.id ? "primary" : "default"}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>

      {selectedScenario && (
        <>
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedScenario.description}
          </Typography>

          <Box sx={{ height: 300, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateTimelineData(selectedScenario)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: "Months", position: "bottom" }}
                />
                <YAxis
                  tickFormatter={(value) => currencyFormat.format(value)}
                  label={{
                    value: "Portfolio Value",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => currencyFormat.format(Number(value))}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6B46C1"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Impact Analysis
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Asset Class</TableCell>
                  <TableCell align="right">Impact</TableCell>
                  <TableCell align="right">Value Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolio.assets.map((asset) => {
                  const impact =
                    selectedScenario.impacts[
                      asset.type as keyof typeof selectedScenario.impacts
                    ];
                  const valueChange =
                    portfolio.totalValue * (asset.allocation / 100) * impact;
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell align="right">
                        {(impact * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {currencyFormat.format(valueChange)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                  <TableCell>Total Impact</TableCell>
                  <TableCell align="right">
                    {(
                      (calculateImpact(selectedScenario) /
                        portfolio.totalValue) *
                      100
                    ).toFixed(1)}
                    %
                  </TableCell>
                  <TableCell align="right">
                    {currencyFormat.format(calculateImpact(selectedScenario))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );

  const renderCustomScenario = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Custom Stress Scenario
      </Typography>
      <Box sx={{ mb: 3 }}>
        {Object.entries(customScenario).map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {key.charAt(0).toUpperCase() + key.slice(1)} Impact
            </Typography>
            <Slider
              value={typeof value === "number" ? value * 100 : 0}
              onChange={(_, newValue) =>
                setCustomScenario((prev) => ({
                  ...prev,
                  [key]: (newValue as number) / 100,
                }))
              }
              min={-100}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(x) => `${x}%`}
            />
          </Box>
        ))}
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Estimated Impact
        </Typography>
        <Typography variant="h6" color="error">
          {currencyFormat.format(calculateImpact(customScenario))}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {(
            (calculateImpact(customScenario) / portfolio.totalValue) *
            100
          ).toFixed(1)}
          % of portfolio value
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stress Testing
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Analyze how your portfolio might perform under different market
          conditions
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Historical Scenarios" />
          <Tab label="Custom Scenario" />
        </Tabs>

        {activeTab === 0 ? renderHistoricalScenarios() : renderCustomScenario()}
      </Box>
    </Card>
  );
};

export default StressTest;
