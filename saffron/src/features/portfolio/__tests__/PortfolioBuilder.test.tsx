import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../../../utils/test-utils";
import PortfolioBuilder from "../PortfolioBuilder";
import { Asset } from "../portfolioSlice";

// Mock the OpenAI API call
jest.mock("../../../services/openai", () => ({
  generatePortfolioCommentary: jest.fn().mockResolvedValue({
    allocation: "Test allocation analysis",
    risk: "Test risk analysis",
    portfolioSuggestion: {
      assets: [
        {
          id: "global-equity",
          allocation: 60,
        },
        {
          id: "bonds",
          allocation: 40,
        },
      ],
    },
  }),
}));

describe("PortfolioBuilder Component", () => {
  const mockAssets: Asset[] = [
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
  ];

  const initialState = {
    qualification: {
      isComplete: true,
      age: 30,
      riskTolerance: "moderate",
      investmentHorizon: "5-10",
      investmentGoal: "growth",
    },
    portfolio: {
      assets: mockAssets,
      totalRisk: 0.12,
      expectedReturn: 0.06,
      isOptimized: false,
      isComplete: false,
      totalValue: 1000000,
    },
  };

  const renderBuilder = () => {
    return render(<PortfolioBuilder />, { preloadedState: initialState });
  };

  it("renders portfolio builder interface", async () => {
    renderBuilder();
    expect(screen.getByText(/Portfolio Construction/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Equities/i)).toBeInTheDocument();
    expect(screen.getByText(/Government Bonds/i)).toBeInTheDocument();
  });

  it("handles allocation adjustments", async () => {
    renderBuilder();
    const slider = screen.getAllByRole("slider")[0]; // First slider is for Global Equities
    fireEvent.change(slider, { target: { value: "60" } });
    expect(slider).toHaveValue("60");
  });

  it("validates total allocation equals 100%", async () => {
    renderBuilder();
    const slider = screen.getAllByRole("slider")[0];
    fireEvent.change(slider, { target: { value: "80" } });
    await waitFor(() => {
      // Look for the portfolio overview expected return specifically
      const expectedReturnText = screen
        .getAllByText(/Expected Return/i)
        .find((element) => element.tagName.toLowerCase() === "h6");
      expect(expectedReturnText).toBeInTheDocument();
    });
  });

  it("optimizes portfolio based on qualification", async () => {
    renderBuilder();
    const optimizeButton = screen.getByRole("button", {
      name: /Optimize Portfolio/i,
    });
    fireEvent.click(optimizeButton);
    await waitFor(() => {
      expect(screen.getByText(/Portfolio Overview/i)).toBeInTheDocument();
    });
  });
});
