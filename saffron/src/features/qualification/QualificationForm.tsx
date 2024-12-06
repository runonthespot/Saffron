import React, { useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { PoundSterling } from "lucide-react";
import Card from "../../components/common/Card";
import FormInput from "../../components/common/FormInput";
import Stepper from "../../components/common/Stepper";
import { useTypedSelector } from "../../hooks/useAppSelector";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import useFormSteps from "../../hooks/useFormSteps";
import useFormValidation from "../../hooks/useFormValidation";
import useCurrencyFormat from "../../hooks/useCurrencyFormat";
import {
  updateAge,
  updateIncome,
  updateExistingSavings,
  updateMonthlyContribution,
  updateRetirementAge,
  updateInvestmentExperience,
  updateRiskTolerance,
  setComplete,
  QualificationState,
} from "./qualificationSlice";

const experienceMap = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
} as const;

type ExperienceLevel = keyof typeof experienceMap;

const QualificationForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const qualification = useTypedSelector(
    (state) => state.qualification
  ) as QualificationState;
  const currencyFormat = useCurrencyFormat();

  const validationRules = {
    age: { required: true, min: 18, max: 100 },
    income: { required: true, min: 0 },
    existingSavings: { required: true, min: 0 },
    monthlyContribution: { required: true, min: 0 },
    retirementAge: { required: true, min: 55, max: 75 },
    investmentExperience: { required: true },
    riskTolerance: { required: true, min: 1, max: 10 },
  };

  const { errors, validate, validateAll } = useFormValidation(validationRules);

  const handleComplete = useCallback(() => {
    if (validateAll(qualification)) {
      dispatch(setComplete());
    }
  }, [dispatch, qualification, validateAll]);

  const isStepValid = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0:
          return !errors.age && !errors.income;
        case 1:
          return !errors.existingSavings && !errors.monthlyContribution;
        case 2:
          return !errors.retirementAge;
        case 3:
          return !errors.investmentExperience && !errors.riskTolerance;
        default:
          return false;
      }
    },
    [errors]
  );

  const { currentStep, nextStep, previousStep, updateStepValidity } =
    useFormSteps({
      totalSteps: 4,
      onComplete: handleComplete,
    });

  useEffect(() => {
    // Validate the current step's fields
    switch (currentStep) {
      case 1:
        validate("age", qualification.age);
        validate("income", qualification.income);
        break;
      case 2:
        validate("existingSavings", qualification.existingSavings);
        validate("monthlyContribution", qualification.monthlyContribution);
        break;
      case 3:
        validate("retirementAge", qualification.retirementAge);
        break;
      case 4:
        validate("investmentExperience", qualification.investmentExperience);
        validate("riskTolerance", qualification.riskTolerance);
        break;
    }
    updateStepValidity(currentStep, isStepValid(currentStep));
  }, [currentStep, qualification, validate, updateStepValidity, isStepValid]);

  const steps = [
    {
      label: "Personal Details",
      content: (
        <Card
          title="Tell us about yourself"
          subtitle="We'll use this information to personalize your investment journey"
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormInput
              type="number"
              label="Your Age"
              value={qualification.age}
              onChange={(value) => dispatch(updateAge(Number(value)))}
              required
              min={18}
              max={100}
              tooltip="Your age helps us determine the appropriate investment strategy and time horizon"
              error={errors.age}
            />
            <FormInput
              type="number"
              label="Annual Income"
              value={qualification.income}
              onChange={(value) => dispatch(updateIncome(Number(value) || 0))}
              required
              startAdornment={<PoundSterling size={20} />}
              formatter={currencyFormat.format}
              parser={currencyFormat.parse}
              tooltip="Your income helps us understand your investment capacity"
              error={errors.income}
            />
          </Box>
        </Card>
      ),
    },
    {
      label: "Savings",
      content: (
        <Card
          title="Your Current Savings"
          subtitle="Tell us about your existing savings and monthly contributions"
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormInput
              type="number"
              label="Existing Pension Savings"
              value={qualification.existingSavings}
              onChange={(value) =>
                dispatch(updateExistingSavings(Number(value)))
              }
              required
              startAdornment={<PoundSterling size={20} />}
              formatter={currencyFormat.format}
              parser={currencyFormat.parse}
              tooltip="Include all your pension pots and retirement savings"
              error={errors.existingSavings}
            />
            <FormInput
              type="number"
              label="Monthly Contribution"
              value={qualification.monthlyContribution}
              onChange={(value) =>
                dispatch(updateMonthlyContribution(Number(value)))
              }
              required
              startAdornment={<PoundSterling size={20} />}
              formatter={currencyFormat.format}
              parser={currencyFormat.parse}
              tooltip="How much you plan to save each month"
              error={errors.monthlyContribution}
            />
          </Box>
        </Card>
      ),
    },
    {
      label: "Retirement",
      content: (
        <Card
          title="Retirement Planning"
          subtitle="When would you like to retire?"
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormInput
              type="number"
              label="Target Retirement Age"
              value={qualification.retirementAge}
              onChange={(value) => dispatch(updateRetirementAge(Number(value)))}
              required
              min={55}
              max={75}
              tooltip="This helps us calculate how long your investment horizon should be"
              error={errors.retirementAge}
            />
          </Box>
        </Card>
      ),
    },
    {
      label: "Investment Profile",
      content: (
        <Card
          title="Investment Experience & Risk Tolerance"
          subtitle="Help us understand your investment style"
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormInput
              type="slider"
              label="Investment Experience"
              value={
                experienceMap[
                  qualification.investmentExperience as ExperienceLevel
                ]
              }
              onChange={(value) => {
                const experience = Object.keys(experienceMap)[
                  value as number
                ] as ExperienceLevel;
                dispatch(updateInvestmentExperience(experience));
              }}
              required
              min={0}
              max={3}
              step={1}
              marks={[
                { value: 0, label: "None" },
                { value: 1, label: "Beginner" },
                { value: 2, label: "Intermediate" },
                { value: 3, label: "Advanced" },
              ]}
              tooltip="Your level of experience with investments"
              error={errors.investmentExperience}
            />
            <FormInput
              type="slider"
              label="Risk Tolerance"
              value={qualification.riskTolerance}
              onChange={(value) => dispatch(updateRiskTolerance(Number(value)))}
              required
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: "Very Low" },
                { value: 5, label: "Medium" },
                { value: 10, label: "Very High" },
              ]}
              tooltip="How comfortable are you with investment risk?"
              error={errors.riskTolerance}
            />
          </Box>
        </Card>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Investment Profile
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Let's understand your financial situation and investment goals
      </Typography>
      <Stepper
        steps={steps}
        activeStep={currentStep - 1}
        onNext={nextStep}
        onBack={previousStep}
        onComplete={handleComplete}
        orientation="vertical"
        isStepValid={isStepValid}
      />
    </Box>
  );
};

export default QualificationForm;
