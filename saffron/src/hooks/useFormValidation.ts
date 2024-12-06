import { useState, useCallback } from "react";

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback(
    (name: string, value: any): boolean => {
      const rule = rules[name];
      if (!rule) return true;

      let isValid = true;
      let errorMessage = "";

      if (rule.required && !value) {
        isValid = false;
        errorMessage = "This field is required";
      } else if (rule.min !== undefined && value < rule.min) {
        isValid = false;
        errorMessage = `Value must be at least ${rule.min}`;
      } else if (rule.max !== undefined && value > rule.max) {
        isValid = false;
        errorMessage = `Value must be at most ${rule.max}`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        isValid = false;
        errorMessage = "Invalid format";
      } else if (rule.custom && !rule.custom(value)) {
        isValid = false;
        errorMessage = "Invalid value";
      }

      setErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));

      return isValid;
    },
    [rules]
  );

  const validateAll = useCallback(
    (values: { [key: string]: any }): boolean => {
      const validationResults = Object.keys(rules).map((name) =>
        validate(name, values[name])
      );
      return validationResults.every(Boolean);
    },
    [rules, validate]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateAll,
    clearErrors,
  };
};

export default useFormValidation;
