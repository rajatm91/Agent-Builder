import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  Divider,
  Button,
  Paper,
  Box
} from "@mui/material";
import useAPIResponse from "../hooks/useGetAgentList";
import AgentChatBox from "./AgentChatBox";

const WorkFlowsList = ({ refresh }) => {
  const [selectWorkFlows, setSelectedWorkFlows] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);

  // This effect will run whenever refreshAgent changes
  useEffect(() => {
    console.log("Refreshing workflows list because refresh changed.");
  }, [refresh]);

  // Fetch workflows using custom hook
  const {
    response: workflows,
    loading,
    error
  } = useAPIResponse("workflows", {
    user_id: "guestuser@gmail.com",
    refreshKey: refresh
  });

  const handleWorkFlowItem = (workflow) => {
    setSelectedWorkFlows(
      selectWorkFlows?.id === workflow.id ? null : workflow // Toggle accordion open/close
    );
    setOpenChatBox(true);
  };

  return (
    <div>
      {/* Show loading indicator */}
      {loading && <CircularProgress />}

      {/* Show error message if API fails */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Render workflows list */}
      {!loading && !error && workflows?.length > 0 && (
        <List>
          {workflows.map((workflow) => (
            <div  style={{marginLeft:20}} key={workflow?.id}>
              <ListItem button onClick={() => handleWorkFlowItem(workflow)}>               
                <ListItemText primary={workflow?.name} secondary={workflow?.user_id}/>
              </ListItem>
            </div>
          ))}
        </List>
      )}

      {/* If there are no workflows */}
      {!loading && !error && workflows?.length === 0 && (
        <Typography>No workflows available</Typography>
      )}

      {openChatBox && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "80vw",
            height: "100vh",
            backgroundColor: "white",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
            transform: openChatBox ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.5s ease-in-out",
            zIndex: 1000,
            overflowY: "auto"
          }}
        >
          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              paddingBottom: "20px",
              position: "relative"
            }}
          >
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
              <Typography
                variant="h8"
                align="center"
                sx={{ flexGrow: 1, color: "#1976d2" }}
              >
                Agent ChatBox for {selectWorkFlows.name}
              </Typography>

              <Box sx={{ mr: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenChatBox(false)}
                  sx={{ ml: 2 }}
                >
                  Close
                </Button>
              </Box>
            </Paper>

            {/* WorkFlow Details */}
            {selectWorkFlows ? (
              <>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  color="textSecondary"
                >
                  <strong>WorkFlow ID:</strong> {selectWorkFlows.id || "N/A"}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  color="textSecondary"
                >
                  <strong>WorkFlow Type:</strong>{" "}
                  {selectWorkFlows.type || "N/A"}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  color="textSecondary"
                >
                  <strong>WorkFlow Create at:</strong>{" "}
                  {new Date(selectWorkFlows.created_at).toLocaleString()}
                </Typography>
              </>
            ) : (
              <Typography variant="body1">No WorkFlow selected.</Typography>
            )}
            {/* Workflow Chat Box Component */}
            <AgentChatBox agent={selectWorkFlows} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkFlowsList;
