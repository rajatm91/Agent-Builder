import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Drawer,
  Button,
  Divider
} from "@mui/material";
import ChatBox from "./components/ChatBox";
import AgentList from "./components/AgentList";
import WorkFlowsList from "./components/WorkFlowsList";
import ModelsList from "./components/ModelsList";

const App = () => {
  const [refreshAgent, setRefreshAgent] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openItem, setOpenedItem] = useState("");
  const [refreshAgentList, setRefreshAgentList] = useState([]);

  const handleCreateAgent = (details) => {
    setRefreshAgent(!refreshAgent);
  };

  const handleRefreshAgentListAfterEdit = () => {
    setRefreshAgentList(!refreshAgentList);
  };

  const openSideBar = (item) => {
    setOpenedItem(item);
    setSidebarOpen(true);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #e0f7fa, #80deea)",
        fontFamily: '"Roboto", sans-serif'
      }}
    >
      {/* Header Section with Icons and Title */}
      <Paper
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 4,
          mb: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Typography
          variant="h4"
          align="left"
          sx={{ color: "#00796b", fontWeight: 600, flexGrow: 1 }}
        >
          Agent Generator
        </Typography>

        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => openSideBar("model")}
            sx={{ ml: 2, textTransform: "capitalize", borderRadius: 2 }}
          >
            Models List
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => openSideBar("workflows")}
            sx={{ ml: 2, textTransform: "capitalize", borderRadius: 2 }}
          >
            Agents List
          </Button>
        </Box>
      </Paper>

      {/* Main Content Section */}
      <Box sx={{ flex: 1, overflow: "auto", px: 4, pb: 4 }}>
        <Grid container spacing={3} sx={{ height: "100%" }}>
          {/* ChatBox Section */}
          <Grid item xs={12} md={9}>
            <ChatBox onCreateAgent={handleCreateAgent} />
          </Grid>
          {/* Agent List Section */}
          <Grid item xs={12} md={3}>
            <WorkFlowsList refresh={refreshAgent} />
          </Grid>
        </Grid>
      </Box>

      {/* Sidebar for Workflow & Models List */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "320px",
            padding: "24px",
            background: "#ffffff",
            boxShadow: "2px 0 10px rgba(0,0,0,0.2)",
            borderRadius: "8px"
          }
        }}
      >
        {/* Workflow Sidebar Header */}
        {openItem === "workflows" ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500, color: "#00796b" }}>
                Agents
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setSidebarOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <AgentList onRefresh={handleRefreshAgentListAfterEdit} />
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500, color: "#00796b" }}>
                Models
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setSidebarOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ModelsList />
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default App;
