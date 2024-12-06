import { useCallback } from "react";

interface UsePercentageFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  multiplier?: boolean; // If true, multiply by 100 when formatting
}

const usePercentageFormat = (options: UsePercentageFormatOptions = {}) => {
  const {
    locale = "en-GB",
    minimumFractionDigits = 1,
    maximumFractionDigits = 1,
    multiplier = true,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const format = useCallback(
    (value: number): string => {
      const formattedValue = multiplier ? value : value / 100;
      return formatter.format(formattedValue);
    },
    [formatter, multiplier]
  );

  const parse = useCallback(
    (value: string): number => {
      // Remove percentage sign and any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^0-9.-]/g, "");
      const parsedValue = parseFloat(cleanValue) || 0;
      return multiplier ? parsedValue : parsedValue / 100;
    },
    [multiplier]
  );

  const formatInput = useCallback(
    (value: string): string => {
      const numericValue = parse(value);
      if (isNaN(numericValue)) return "";
      const displayValue = multiplier ? numericValue : numericValue * 100;
      return displayValue.toLocaleString(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
      });
    },
    [locale, minimumFractionDigits, maximumFractionDigits, multiplier, parse]
  );

  return {
    format,
    parse,
    formatInput,
  };
};

export default usePercentageFormat;
