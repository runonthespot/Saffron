import { configureStore } from "@reduxjs/toolkit";
import qualificationReducer from "../features/qualification/qualificationSlice";
import portfolioReducer from "../features/portfolio/portfolioSlice";
import simulationReducer from "../features/simulation/simulationSlice";
import { AppState } from "../types/store";

const rootReducer = {
  qualification: qualificationReducer,
  portfolio: portfolioReducer,
  simulation: simulationReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
