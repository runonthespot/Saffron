import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip as MuiTooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
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
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
} from "recharts";
import { useTypedSelector } from "../../hooks/useAppSelector";
import useCurrencyFormat from "../../hooks/useCurrencyFormat";
import { QualificationState } from "../qualification/qualificationSlice";
import { PortfolioState } from "../portfolio/portfolioSlice";
import { RefreshCw, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Import illustrations
import GrowingAnalytics from "../../assets/illustrations/growing_analytics.svg";
import FinanceAnalytics from "../../assets/illustrations/finance_analytics.svg";

import StressTest from "./StressTest";

const generateSimulationData = (
  initialAmount: number,
  monthlyContribution: number,
  years: number,
  expectedReturn: number,
  risk: number
) => {
  const data = [];
  let currentAmount = initialAmount;
  const monthlyReturn = expectedReturn / 12;
  const monthlyRisk = risk / Math.sqrt(12);
  const simulations = 1000;

  // Run Monte Carlo simulation
  const paths = Array(simulations)
    .fill(0)
    .map(() => {
      let amount = initialAmount;
      const yearlyValues = [amount];

      for (let year = 1; year <= years; year++) {
        for (let month = 0; month < 12; month++) {
          const randomReturn =
            monthlyReturn + monthlyRisk * (Math.random() * 2 - 1);
          amount = amount * (1 + randomReturn) + monthlyContribution;
        }
        yearlyValues.push(amount);
      }
      return yearlyValues;
    });

  // Calculate percentiles for each year
  for (let year = 0; year <= years; year++) {
    const yearValues = paths.map((path) => path[year]).sort((a, b) => a - b);
    const p95 = yearValues[Math.floor(simulations * 0.95)];
    const p75 = yearValues[Math.floor(simulations * 0.75)];
    const p50 = yearValues[Math.floor(simulations * 0.5)];
    const p25 = yearValues[Math.floor(simulations * 0.25)];
    const p05 = yearValues[Math.floor(simulations * 0.05)];

    data.push({
      year,
      p95,
      p75,
      median: p50,
      p25,
      p05,
      contribution: monthlyContribution * 12 * year + initialAmount,
    });
  }

  return data;
};

const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `£${(value / 1_000).toFixed(0)}K`;
  }
  return `£${value.toFixed(0)}`;
};

// Calculate Sharpe Ratio
const calculateSharpeRatio = (
  returns: number[],
  riskFreeRate: number = 0.02
) => {
  const excessReturns = returns.map((r) => r - riskFreeRate);
  const avgExcessReturn =
    excessReturns.reduce((a, b) => a + b) / excessReturns.length;
  const stdDev = Math.sqrt(
    excessReturns.reduce((a, b) => a + Math.pow(b - avgExcessReturn, 2), 0) /
      excessReturns.length
  );
  return avgExcessReturn / stdDev;
};

