import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Box,
} from "@mui/material";
import useAPIResponse from "../hooks/useGetAgentList";
import AgentChatBox from "./AgentChatBox";

const WorkFlowsList = ({ refresh }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);

  useEffect(() => {
    console.log("Refreshing workflows list because refresh changed.");
  }, [refresh]);

  const {
    response: workflows,
    loading,
    error
  } = useAPIResponse("workflows", {
    user_id: "guestuser@gmail.com",
    refreshKey: refresh
  });

  const handleWorkFlowItem = (workflow) => {
    setSelectedWorkflow(workflow);
    setOpenChatBox(true);
  };

  return (
    <Box>
      {/* Loading Indicator */}
      {loading && (
        <CircularProgress sx={{ display: "block", margin: "auto" }} />
      )}

      {/* Error Handling */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Workflows List */}
      {!loading && !error && workflows?.length > 0 && (
        <List
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: "auto",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {workflows?.map((workflow) => (
            <ListItem
              key={workflow?.id}
              button
              onClick={() => handleWorkFlowItem(workflow)}
              sx={{
                borderRadius: 2,
                mb: 1,
                boxShadow: 1,
                backgroundColor: "#fff",
                transition: "0.3s",
                "&:hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: "bold" }}>
                    {workflow?.name}
                  </Typography>
                }
                secondary={workflow?.user_id}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* No Workflows */}
      {!loading && !error && workflows?.length === 0 && (
        <Typography align="center" color="textSecondary">
          No workflows available
        </Typography>
      )}

      {/* Chatbox Popup */}
      {openChatBox && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "75vw",
            height: "100vh",
            backgroundColor: "#ffffff",
            boxShadow: "-4px 0px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            overflowY: "auto",
            p: 3
          }}
        >
          {/* Workflow Details */}
          {selectedWorkflow && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2
              }}
            >
              <Box>               
                <Typography variant="body1">
                  <strong>WorkFlow Type:</strong>{" "}
                  {"Two Agents Chat"}
                </Typography>                
              </Box>

              {/* Close Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenChatBox(false)}
                  sx={{ ml: 2 }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}

          {/* Chat Box */}
          <AgentChatBox agent={selectedWorkflow} />
        </Paper>
      )}
    </Box>
  );
};

export default WorkFlowsList;
