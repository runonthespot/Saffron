import React from "react";
import {
  Card as MuiCard,
  CardContent,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { Info as InfoIcon } from "lucide-react";

interface CardProps {
  title?: string;
  subtitle?: string;
  info?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  info,
  children,
  action,
}) => {
  return (
    <MuiCard
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ height: "100%", p: 4 }}>
        {(title || subtitle || action || info) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: subtitle ? 1 : 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {title && (
                  <Typography
                    variant="h5"
                    color="text.primary"
                    gutterBottom={false}
                  >
                    {title}
                  </Typography>
                )}
                {info && (
                  <Tooltip title={info} arrow placement="top">
                    <InfoIcon
                      size={16}
                      style={{
                        color: "rgba(0, 0, 0, 0.54)",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              {action && <Box sx={{ ml: 2 }}>{action}</Box>}
            </Box>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
