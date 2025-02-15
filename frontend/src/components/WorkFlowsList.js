import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Paper,
  Box,
  ListItemIcon
} from "@mui/material";
import AgentChatBox from "./AgentChatBox";
import { AccountTree, Close } from "@mui/icons-material";
import ImageDisplay from "./ImageDisplay";
import VerticalFlow from "../assets/images/VerticalFlow.png";

const WorkFlowsList = ({ workflows, refresh }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);

  const handleWorkFlowItem = (workflow) => {
    setSelectedWorkflow(workflow);
    setOpenChatBox(true);
  };

  return (
    <Box>
      {/* Workflows List */}
      {workflows?.length > 0 && (
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
                <AccountTree color="action" />
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
      {workflows?.length === 0 && (
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
