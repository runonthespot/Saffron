import React from "react";
import {
  Stepper as MuiStepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Typography,
} from "@mui/material";

interface StepData {
  label: string;
  content: React.ReactNode;
  optional?: boolean;
}

interface StepperProps {
  steps: StepData[];
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  onComplete?: () => void;
  orientation?: "horizontal" | "vertical";
  showContent?: boolean;
  isStepValid?: (step: number) => boolean;
  isStepOptional?: (step: number) => boolean;
  isStepSkipped?: (step: number) => boolean;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onNext,
  onBack,
  onComplete,
  orientation = "horizontal",
  showContent = true,
  isStepValid = () => true,
  isStepOptional = () => false,
  isStepSkipped = () => false,
}) => {
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <MuiStepper activeStep={activeStep} orientation={orientation}>
        {steps.map((step, index) => {
          const stepProps: { completed?: boolean; optional?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};

          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }

          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }

          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
              {orientation === "vertical" && showContent && (
                <StepContent>
                  <Box sx={{ mb: 4 }}>{step.content}</Box>
                  <Box
                    sx={{
                      mb: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      pt: 2,
                      mt: 2,
                    }}
                  >
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mr: 1 }}
                        disabled={!isStepValid(index)}
                      >
                        {isLastStep ? "Finish" : "Continue"}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={onBack}
                        sx={{ mr: 1 }}
                        variant="outlined"
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              )}
            </Step>
          );
        })}
      </MuiStepper>
      {orientation === "horizontal" && showContent && (
        <Box sx={{ mt: 2 }}>
          {steps[activeStep].content}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={onBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
            >
              {isLastStep ? "Finish" : "Continue"}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Stepper;
