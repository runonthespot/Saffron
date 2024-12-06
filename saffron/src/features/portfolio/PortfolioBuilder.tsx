import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  RefreshCw,
  TrendingUp,
  Coins,
  Building,
  Wallet,
  Bitcoin,
  MessageCircle,
} from "lucide-react";
import Card from "../../components/common/Card";
import DonutChart from "../../components/charts/DonutChart";
import FormInput from "../../components/common/FormInput";
import { TabsContainer } from "../../components/common/TabPanel";
import SimulationChart from "../simulation/SimulationChart";
import StressTest from "../simulation/StressTest";
import usePercentageFormat from "../../hooks/usePercentageFormat";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useTypedSelector } from "../../hooks/useAppSelector";
import {
  setAssets,
  updateAssetAllocation,
  optimizePortfolio,
  setComplete,
  Asset,
  PortfolioState,
} from "./portfolioSlice";
import ReactMarkdown from "react-markdown";

const defaultAssets: Asset[] = [
  {
    id: "global-equity",
    name: "Global Equities",
    allocation: 55,
    expectedReturn: 0.07,
    risk: 0.15,
    type: "equity",
    color: "#6B46C1",
  },
  {
    id: "bonds",
    name: "Government Bonds",
    allocation: 25,
    expectedReturn: 0.03,
    risk: 0.05,
    type: "bond",
    color: "#805AD5",
  },
  {
    id: "reits",
    name: "Real Estate",
    allocation: 10,
    expectedReturn: 0.06,
    risk: 0.12,
    type: "reit",
    color: "#9F7AEA",
  },
  {
    id: "crypto",
    name: "Cryptocurrency",
    allocation: 5,
    expectedReturn: 0.25,
    risk: 0.75,
    type: "crypto",
    color: "#D6BCFA",
  },
  {
    id: "cash",
    name: "Cash",
    allocation: 5,
    expectedReturn: 0.02,
    risk: 0.01,
    type: "cash",
    color: "#B794F4",
  },
];

const getAssetIcon = (type: string) => {
  switch (type) {
    case "equity":
      return <TrendingUp size={20} />;
    case "bond":
      return <Coins size={20} />;
    case "reit":
      return <Building size={20} />;
    case "crypto":
      return <Bitcoin size={20} />;
    case "cash":
      return <Wallet size={20} />;
    default:
      return null;
  }
};

interface PortfolioCommentary {
  allocation: string;
  risk: string;
}

const generatePortfolioCommentary = async (
  assets: Asset[],
  totalRisk: number,
  expectedReturn: number
): Promise<PortfolioCommentary> => {
  try {
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
            content:
              "You are a sophisticated investment advisor. Provide concise, markdown-formatted analysis of portfolio allocations and risk metrics. Use bullet points, headers, and emphasis where appropriate. Keep responses clear and professional.",
          },
          {
            role: "user",
            content: `Analyze this portfolio:
              Assets: ${assets
                .map(
                  (a) =>
                    `${a.name}: ${a.allocation.toFixed(1)}% (Return: ${(
                      a.expectedReturn * 100
                    ).toFixed(1)}%, Risk: ${(a.risk * 100).toFixed(1)}%)`
                )
                .join(", ")}
              Total Portfolio Risk: ${(totalRisk * 100).toFixed(1)}%
              Expected Return: ${(expectedReturn * 100).toFixed(1)}%
              
              Provide two sections:
              1. Asset Allocation Analysis (evaluate the allocation strategy)
              2. Risk/Return Analysis (assess the risk-return tradeoff)`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const fullResponse = data.choices[0].message.content;

    // Split the response into allocation and risk sections
    const [allocation, risk] = fullResponse.split(
      /\d\.\s+Risk\/Return Analysis:/
    );

    return {
      allocation: allocation
        .replace(/1\.\s+Asset Allocation Analysis:\s+/, "")
        .trim(),
      risk: risk?.trim() || "Unable to generate risk analysis.",
    };
  } catch (error) {
    console.error("Error generating portfolio commentary:", error);
    return {
      allocation: "Unable to generate allocation analysis.",
      risk: "Unable to generate risk analysis.",
    };
  }
};

