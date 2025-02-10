import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  Drawer
} from "@mui/material";
import { Chat, Close, GroupAdd, Storage, Work } from "@mui/icons-material"; // Import necessary icons
import ChatBox from "./components/ChatBox";
import AgentList from "./components/AgentList";
import WorkFlowsList from "./components/WorkFlowsList";
import ModelsList from "./components/ModelsList";

const App = () => {
  const [refreshAgent, setRefreshAgent] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openItem, setOpenedItem] = useState("");

  const handleCreateAgent = (details) => {
    setRefreshAgent(!refreshAgent);
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
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)"
      }}
    >
      {/* Header Section with Icons and Title */}
      <Paper
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          mb: 3,
          backgroundColor: "#fff",
          borderRadius: 2
        }}
      >
        <IconButton sx={{ mr: 2 }}>
          <Chat sx={{ color: "#1976d2" }} />
        </IconButton>
        <Typography
          variant="h4"
          align="center"
          sx={{ flexGrow: 1, color: "#1976d2" }}
        >
          Agent Generator
        </Typography>
        <IconButton sx={{ ml: 2 }} onClick={() => openSideBar("model")}>
          <Storage sx={{ color: "#1976d2" }} /> {/* Model icon */}
        </IconButton>
        <IconButton sx={{ ml: 2 }} onClick={() => openSideBar("workflows")}>
          <Work sx={{ color: "#1976d2" }} /> {/* Workflow icon */}
        </IconButton>
      </Paper>

      {/* Main Content Section */}
      <Box sx={{ flex: 1, overflow: "auto", px: 3, pb: 3 }}>
        <Grid container spacing={3} sx={{ height: "100%" }}>
          {/* ChatBox Section */}
          <Grid item xs={12} md={9}>
            <ChatBox onCreateAgent={handleCreateAgent} />
          </Grid>
          {/* Agent List Section */}
          <Grid item xs={12} md={3}>
            <AgentList refreshAgent={refreshAgent} />
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
            width: "300px",
            padding: "16px",
            background: "#fff",
            boxShadow: "2px 0 10px rgba(0,0,0,0.2)"
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
                mb: 2
              }}
            >
              <Typography variant="h6">Workflows</Typography>
              <IconButton onClick={() => setSidebarOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            <WorkFlowsList />
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2
              }}
            >
              <Typography variant="h6">Models</Typography>
              <IconButton onClick={() => setSidebarOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            {/* Models List */}
            <ModelsList />
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default App;
