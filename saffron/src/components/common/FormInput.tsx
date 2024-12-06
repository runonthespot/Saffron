import React, { useState } from "react";
import {
  TextField,
  Slider,
  Typography,
  Box,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { Info } from "lucide-react";

interface FormInputProps {
  type: "text" | "number" | "slider";
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  marks?: { value: number; label: string }[];
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  formatter?: (value: number) => string;
  parser?: (value: string) => number;
  tooltip?: string;
  error?: string;
  helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  label,
  value,
  onChange,
  required = false,
  min,
  max,
  step = type === "number" ? 100 : 1,
  marks,
  startAdornment,
  endAdornment,
  formatter,
  parser,
  tooltip,
  error,
  helperText,
}) => {
  const [editing, setEditing] = useState(false);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (type === "number") {
      if (newValue === "" || newValue === "-") {
        onChange(0);
        return;
      }

      if (parser) {
        const parsed = parser(newValue);
        onChange(parsed);
      } else {
        const parsed = Number(newValue.replace(/[^\d.-]/g, ""));
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    } else {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setEditing(true);
    if (type === "number" && (value === 0 || value === "0")) {
      onChange("");
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (type === "number" && (value === "" || value === undefined)) {
      onChange(0);
    }
  };

  const renderLabel = () => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <Typography
        variant="subtitle2"
        color="text.primary"
        sx={{ fontWeight: 500 }}
      >
        {label}
        {required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip} arrow placement="top">
          <Info
            size={16}
            style={{
              marginLeft: "8px",
              color: "rgba(0, 0, 0, 0.54)",
              cursor: "help",
            }}
          />
        </Tooltip>
      )}
    </Box>
  );

  if (type === "slider") {
    return (
      <Box>
        {renderLabel()}
        <Slider
          value={value as number}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          marks={marks}
          valueLabelDisplay="auto"
        />
        {helperText && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    );
  }

  const displayValue = editing
    ? typeof value === "number"
      ? value.toString()
      : value
    : formatter && value !== null && value !== undefined
    ? formatter(Number(value))
    : value;

  if (process.env.NODE_ENV === "development") {
    console.log("FormInput Debug - " + label + ":", {
      editing,
      rawValue: value,
      displayValue,
      hasFormatter: !!formatter,
      valueType: typeof value,
    });
  }

  return (
    <Box>
      {renderLabel()}
      <TextField
        type={editing ? "number" : "text"}
        value={displayValue}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth
        required={required}
        inputProps={{
          min,
          max,
          step,
        }}
        InputProps={{
          startAdornment: startAdornment && (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
          endAdornment: endAdornment && (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ),
        }}
        error={!!error}
        helperText={error || helperText}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "background.paper",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "action.hover",
            },
            "&.Mui-focused": {
              backgroundColor: "background.paper",
            },
          },
          "& .MuiOutlinedInput-input": {
            color: "text.primary",
          },
        }}
      />
    </Box>
  );
};

export default FormInput;