const PortfolioBuilder: React.FC = () => {
  const dispatch = useAppDispatch();
  const portfolio = useTypedSelector(
    (state) => state.portfolio
  ) as PortfolioState;
  const percentFormat = usePercentageFormat();
  const [commentary, setCommentary] = useState<PortfolioCommentary>({
    allocation: "",
    risk: "",
  });
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);
  const [hasGeneratedCommentary, setHasGeneratedCommentary] = useState(false);

  useEffect(() => {
    if (portfolio.assets.length === 0) {
      dispatch(setAssets(defaultAssets));
    }
  }, [dispatch, portfolio.assets.length]);

  const handleAllocationChange = (id: string, value: string | number) => {
    const allocation = typeof value === "string" ? parseFloat(value) : value;
    if (!isNaN(allocation)) {
      dispatch(updateAssetAllocation({ id, allocation }));
    }
  };

  const handleOptimize = () => {
    dispatch(optimizePortfolio());
    dispatch(setComplete());
  };

  const handleGenerateCommentary = async () => {
    setIsLoadingCommentary(true);
    const newCommentary = await generatePortfolioCommentary(
      portfolio.assets,
      portfolio.totalRisk,
      portfolio.expectedReturn
    );
    setCommentary(newCommentary);
    setIsLoadingCommentary(false);
    setHasGeneratedCommentary(true);
  };

  // Generate commentary on first load
  useEffect(() => {
    if (portfolio.assets.length > 0 && !hasGeneratedCommentary) {
      handleGenerateCommentary();
    }
  }, [portfolio.assets.length]);

  const chartData = portfolio.assets.map((asset) => ({
    name: asset.name,
    value: asset.allocation,
    color: asset.color,
  }));

  const PortfolioContent = (
    <Grid container spacing={4}>
      <Grid item xs={12}>
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
                Analyzing portfolio...
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
                "& h1, & h2, & h3, & h4": {
                  color: (theme) => theme.palette.text.primary,
                  fontSize: "1rem",
                  fontWeight: 500,
                  mb: 1,
                },
              }}
            >
              <ReactMarkdown>{commentary.allocation}</ReactMarkdown>
              <ReactMarkdown>{commentary.risk}</ReactMarkdown>
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card
          title="Asset Allocation"
          info="Adjust the allocation percentages to match your investment strategy"
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {portfolio.assets.map((asset) => (
              <FormInput
                key={asset.id}
                type="slider"
                label={asset.name}
                value={asset.allocation}
                onChange={(value) => handleAllocationChange(asset.id, value)}
                min={0}
                max={100}
                step={5}
                formatter={percentFormat.format}
                helperText={`Expected Return: ${percentFormat.format(
                  asset.expectedReturn
                )}, Risk: ${percentFormat.format(asset.risk)}`}
                startAdornment={getAssetIcon(asset.type)}
              />
            ))}
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card
          title="Portfolio Overview"
          subtitle={`Expected Return: ${percentFormat.format(
            portfolio.expectedReturn
          )}`}
        >
          <Box sx={{ height: 400 }}>
            <DonutChart
              data={chartData}
              height={300}
              innerRadius={60}
              outerRadius={100}
              tooltipFormatter={percentFormat.format}
              centerLabel="Total Risk"
              centerValue={percentFormat.format(portfolio.totalRisk)}
            />
          </Box>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOptimize}
              startIcon={<RefreshCw />}
              disabled={portfolio.isOptimized}
              size="large"
            >
              Optimize Portfolio
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Portfolio Construction
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Customize your investment portfolio allocation
      </Typography>

      <TabsContainer
        tabs={[
          {
            label: "Portfolio Builder",
            content: PortfolioContent,
          },
          {
            label: "Monte Carlo Simulation",
            content: <SimulationChart />,
          },
          {
            label: "Stress Testing",
            content: <StressTest portfolio={portfolio} />,
          },
        ]}
      />
    </Box>
  );
};

export default PortfolioBuilder;
