import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import {
  CssBaseline,
  Box,
  IconButton,
  Drawer,
  Typography,
} from "@mui/material";
import { Settings } from "lucide-react";
import theme from "./styles/theme";
import { store } from "./store";
import Layout from "./components/common/Layout";
import QualificationForm from "./features/qualification/QualificationForm";
import PortfolioBuilder from "./features/portfolio/PortfolioBuilder";
import { useTypedSelector } from "./hooks/useAppSelector";
import Login from "./features/auth/Login";

const AppContent: React.FC = () => {
  const [showQualification, setShowQualification] = useState(false);
  const { isComplete: isQualificationComplete } = useTypedSelector(
    (state) => state.qualification
  );
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Box
        component="main"
        sx={{
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          position: "relative",
        }}
      >
        {isQualificationComplete ? (
          <>
            <Box sx={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
              <IconButton
                onClick={() => setShowQualification(true)}
                size="small"
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  "&:hover": {
                    bgcolor: "background.paper",
                  },
                }}
              >
                <Settings size={20} />
              </IconButton>
            </Box>
            <PortfolioBuilder />
            <Drawer
              anchor="right"
              open={showQualification}
              onClose={() => setShowQualification(false)}
              PaperProps={{
                sx: { width: "100%", maxWidth: 800, p: 3 },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Update Your Profile</Typography>
                <Typography variant="body2" color="text.secondary">
                  Make changes to your investment profile
                </Typography>
              </Box>
              <QualificationForm />
            </Drawer>
          </>
        ) : (
          <QualificationForm />
        )}
      </Box>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
