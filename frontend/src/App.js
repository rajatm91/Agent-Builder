import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  styled,
  CircularProgress
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  SportsEsports as PlaygroundIcon,
  ExpandMore as ExpandMoreIcon,
  Group,
  Memory,
  AccountTree
} from "@mui/icons-material";
import ChatBox from "./components/ChatBox";
import AgentList from "./components/AgentList";
import WorkFlowsList from "./components/WorkFlowsList";
import ModelsList from "./components/ModelsList";
import AgentChatBox from "./components/AgentChatBox";

// Styled Components
const StyledAccordion = styled(Accordion)({
  margin: "10px 0",
  borderRadius: "10px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
  backgroundColor: "#ffffff",
  transition: "all 0.3s ease",
  "&:before": { display: "none" },
  "&:hover": {
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
    transform: "scale(1.02)"
  }
});

const StyledButton = styled(Button)(({ selected }) => ({
  textTransform: "capitalize",
  fontWeight: selected ? "bold" : "normal",
  background: selected
    ? "linear-gradient(135deg, #1976d2, #2196f3)"
    : "transparent",
  color: selected ? "#fff" : "#1976d2",
  padding: "10px 20px",
  borderRadius: "8px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: selected
      ? "linear-gradient(135deg, #1565c0, #1e88e5)"
      : "rgba(25, 118, 210, 0.1)",
    transform: "scale(1.05)"
  }
}));

const App = () => {
  const [refreshAgent, setRefreshAgent] = useState([]);
  const [refreshAgentList, setRefreshAgentList] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Build");
  const [expanded, setExpanded] = useState(false);
  const [buildingBlocks, setBuildingBlocks] = useState({
    agents: [],
    models: [],
    workflows: [],
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    const fetchBuildingBlocks = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/api/building_blocks"
        );
        const data = await response.json();
        setBuildingBlocks(data);
      } catch (error) {
        console.error("Error fetching building blocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingBlocks();
  }, []);

  const handleCreateAgent = () => {
    setRefreshAgent(!refreshAgent);
  };

  const handleRefreshAgentListAfterEdit = () => {
    setRefreshAgentList(!refreshAgentList);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleWorkFlowSelected = (workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedTab("Playground")
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#e3f2fd"
        }}
      >
        <CircularProgress sx={{ color: "#1565c0" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f9fbfc"
      }}
    >
      {/* Header Section */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "16px 32px",
          background: "linear-gradient(180deg, #ffffff, #e3f2fd)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <DashboardIcon sx={{ color: "#1976d2", mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Agent of Agents Dashboard
          </Typography>
        </Box>

        <Box>
          <StyledButton
            selected={selectedTab === "Build"}
            startIcon={<BuildIcon />}
            onClick={() => {
              setSelectedWorkflow(null);
              setSelectedTab("Build");
            }}
            sx={{ mx: 1 }}
          >
            Build
          </StyledButton>
          <StyledButton
            selected={selectedTab === "Playground"}
            startIcon={<PlaygroundIcon />}
            onClick={() => setSelectedTab("Playground")}
            sx={{ mx: 1 }}
          >
            Playground
          </StyledButton>
        </Box>
      </Paper>

      <Divider sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }} />

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Left Panel */}
        <Box
          sx={{
            background: "linear-gradient(180deg, #ffffff, #e3f2fd)",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
            padding: "12px",
            width: "320px",
            borderRadius: "12px 0 0 12px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {selectedTab === "Build" && (
            <>
              {buildingBlocks.agents.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "agents"}
                  onChange={handleChange("agents")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="agents-header"
                  >
                    <Group sx={{ mr: 1, color: "#1976d2" }} />
                    <Typography sx={{ fontWeight: "bold" }}>Agents</Typography>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <AgentList
                      agents={buildingBlocks.agents}
                      onRefresh={handleRefreshAgentListAfterEdit}
                    />
                  </AccordionDetails>
                </StyledAccordion>
              )}
              {buildingBlocks.models.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "models"}
                  onChange={handleChange("models")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="models-header"
                  >
                    <Memory sx={{ mr: 1, color: "#1976d2" }} />
                    <Typography sx={{ fontWeight: "bold" }}>Models</Typography>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <ModelsList models={buildingBlocks.models} />
                  </AccordionDetails>
                </StyledAccordion>
              )}
              {/* Workflows Accordion */}
              {buildingBlocks.workflows.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "workflows"}
                  onChange={handleChange("workflows")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="workflows-header"
                  >
                    <AccountTree sx={{ mr: 1, color: "#1976d2" }} />
                    <Typography sx={{ fontWeight: "bold" }}>
                      Workflows
                    </Typography>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <WorkFlowsList
                      workflows={buildingBlocks.workflows}
                      onWorkFlowSelected={handleWorkFlowSelected}
                    />
                  </AccordionDetails>
                </StyledAccordion>
              )}
            </>
          )}
          {selectedTab === "Playground" && (
            <StyledAccordion
              expanded={expanded === "workflows"}
              onChange={handleChange("workflows")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="workflows-header"
              >
                <AccountTree sx={{ mr: 1, color: "#1976d2" }} />
                <Typography sx={{ fontWeight: "bold" }}>Workflows</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <WorkFlowsList
                  workflows={buildingBlocks.workflows}
                  onWorkFlowSelected={handleWorkFlowSelected}
                />
              </AccordionDetails>
            </StyledAccordion>
          )}
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        />

        {/* Right Panel */}
        <Box
          sx={{
            background: "linear-gradient(180deg, #ffffff, #e3f2fd)",
            padding: "16px",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {selectedTab === "Build" && selectedWorkflow === null ? (
            <ChatBox onCreateAgent={handleCreateAgent} />
          ) : selectedWorkflow ? (
            <AgentChatBox agent={selectedWorkflow} />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
