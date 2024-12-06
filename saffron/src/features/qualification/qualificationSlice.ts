import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QualificationState {
  age: number;
  income: number;
  existingSavings: number;
  monthlyContribution: number;
  retirementAge: number;
  investmentExperience: "none" | "beginner" | "intermediate" | "advanced";
  riskTolerance: number; // 1-10 scale
  step: number;
  isComplete: boolean;
}

const initialState: QualificationState = {
  age: 0,
  income: 0,
  existingSavings: 0,
  monthlyContribution: 0,
  retirementAge: 65,
  investmentExperience: "none",
  riskTolerance: 5,
  step: 1,
  isComplete: false,
};

const qualificationSlice = createSlice({
  name: "qualification",
  initialState,
  reducers: {
    updateAge: (state, action: PayloadAction<number>) => {
      state.age = action.payload;
    },
    updateIncome: (state, action: PayloadAction<number>) => {
      state.income = action.payload;
    },
    updateExistingSavings: (state, action: PayloadAction<number>) => {
      state.existingSavings = action.payload;
    },
    updateMonthlyContribution: (state, action: PayloadAction<number>) => {
      state.monthlyContribution = action.payload;
    },
    updateRetirementAge: (state, action: PayloadAction<number>) => {
      state.retirementAge = action.payload;
    },
    updateInvestmentExperience: (
      state,
      action: PayloadAction<"none" | "beginner" | "intermediate" | "advanced">
    ) => {
      state.investmentExperience = action.payload;
    },
    updateRiskTolerance: (state, action: PayloadAction<number>) => {
      state.riskTolerance = action.payload;
    },
    nextStep: (state) => {
      state.step += 1;
    },
    previousStep: (state) => {
      state.step -= 1;
    },
    setComplete: (state) => {
      state.isComplete = true;
    },
    resetQualification: () => initialState,
  },
});

export const {
  updateAge,
  updateIncome,
  updateExistingSavings,
  updateMonthlyContribution,
  updateRetirementAge,
  updateInvestmentExperience,
  updateRiskTolerance,
  nextStep,
  previousStep,
  setComplete,
  resetQualification,
} = qualificationSlice.actions;

export default qualificationSlice.reducer;
