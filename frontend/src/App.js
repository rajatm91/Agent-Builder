
import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  SportsEsports as PlaygroundIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  Group,
  Memory,
  AccountTree
} from "@mui/icons-material";
import ChatBox from "./components/ChatBox";
import AgentList from "./components/AgentList";
import WorkFlowsList from "./components/WorkFlowsList";
import ModelsList from "./components/ModelsList";

const App = () => {
  const [refreshAgent, setRefreshAgent] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openItem, setOpenedItem] = useState("");
  const [refreshAgentList, setRefreshAgentList] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Build");
  const [expanded, setExpanded] = useState(false);

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

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* Header Section */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "16px 32px",
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <DashboardIcon sx={{ color: "#1976d2", mr: 1 }} />
          <Typography variant="h6">Agent of Agents</Typography>
        </Box>

        <Box>
          <Button
            variant={selectedTab === "Build" ? "contained" : "outlined"}
            color="primary"
            startIcon={<BuildIcon />}
            onClick={() => setSelectedTab("Build")}
            sx={{ mx: 1, textTransform: "capitalize" }}
          >
            Build
          </Button>
          <Button
            variant={selectedTab === "Playground" ? "contained" : "outlined"}
            color="secondary"
            startIcon={<PlaygroundIcon />}
            onClick={() => setSelectedTab("Playground")}
            sx={{ mx: 1, textTransform: "capitalize" }}
          >
            Playground
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          height: "1px",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          width: "100%"
        }}
      />

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Left Panel */}
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
            p: 2
          }}
        >
          {selectedTab === "Build" && (
            <>
              <Accordion
                expanded={expanded === "agents"}
                onChange={handleChange("agents")}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="agents-header"
                >
                  <Group sx={{ mr: 1, color: "#1565c0" }} />
                  <Typography>Agents</Typography>
                </AccordionSummary>
                <Divider sx={{ width: "100%" }} />
                <AccordionDetails>
                  <AgentList onRefresh={handleRefreshAgentListAfterEdit} />
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expanded === "models"}
                onChange={handleChange("models")}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="models-header"
                >
                  <Memory sx={{ mr: 1, color: "#1565c0" }} />
                  <Typography>Models</Typography>
                </AccordionSummary>
                <Divider sx={{ width: "100%" }} />
                <AccordionDetails>
                  <ModelsList />
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expanded === "workflows"}
                onChange={handleChange("workflows")}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="workflows-header"
                >
                  <AccountTree sx={{ mr: 1, color: "#1565c0" }} />
                  <Typography>Workflows</Typography>
                </AccordionSummary>
                <Divider sx={{ width: "100%" }} />
                <AccordionDetails>
                  <WorkFlowsList refresh={refreshAgent} />
                </AccordionDetails>
              </Accordion>
            </>
          )}
          {selectedTab === "Playground" && (
            <Accordion
              expanded={expanded === "workflows"}
              onChange={handleChange("workflows")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="workflows-header"
              >
                <AccountTree sx={{ mr: 1, color: "#1565c0" }} />
                <Typography>Workflows</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <WorkFlowsList />
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        {/* Vertical Separator */}
        <Box sx={{ width: "1px", backgroundColor: "rgba(0, 0, 0, 0.1)" }} />

        {/* Right Panel (ChatBox) */}
        <Box sx={{ flex: 1 }}>
          {selectedTab === "Build" && (
            <ChatBox onCreateAgent={handleCreateAgent} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
