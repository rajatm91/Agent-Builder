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
  ListItemIcon
} from "@mui/material";
import useAPIResponse from "../hooks/useGetAgentList";
import AgentChatBox from "./AgentChatBox";
import { Close, Work } from "@mui/icons-material";
import ImageDisplay from "./ImageDisplay";
import VerticalFlow from "../assets/images/VerticalFlow.png";

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
            overflowY: "auto"
          }}
        >
          {workflows?.map((workflow) => (
            <ListItem
              key={workflow?.id}
              button
              onClick={() => handleWorkFlowItem(workflow)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Work color="action" />
              </ListItemIcon>
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
            width: "72vw",
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
                  <strong>WorkFlow Type:</strong> {"Two Agents Chat"}
                </Typography>
              </Box>

              {/* Close Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Close />}
                  onClick={() => setOpenChatBox(false)}
                  sx={{ ml: 2 }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
          <Box
            sx={{
              height: "1px",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              width: "100%"
            }}
          />
          {/* Chat Box */}
          <Box display={"flex"} flexDirection={"row"}>
            <AgentChatBox agent={selectedWorkflow} />
            <ImageDisplay
              src={VerticalFlow}
              alt="Local Image"
              width="300px"
              height="300px"
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default WorkFlowsList;
