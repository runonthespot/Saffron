import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#6B46C1",
      light: "#805AD5",
      dark: "#553C9A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#4A5568",
      light: "#718096",
      dark: "#2D3748",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F7FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2D3748",
      secondary: "#4A5568",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: "1.1rem",
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          borderRadius: "8px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(107, 70, 193, 0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6B46C1",
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 8,
          padding: "15px 0",
        },
        track: {
          height: 8,
          borderRadius: 4,
          backgroundColor: "#6B46C1",
        },
        rail: {
          height: 8,
          borderRadius: 4,
          opacity: 0.2,
          backgroundColor: "#6B46C1",
        },
        thumb: {
          width: 24,
          height: 24,
          backgroundColor: "#fff",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
          "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
            boxShadow: "0px 3px 8px rgba(107, 70, 193, 0.3)",
          },
        },
        valueLabel: {
          backgroundColor: "#6B46C1",
        },
        mark: {
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "#6B46C1",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: "#6B46C1",
          },
          "&.Mui-completed": {
            color: "#6B46C1",
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: "#6B46C1",
          },
          "&.Mui-completed": {
            color: "#6B46C1",
          },
        },
      },
    },
  },
});

export default theme;
