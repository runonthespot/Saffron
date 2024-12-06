import React from "react";
import { Box, Container, AppBar, Toolbar, Typography } from "@mui/material";
import { Wallet } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Wallet size={24} style={{ marginRight: "12px" }} />
          <Typography variant="h6" component="div">
            Pension Portfolio Planner
          </Typography>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Pension Portfolio Planner. All rights
            reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
