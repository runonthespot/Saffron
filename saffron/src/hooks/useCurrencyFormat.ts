import { useCallback } from "react";

interface UseCurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const useCurrencyFormat = (options: UseCurrencyFormatOptions = {}) => {
  const {
    locale = "en-GB",
    currency = "GBP",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: true,
  });

  const format = useCallback(
    (value: number): string => {
      return formatter.format(value || 0);
    },
    [formatter]
  );

  const parse = useCallback((value: string): number => {
    if (typeof value !== "string") return 0;
    // Remove currency symbol and any grouping separators
    const cleanValue = value.replace(/[£$€,\s]/g, "");
    // Then ensure we only have numbers and at most one decimal point
    const numericValue = cleanValue.replace(/[^\d.-]/g, "");
    const parsedValue = parseFloat(numericValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }, []);

  const formatInput = useCallback(
    (value: string | number): string => {
      const numericValue =
        typeof value === "string" ? parse(value) : value || 0;
      return formatter.format(numericValue);
    },
    [formatter, parse]
  );

  return {
    format,
    parse,
    formatInput,
  };
};

export default useCurrencyFormat;
