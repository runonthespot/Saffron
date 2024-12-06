import { Asset } from "../features/portfolio/portfolioSlice";
import { QualificationState } from "../features/qualification/qualificationSlice";
import { SimulationPoint } from "../features/simulation/simulationSlice";

interface SimulationParams {
  qualification: QualificationState;
  portfolio: Asset[];
  numPaths: number;
  yearsToProject: number;
  inflationRate?: number;
}

interface SimulationResult {
  paths: SimulationPoint[][];
  medianPath: SimulationPoint[];
  upperBound: SimulationPoint[];
  lowerBound: SimulationPoint[];
}

// Default market assumptions (annual returns)
const DEFAULT_RETURNS = {
  equity: 0.08, // 8% real return for equities
  bond: 0.04, // 4% real return for bonds
  reit: 0.06, // 6% real return for REITs
  cash: 0.02, // 2% real return for cash
};

// Annual volatility
const DEFAULT_RISKS = {
  equity: 0.15, // 15% volatility for equities
  bond: 0.05, // 5% volatility for bonds
  reit: 0.12, // 12% volatility for REITs
  cash: 0.01, // 1% volatility for cash
};

const generateRandomReturn = (mean: number, volatility: number): number => {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Convert to annual return (using log-normal distribution)
  const annualReturn =
    Math.exp(mean - (volatility * volatility) / 2 + volatility * z) - 1;
  return annualReturn;
};

const calculatePortfolioReturn = (
  portfolio: Asset[]
): { expectedReturn: number; risk: number } => {
  // If portfolio is empty or has zero allocations, use a default balanced portfolio
  if (
    portfolio.length === 0 ||
    portfolio.every((asset) => asset.allocation === 0)
  ) {
    return {
      expectedReturn:
        DEFAULT_RETURNS.equity * 0.6 +
        DEFAULT_RETURNS.bond * 0.3 +
        DEFAULT_RETURNS.reit * 0.05 +
        DEFAULT_RETURNS.cash * 0.05,
      risk:
        DEFAULT_RISKS.equity * 0.6 +
        DEFAULT_RISKS.bond * 0.3 +
        DEFAULT_RISKS.reit * 0.05 +
        DEFAULT_RISKS.cash * 0.05,
    };
  }

  // Calculate weighted average return and risk
  const totalAllocation =
    portfolio.reduce((sum, asset) => sum + asset.allocation, 0) || 100;

  const expectedReturn = portfolio.reduce(
    (sum, asset) =>
      sum + (asset.expectedReturn * asset.allocation) / totalAllocation,
    0
  );

  const risk = portfolio.reduce(
    (sum, asset) => sum + (asset.risk * asset.allocation) / totalAllocation,
    0
  );

  return { expectedReturn, risk };
};

export const runMonteCarloSimulation = ({
  qualification,
  portfolio,
  numPaths = 1000,
  yearsToProject = 40,
  inflationRate = 0.02,
}: SimulationParams): SimulationResult => {
  // Use default values if qualification data is missing or invalid
  const age = qualification.age || 30;
  const retirementAge = qualification.retirementAge || 65;
  const initialValue = qualification.existingSavings || 100000;
  const monthlyContribution = qualification.monthlyContribution || 1000;
  const annualContribution = monthlyContribution * 12;
  const yearsToRetirement = retirementAge - age;

  // Calculate actual projection period (cap at 85 years old)
  const maxAge = 85;
  const actualYearsToProject = Math.min(maxAge - age, yearsToProject);

  // Calculate portfolio returns with defaults if needed
  const { expectedReturn, risk } = calculatePortfolioReturn(portfolio);
  const paths: SimulationPoint[][] = [];

  // Generate paths
  for (let path = 0; path < numPaths; path++) {
    const pathPoints: SimulationPoint[] = [];
    let currentValue = initialValue;
    let totalContributions = initialValue;
    let totalReturns = 0;

    for (let year = 0; year <= actualYearsToProject; year++) {
      // Add annual contribution if still working
      if (year < yearsToRetirement) {
        currentValue += annualContribution;
        totalContributions += annualContribution;
      }

      // Generate and apply return for this year
      const yearReturn = generateRandomReturn(expectedReturn, risk);
      const investmentReturn = currentValue * yearReturn;
      currentValue += investmentReturn;
      totalReturns += investmentReturn;

      // Ensure non-negative portfolio value with a minimum floor
      currentValue = Math.max(totalContributions * 0.5, currentValue);

      // Calculate real value (adjusted for inflation)
      const realValue = currentValue / Math.pow(1 + inflationRate, year);

      pathPoints.push({
        year: year + age,
        portfolioValue: Math.round(currentValue),
        realValue: Math.round(realValue),
        contributions: Math.round(totalContributions),
        returns: Math.round(totalReturns),
      });
    }
    paths.push(pathPoints);
  }

  // Calculate statistics for each year
  const medianPath: SimulationPoint[] = [];
  const upperBound: SimulationPoint[] = [];
  const lowerBound: SimulationPoint[] = [];

  for (let year = 0; year <= actualYearsToProject; year++) {
    const yearValues = paths
      .map((path) => path[year].portfolioValue)
      .sort((a, b) => a - b);
    const yearRealValues = paths
      .map((path) => path[year].realValue!)
      .sort((a, b) => a - b);
    const yearContributions = paths[0][year].contributions;

    const medianIndex = Math.floor(paths.length * 0.5);
    const upperIndex = Math.floor(paths.length * 0.95);
    const lowerIndex = Math.floor(paths.length * 0.05);

    medianPath.push({
      year: year + age,
      portfolioValue: yearValues[medianIndex],
      realValue: yearRealValues[medianIndex],
      contributions: yearContributions,
      returns: yearValues[medianIndex] - yearContributions,
    });

    upperBound.push({
      year: year + age,
      portfolioValue: yearValues[upperIndex],
      realValue: yearRealValues[upperIndex],
      contributions: yearContributions,
      returns: yearValues[upperIndex] - yearContributions,
    });

    lowerBound.push({
      year: year + age,
      portfolioValue: yearValues[lowerIndex],
      realValue: yearRealValues[lowerIndex],
      contributions: yearContributions,
      returns: yearValues[lowerIndex] - yearContributions,
    });
  }

  return {
    paths,
    medianPath,
    upperBound,
    lowerBound,
  };
};