// Calculate Maximum Drawdown
const calculateMaxDrawdown = (values: number[]) => {
  let maxDrawdown = 0;
  let peak = values[0];

  values.forEach((value) => {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  return maxDrawdown;
};

// Calculate Value at Risk (VaR)
const calculateVaR = (returns: number[], confidenceLevel: number = 0.95) => {
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * returns.length);
  return -sortedReturns[index];
};

// Fama-French factor calculations
const calculateFactorExposures = (returns: number[]) => {
  // Simulated factor returns (in practice, these would come from a data provider)
  const marketFactor = returns.map((r) => r * 1.1 + 0.001); // Beta slightly > 1
  const sizeFactor = returns.map((r) => r * 0.3 + 0.002); // Small positive size exposure
  const valueFactor = returns.map((r) => r * -0.2 + 0.001); // Slight negative value exposure
  const momentumFactor = returns.map((r) => r * 0.4 + 0.002); // Positive momentum exposure

  // Calculate factor betas using simplified regression
  const calculateBeta = (factorReturns: number[]) => {
    const covariance =
      returns.reduce(
        (sum, r, i) =>
          sum + (r - mean(returns)) * (factorReturns[i] - mean(factorReturns)),
        0
      ) / returns.length;
    const variance =
      factorReturns.reduce(
        (sum, r) => sum + Math.pow(r - mean(factorReturns), 2),
        0
      ) / factorReturns.length;
    return covariance / variance;
  };

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;

  return {
    market: calculateBeta(marketFactor),
    size: calculateBeta(sizeFactor),
    value: calculateBeta(valueFactor),
    momentum: calculateBeta(momentumFactor),
    rSquared: 0.92, // Simplified R-squared (would be calculated in practice)
    alpha: 0.015, // Simplified alpha (would be calculated in practice)
  };
};

const OPENAI_SYSTEM_PROMPT = `You are a friendly financial advisor explaining complex portfolio analytics to regular investors.
Keep explanations concise (2-3 sentences), practical, and focused on what it means for their investment.
Avoid jargon, and when you must use technical terms, explain them simply. Use new lines between paragraphs.`;

interface FactorAnalysis {
  market: number;
  size: number;
  value: number;
  momentum: number;
  rSquared: number;
  alpha: number;
}

const generateCommentary = async (
  factorExposures: FactorAnalysis
): Promise<string> => {
  try {
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      console.error("OpenAI API key not found in environment variables");
      return "OpenAI API key not configured. Please check environment setup.";
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: OPENAI_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Please explain what this factor analysis means for an investor's portfolio:
            - Market Beta: ${factorExposures.market.toFixed(2)}
            - Size Factor: ${factorExposures.size.toFixed(2)}
            - Value Factor: ${factorExposures.value.toFixed(2)}
            - Momentum Factor: ${factorExposures.momentum.toFixed(2)}
            - Alpha: ${(factorExposures.alpha * 100).toFixed(2)}%
            - R-squared: ${(factorExposures.rSquared * 100).toFixed(1)}%`,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API");
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "Unable to generate commentary at this time. Please check the console for details.";
  }
};

interface EfficientFrontierPoint {
  risk: number;
  return: number;
  current?: boolean;
}

const SimulationChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"10y" | "20y" | "30y">("30y");
  const [analysisTab, setAnalysisTab] = useState(0);
  const currencyFormat = useCurrencyFormat();
  const [commentary, setCommentary] = useState<string>("");
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);
  const portfolio = useTypedSelector(
    (state) => state.portfolio
  ) as PortfolioState;
  const qualification = useTypedSelector(
    (state) => state.qualification
  ) as QualificationState;

  // State for simulation metrics
  const [metrics, setMetrics] = useState({
    simulationData: [] as any[],
    returns: [] as number[],
    sharpeRatio: 0,
    maxDrawdown: 0,
    valueAtRisk: 0,
  });

  // Calculate simulation data and metrics when inputs change
  useEffect(() => {
    const simulationData = generateSimulationData(
      qualification.existingSavings,
      qualification.monthlyContribution,
      parseInt(timeframe),
      portfolio.expectedReturn,
      portfolio.totalRisk
    );

    const lastYearData = simulationData[simulationData.length - 1];
    const returns = simulationData
      .map((d, i) =>
        i > 0
          ? (d.median - simulationData[i - 1].median) /
            simulationData[i - 1].median
          : 0
      )
      .slice(1);

    setMetrics({
      simulationData,
      returns,
      sharpeRatio: calculateSharpeRatio(returns),
      maxDrawdown: calculateMaxDrawdown(simulationData.map((d) => d.median)),
      valueAtRisk: calculateVaR(returns),
    });
  }, [
    timeframe,
    qualification.existingSavings,
    qualification.monthlyContribution,
    portfolio.expectedReturn,
    portfolio.totalRisk,
  ]);

  const generateSimulationCommentary = async () => {
    setIsLoadingCommentary(true);
    try {
      const lastYearData =
        metrics.simulationData[metrics.simulationData.length - 1];
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are a sophisticated investment advisor. Provide concise, markdown-formatted analysis of portfolio simulations. Use bullet points, headers, and emphasis where appropriate. Keep responses clear and professional. Focus on key insights and actionable recommendations.",
              },
              {
                role: "user",
                content: `Analyze these simulation results for a ${timeframe} investment horizon:
                - Median Portfolio Value: ${currencyFormat.format(
                  lastYearData.median
                )}
                - 95th Percentile: ${currencyFormat.format(lastYearData.p95)}
                - 5th Percentile: ${currencyFormat.format(lastYearData.p05)}
                - Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
                - Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(1)}%
                - Value at Risk (95%): ${(metrics.valueAtRisk * 100).toFixed(
                  1
                )}%
                
                Provide insights on the simulation results, risk metrics, and recommendations.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      const data = await response.json();
      setCommentary(data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating simulation commentary:", error);
      setCommentary("Unable to generate simulation analysis.");
    }
    setIsLoadingCommentary(false);
  };

  // Generate commentary when metrics change
  useEffect(() => {
    if (metrics.simulationData.length > 0) {
      generateSimulationCommentary();
    }
  }, [metrics]);

  const renderAnalysisContent = () => {
    switch (analysisTab) {
      case 0: // Monte Carlo
        return renderMonteCarloTab(metrics.simulationData);
      case 1: // Efficient Frontier
        return renderEfficientFrontierTab(metrics.returns);
      case 2: // Factor Analysis
        return renderFactorAnalysisTab(metrics.returns);
      default:
        return null;
    }
  };

  const handleTimeframeChange = (
    _: React.MouseEvent<HTMLElement>,
    newTimeframe: "10y" | "20y" | "30y" | null
  ) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  const years = parseInt(timeframe);
  const data = generateSimulationData(
    qualification.existingSavings,
    qualification.monthlyContribution,
    years,
    portfolio.expectedReturn,
    portfolio.totalRisk
  );

  // Extract returns for risk metrics
  const returns = data
    .map((d, i) =>
      i > 0 ? (d.median - data[i - 1].median) / data[i - 1].median : 0
    )
    .slice(1);

  // Calculate risk metrics
  const sharpeRatio = calculateSharpeRatio(returns);
  const maxDrawdown = calculateMaxDrawdown(data.map((d) => d.median));
  const valueAtRisk = calculateVaR(returns);

  // Generate efficient frontier data
  const efficientFrontierData: EfficientFrontierPoint[] = [
    ...Array.from({ length: 20 }, (_, i) => ({
      risk: portfolio.totalRisk * ((i + 1) / 10),
      return: portfolio.expectedReturn * Math.sqrt((i + 1) / 10),
      current: false,
    })),
    {
      risk: portfolio.totalRisk,
      return: portfolio.expectedReturn,
      current: true,
    },
  ];

  // Calculate factor exposures
  const factorExposures = calculateFactorExposures(returns);

  const factorData = [
    { factor: "Market", beta: factorExposures.market },
    { factor: "Size", beta: factorExposures.size },
    { factor: "Value", beta: factorExposures.value },
    { factor: "Momentum", beta: factorExposures.momentum },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p95 = payload.find((p: any) => p.dataKey === "p95")?.value;
      const median = payload.find((p: any) => p.dataKey === "median")?.value;
      const p05 = payload.find((p: any) => p.dataKey === "p05")?.value;
      const contribution = payload.find(
        (p: any) => p.dataKey === "contribution"
      )?.value;

      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Year {label}
          </Typography>
          <Box sx={{ display: "grid", gap: 1 }}>
            {p95 && (
              <Typography variant="body2" color="text.secondary">
                95th Percentile: {currencyFormat.format(p95)}
              </Typography>
            )}
            {median && (
              <Typography variant="body2" color="text.secondary">
                Median: {currencyFormat.format(median)}
              </Typography>
            )}
            {p05 && (
              <Typography variant="body2" color="text.secondary">
                5th Percentile: {currencyFormat.format(p05)}
              </Typography>
            )}
            {contribution && (
              <Typography variant="body2" color="text.secondary">
                Total Contributions: {currencyFormat.format(contribution)}
              </Typography>
            )}
          </Box>
        </Box>
      );
    }
    return null;
  };

  const handleGenerateCommentary = async () => {
    setIsLoadingCommentary(true);
    const newCommentary = await generateCommentary(factorExposures);
    setCommentary(newCommentary.replace(/\n/g, "<br />"));
    setIsLoadingCommentary(false);
  };

  // Update factor analysis effect to use metrics instead of hasGeneratedCommentary
  useEffect(() => {
    if (analysisTab === 2 && metrics.returns.length > 0) {
      const factorExposures = calculateFactorExposures(metrics.returns);
    }
  }, [analysisTab, metrics.returns]);

  const renderAnalysis = () => {
    switch (analysisTab) {
      case 0:
        return (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Years",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  tickFormatter={formatLargeNumber}
                  label={{
                    value: "Portfolio Value (£)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Uncertainty bands - Cone of Uncertainty */}
                <Area
                  type="monotone"
                  dataKey="p95"
                  stackId="1"
                  stroke="none"
                  fill="#6B46C1"
                  fillOpacity={0.05}
                  name="95th Percentile"
                />
                <Area
                  type="monotone"
                  dataKey="p75"
                  stackId="1"
                  stroke="none"
                  fill="#6B46C1"
                  fillOpacity={0.1}
                  name="75th Percentile"
                />
                <Area
                  type="monotone"
                  dataKey="p25"
                  stackId="2"
                  stroke="none"
                  fill="#6B46C1"
                  fillOpacity={0.1}
                  name="25th Percentile"
                />
                <Area
                  type="monotone"
                  dataKey="p05"
                  stackId="2"
                  stroke="none"
                  fill="#6B46C1"
                  fillOpacity={0.05}
                  name="5th Percentile"
                />

                {/* Main lines */}
                <Line
                  type="monotone"
                  dataKey="p95"
                  stroke="#6B46C1"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name="95th Percentile"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p05"
                  stroke="#6B46C1"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name="5th Percentile"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="median"
                  stroke="#6B46C1"
                  strokeWidth={2}
                  name="Median Outcome"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="contribution"
                  stroke="#4A5568"
                  strokeDasharray="5 5"
                  name="Total Contributions"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey="risk" name="Risk %" unit="%" />
                <YAxis
                  type="number"
                  dataKey="return"
                  name="Return %"
                  unit="%"
                />
                <ZAxis range={[100]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Efficient Frontier"
                  data={efficientFrontierData.filter((d) => !d.current)}
                  fill="#8884d8"
                />
                <Scatter
                  name="Current Portfolio"
                  data={[
                    {
                      risk: portfolio.totalRisk * 100,
                      return: portfolio.expectedReturn * 100,
                    },
                  ]}
                  fill="#E53E3E"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Fama-French Factor Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Portfolio factor exposures based on historical returns
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 4,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={factorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="factor" />
                      <YAxis
                        label={{
                          value: "Factor Beta",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Bar dataKey="beta" fill="#6B46C1" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              <Paper sx={{ flex: 1, p: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Alpha (annualized)</TableCell>
                      <TableCell align="right">
                        {(factorExposures.alpha * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>R-squared</TableCell>
                      <TableCell align="right">
                        {(factorExposures.rSquared * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Market Beta</TableCell>
                      <TableCell align="right">
                        {factorExposures.market.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Size Factor</TableCell>
                      <TableCell align="right">
                        {factorExposures.size.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Value Factor</TableCell>
                      <TableCell align="right">
                        {factorExposures.value.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Momentum Factor</TableCell>
                      <TableCell align="right">
                        {factorExposures.momentum.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            <Box sx={{ mt: 3 }}>{renderCommentary()}</Box>
          </Box>
        );
    }
  };

  const renderCommentary = () => (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle2" color="primary">
            AI Commentary
          </Typography>
          <Button
            size="small"
            startIcon={<MessageCircle size={16} />}
            onClick={handleGenerateCommentary}
            disabled={isLoadingCommentary}
          >
            Refresh Analysis
          </Button>
        </Box>
        {isLoadingCommentary ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Analyzing simulations...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              "& p": {
                color: (theme) => theme.palette.text.secondary,
                fontSize: "0.875rem",
                mb: 1,
                "&:last-child": { mb: 0 },
              },
              "& ul, & ol": { pl: 2 },
              "& li": {
                color: (theme) => theme.palette.text.secondary,
                fontSize: "0.875rem",
              },
            }}
          >
            <ReactMarkdown>{commentary}</ReactMarkdown>
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderMonteCarloTab = (data: any[]) => {
    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{
                value: "Years",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              tickFormatter={(value) => formatLargeNumber(value)}
              label={{
                value: "Portfolio Value (£)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value: number) => formatLargeNumber(value)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="p95"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.1}
              name="95th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p75"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.1}
              name="75th Percentile"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#8884d8"
              strokeWidth={2}
              name="Median"
            />
            <Area
              type="monotone"
              dataKey="p25"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.1}
              name="25th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p05"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.1}
              name="5th Percentile"
            />
            <Line
              type="monotone"
              dataKey="contribution"
              stroke="#ff7300"
              strokeDasharray="5 5"
              name="Total Contribution"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderEfficientFrontierTab = (returns: number[]) => {
    // Generate efficient frontier data
    const baseData: EfficientFrontierPoint[] = Array.from(
      { length: 20 },
      (_, i) => ({
        risk: (i + 1) * 0.01,
        return: 0.02 + (i + 1) * 0.01 * 0.5 + Math.random() * 0.02,
        current: false,
      })
    );

    // Add current portfolio point
    const efficientFrontierData: EfficientFrontierPoint[] = [
      ...baseData,
      {
        risk: portfolio.totalRisk,
        return: portfolio.expectedReturn,
        current: true,
      },
    ];

    // Filter data
    const frontierPoints = efficientFrontierData.filter((d) => !d.current);
    const currentPoint = efficientFrontierData.filter((d) => d.current);

    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="risk"
              name="Risk"
              label={{
                value: "Risk (Standard Deviation)",
                position: "insideBottom",
                offset: -5,
              }}
              domain={[0, 0.2]}
              tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            <YAxis
              type="number"
              dataKey="return"
              name="Return"
              label={{
                value: "Expected Return",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 0.15]}
              tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            <Tooltip
              formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
            />
            <Legend />
            <Scatter
              name="Efficient Frontier"
              data={frontierPoints}
              fill="#8884d8"
            />
            <Scatter
              name="Current Portfolio"
              data={currentPoint}
              fill="#ff7300"
              shape="star"
              r={10}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderFactorAnalysisTab = (returns: number[]) => {
    const factorExposures = calculateFactorExposures(returns);

    return (
      <Box>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                {
                  name: "Market",
                  value: factorExposures.market,
                  fill: "#8884d8",
                },
                { name: "Size", value: factorExposures.size, fill: "#82ca9d" },
                {
                  name: "Value",
                  value: factorExposures.value,
                  fill: "#ffc658",
                },
                {
                  name: "Momentum",
                  value: factorExposures.momentum,
                  fill: "#ff7300",
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Factor Exposure (Beta)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Factor Exposure" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" color="primary">
                Factor Analysis Commentary
              </Typography>
              <Button
                size="small"
                startIcon={<MessageCircle size={16} />}
                onClick={handleGenerateCommentary}
                disabled={isLoadingCommentary}
              >
                Refresh Analysis
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Card>
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Growth Simulation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monte Carlo simulation with advanced risk metrics
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={timeframe}
              exclusive
              onChange={handleTimeframeChange}
              aria-label="timeframe"
              size="small"
            >
              <ToggleButton value="10y">10 Years</ToggleButton>
              <ToggleButton value="20y">20 Years</ToggleButton>
              <ToggleButton value="30y">30 Years</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Tabs
            value={analysisTab}
            onChange={(_, newValue) => setAnalysisTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Monte Carlo" />
            <Tab label="Efficient Frontier" />
            <Tab label="Factor Analysis" />
          </Tabs>

          {renderAnalysis()}
        </Box>
      </Card>
    </Box>
  );
};

export default SimulationChart;
