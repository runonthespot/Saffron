import { QualificationState } from "../features/qualification/qualificationSlice";
import { PortfolioState } from "../features/portfolio/portfolioSlice";
import { SimulationState } from "../features/simulation/simulationSlice";
import { AuthState } from "../features/auth/authSlice";

export interface AppState {
  qualification: QualificationState;
  portfolio: PortfolioState;
  simulation: SimulationState;
  auth: AuthState;
}
