import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Asset {
  id: string;
  name: string;
  allocation: number;
  expectedReturn: number;
  risk: number;
  type: "equity" | "bond" | "reit" | "cash" | "crypto";
  color: string;
}

export interface PortfolioState {
  assets: Asset[];
  totalRisk: number;
  expectedReturn: number;
  isOptimized: boolean;
  isComplete: boolean;
  totalValue: number;
}

const initialState: PortfolioState = {
  assets: [],
  totalRisk: 0,
  expectedReturn: 0,
  isOptimized: false,
  isComplete: false,
  totalValue: 1000000,
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
      // Recalculate portfolio metrics
      state.totalRisk = calculateTotalRisk(action.payload);
      state.expectedReturn = calculateExpectedReturn(action.payload);
    },
    updateAssetAllocation: (
      state,
      action: PayloadAction<{ id: string; allocation: number }>
    ) => {
      const asset = state.assets.find((a) => a.id === action.payload.id);
      if (asset) {
        asset.allocation = action.payload.allocation;
        // Recalculate portfolio metrics
        state.totalRisk = calculateTotalRisk(state.assets);
        state.expectedReturn = calculateExpectedReturn(state.assets);
      }
    },
    optimizePortfolio: (state) => {
      state.isOptimized = true;
      // Optimization logic would go here
    },
    setComplete: (state) => {
      state.isComplete = true;
    },
    resetPortfolio: () => initialState,
  },
});

// Helper functions for portfolio calculations
const calculateTotalRisk = (assets: Asset[]): number => {
  // Simplified risk calculation - in reality, would include correlation matrix
  return assets.reduce((total, asset) => {
    return total + (asset.risk * asset.allocation) / 100;
  }, 0);
};

const calculateExpectedReturn = (assets: Asset[]): number => {
  return assets.reduce((total, asset) => {
    return total + (asset.expectedReturn * asset.allocation) / 100;
  }, 0);
};

export const {
  setAssets,
  updateAssetAllocation,
  optimizePortfolio,
  setComplete,
  resetPortfolio,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
