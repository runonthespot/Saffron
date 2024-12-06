import { useState, useCallback } from "react";

interface Step {
  id: number;
  isValid: boolean;
  isComplete: boolean;
}

interface UseFormStepsProps {
  totalSteps: number;
  onComplete?: () => void;
}

const useFormSteps = ({ totalSteps, onComplete }: UseFormStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>(
    Array.from({ length: totalSteps }, (_, i) => ({
      id: i + 1,
      isValid: false,
      isComplete: false,
    }))
  );

  const updateStepValidity = useCallback((stepId: number, isValid: boolean) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, isValid } : step
      )
    );
  }, []);

  const completeStep = useCallback(
    (stepId: number) => {
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId ? { ...step, isComplete: true } : step
        )
      );

      if (stepId === totalSteps && onComplete) {
        onComplete();
      }
    },
    [totalSteps, onComplete]
  );

  const canProceed = useCallback(
    (stepId: number) => {
      const step = steps.find((s) => s.id === stepId);
      return step?.isValid || step?.isComplete;
    },
    [steps]
  );

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed(currentStep)) {
      completeStep(currentStep);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed, completeStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (stepId: number) => {
      if (
        stepId >= 1 &&
        stepId <= totalSteps &&
        steps.slice(0, stepId - 1).every((step) => step.isComplete)
      ) {
        setCurrentStep(stepId);
      }
    },
    [totalSteps, steps]
  );

  const resetSteps = useCallback(() => {
    setCurrentStep(1);
    setSteps(
      Array.from({ length: totalSteps }, (_, i) => ({
        id: i + 1,
        isValid: false,
        isComplete: false,
      }))
    );
  }, [totalSteps]);

  return {
    currentStep,
    steps,
    updateStepValidity,
    completeStep,
    canProceed,
    nextStep,
    previousStep,
    goToStep,
    resetSteps,
  };
};

export default useFormSteps;
