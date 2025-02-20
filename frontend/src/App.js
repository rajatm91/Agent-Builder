//
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
  AccountTree,
  Psychology,
  School
} from "@mui/icons-material";
import ChatBox from "./components/ChatBox";
import AgentList from "./components/AgentList";
import WorkFlowsList from "./components/WorkFlowsList";
import ModelsList from "./components/ModelsList";
import { v4 as uuidv4 } from "uuid";
import SkillsList from "./components/SkillsList";
import KnowledgeHubList from "./components/KnowledgeHubList";

// Custom styled components for better UI
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: "8px 0",
  borderRadius: "8px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  "&:before": {
    display: "none"
  }
}));

const StyledButton = styled(Button)(({ theme, selected }) => ({
  textTransform: "capitalize",
  fontWeight: selected ? "bold" : "normal",
  backgroundColor: selected ? theme.palette.primary.main : "transparent",
  color: selected ? "#fff" : theme.palette.primary.main,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : "rgba(25, 118, 210, 0.1)"
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
  const [uuid, setUuid] = useState("");

  useEffect(() => {
    setUuid(uuidv4()); // Generate a new UUID on component mount
  }, []);
  // Fetch building blocks data from the API
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
  }, [refreshAgent]);

  const handleCreateAgent = (details) => {
    setRefreshAgent(!refreshAgent);
  };

  const handleRefreshAgentListAfterEdit = () => {
    setRefreshAgentList(!refreshAgentList);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f9fafb"
      }}
    >
      {/* Header Section */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "16px 32px",
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <DashboardIcon sx={{ color: "#1976d2", mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Agent of Agents
          </Typography>
        </Box>

        <Box>
          <StyledButton
            selected={selectedTab === "Build"}
            startIcon={<BuildIcon />}
            onClick={() => {
              setSelectedTab("Build")
              setExpanded(false);
            }}
            sx={{ mx: 1 }}
          >
            Build
          </StyledButton>
          <StyledButton
            selected={selectedTab === "Playground"}
            startIcon={<PlaygroundIcon />}
            onClick={() => {
              setSelectedTab("Playground");
              setExpanded("workflows");
            }}
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
            backgroundColor: "#ffffff",
            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
            p: 2,
            width: "300px"
          }}
        >
          {selectedTab === "Build" && (
            <>
              {/* Agents Accordion */}
              {buildingBlocks.agents.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "agents"}
                  onChange={handleChange("agents")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="agents-header"
                  >
                    <Box
                      sx={{
                        flexDirection: "row",
                        display: "flex",
                        flex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <Box sx={{ flexDirection: "row", display: "flex" }}>
                        <Group sx={{ mr: 1, color: "#1976d2" }} />
                        <Typography sx={{ fontWeight: "bold" }}>
                          Agents
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#198ED2FF",
                          width: 24,
                          height: 24,
                          borderRadius: 20,
                          justifyContent: "center",
                          marginLeft: 4,
                          alignContent: "center",
                          textAlign: "center",
                          color: "white"
                        }}
                      >
                        {buildingBlocks.agents?.length}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <AgentList
                      agents={buildingBlocks.agents}                      
                      onRefresh={handleRefreshAgentListAfterEdit}
                      models={buildingBlocks.models}
                    />
                  </AccordionDetails>
                </StyledAccordion>
              )}

              {/* Models Accordion */}
              {buildingBlocks.models.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "models"}
                  onChange={handleChange("models")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="models-header"
                  >
                    <Box
                      sx={{
                        flexDirection: "row",
                        display: "flex",
                        flex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <Box sx={{ flexDirection: "row", display: "flex" }}>
                        <Memory sx={{ mr: 1, color: "#1976d2" }} />
                        <Typography sx={{ fontWeight: "bold" }}>
                          Models
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#198ED2FF",
                          width: 24,
                          height: 24,
                          borderRadius: 20,
                          justifyContent: "center",
                          marginLeft: 4,
                          alignContent: "center",
                          textAlign: "center",
                          color: "white"
                        }}
                      >
                        {buildingBlocks.models?.length}
                      </Typography>
                    </Box>
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
                    <Box
                      sx={{
                        flexDirection: "row",
                        display: "flex",
                        flex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <Box sx={{ flexDirection: "row", display: "flex" }}>
                        <AccountTree sx={{ mr: 1, color: "#1976d2" }} />
                        <Typography sx={{ fontWeight: "bold" }}>
                          Workflows
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#198ED2FF",
                          width: 24,
                          height: 24,
                          borderRadius: 20,
                          justifyContent: "center",
                          marginLeft: 4,
                          alignContent: "center",
                          textAlign: "center",
                          color: "white"
                        }}
                      >
                        {buildingBlocks.workflows?.length}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <WorkFlowsList
                      workflows={buildingBlocks.workflows}
                      refresh={refreshAgent}
                    />
                  </AccordionDetails>
                </StyledAccordion>
              )}

              {buildingBlocks.skills.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "skills"}
                  onChange={handleChange("skills")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="skills-header"
                  >
                    <Box
                      sx={{
                        flexDirection: "row",
                        display: "flex",
                        flex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <Box sx={{ flexDirection: "row", display: "flex" }}>
                        <Psychology sx={{ mr: 1, color: "#1976d2" }} />
                        <Typography sx={{ fontWeight: "bold" }}>
                          Skills
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#198ED2FF",

                          width: 24,
                          height: 24,
                          borderRadius: 20,
                          justifyContent: "center",
                          marginLeft: 4,
                          alignContent: "center",
                          textAlign: "center",
                          color: "white"
                        }}
                      >
                        {buildingBlocks.skills?.length}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <SkillsList
                      skills={buildingBlocks.skills}
                      refresh={refreshAgent}
                    />
                  </AccordionDetails>
                </StyledAccordion>
              )}

              {buildingBlocks.knowledgehub.length > 0 && (
                <StyledAccordion
                  expanded={expanded === "knowledgehub"}
                  onChange={handleChange("knowledgehub")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id="knowledgehub-header"
                  >
                    <Box
                      sx={{
                        flexDirection: "row",
                        display: "flex",
                        flex: 1,
                        justifyContent: "space-between"
                      }}
                    >
                      <Box sx={{ flexDirection: "row", display: "flex" }}>
                        <School sx={{ mr: 1, color: "#1976d2" }} />
                        <Typography sx={{ fontWeight: "bold" }}>
                          KnowledgeHub
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#198ED2FF",
                          width: 24,
                          height: 24,
                          borderRadius: 20,
                          justifyContent: "center",
                          marginLeft: 4,
                          alignContent: "center",
                          textAlign: "center",
                          color: "white"
                        }}
                      >
                        {buildingBlocks.knowledgehub?.length}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <Divider sx={{ width: "100%" }} />
                  <AccordionDetails>
                    <KnowledgeHubList
                      knowledgeHub={buildingBlocks.knowledgehub}
                      refresh={refreshAgent}
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
                <WorkFlowsList workflows={buildingBlocks.workflows} />
              </AccordionDetails>
            </StyledAccordion>
          )}
        </Box>

        {/* Vertical Separator */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        />

        {/* Right Panel (ChatBox) */}
        <Box sx={{ flex: 1, backgroundColor: "#f9fafb" }}>
          {selectedTab === "Build" && (
            <ChatBox onCreateAgent={handleCreateAgent} uuid={uuid} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
