import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { runMonteCarloSimulation } from "../../utils/monteCarloSimulation";
import { RootState } from "../../store";
import { QualificationState } from "../qualification/qualificationSlice";
import { PortfolioState } from "../portfolio/portfolioSlice";

export interface SimulationPoint {
  year: number;
  portfolioValue: number;
  contributions: number;
  returns: number;
  realValue?: number;
}

export interface SimulationPath {
  id: string;
  points: SimulationPoint[];
  percentile: number;
}

export interface SimulationState {
  paths: SimulationPath[];
  medianPath: SimulationPoint[];
  confidenceInterval: {
    upper: SimulationPoint[];
    lower: SimulationPoint[];
  };
  isNominal: boolean;
  showConfidenceIntervals: boolean;
  isRunning: boolean;
  isComplete: boolean;
}

const initialState: SimulationState = {
  paths: [],
  medianPath: [],
  confidenceInterval: {
    upper: [],
    lower: [],
  },
  isNominal: true,
  showConfidenceIntervals: true,
  isRunning: false,
  isComplete: false,
};

interface SimulationResult {
  medianPath: SimulationPoint[];
  upperBound: SimulationPoint[];
  lowerBound: SimulationPoint[];
  paths: SimulationPath[];
}

export const runSimulation = createAsyncThunk<
  SimulationResult,
  void,
  { state: RootState }
>("simulation/run", async (_, { getState }) => {
  const state = getState();
  const qualification = state.qualification as QualificationState;
  const portfolio = state.portfolio as PortfolioState;

  console.log("Running simulation with:", {
    qualification,
    portfolio,
  });

  const result = runMonteCarloSimulation({
    qualification,
    portfolio: portfolio.assets,
    numPaths: 1000,
    yearsToProject: Math.max(
      40,
      qualification.retirementAge - qualification.age + 20
    ),
    inflationRate: 0.02,
  });

  console.log("Simulation result:", result);

  return {
    medianPath: result.medianPath,
    upperBound: result.upperBound,
    lowerBound: result.lowerBound,
    paths: result.paths.map((points, index) => ({
      id: `path-${index}`,
      points,
      percentile: (index / result.paths.length) * 100,
    })),
  };
});

const simulationSlice = createSlice({
  name: "simulation",
  initialState,
  reducers: {
    toggleNominalValues: (state) => {
      state.isNominal = !state.isNominal;
    },
    toggleConfidenceIntervals: (state) => {
      state.showConfidenceIntervals = !state.showConfidenceIntervals;
    },
    resetSimulation: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSimulation.pending, (state) => {
        state.isRunning = true;
        state.isComplete = false;
        console.log("Simulation pending...");
      })
      .addCase(runSimulation.fulfilled, (state, action) => {
        console.log("Simulation fulfilled:", action.payload);
        state.paths = action.payload.paths;
        state.medianPath = action.payload.medianPath;
        state.confidenceInterval = {
          upper: action.payload.upperBound,
          lower: action.payload.lowerBound,
        };
        state.isRunning = false;
        state.isComplete = true;
      })
      .addCase(runSimulation.rejected, (state, action) => {
        console.error("Simulation failed:", action.error);
        state.isRunning = false;
        state.isComplete = false;
      });
  },
});

export const {
  toggleNominalValues,
  toggleConfidenceIntervals,
  resetSimulation,
} = simulationSlice.actions;

export default simulationSlice.reducer;
