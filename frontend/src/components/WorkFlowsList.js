import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Paper,
  Box,
  ListItemIcon,
  Divider
} from "@mui/material";
import AgentChatBox from "./AgentChatBox";
import { AccountTree, Close } from "@mui/icons-material";
import ImageDisplay from "./ImageDisplay";
import VerticalFlow from "../assets/images/VerticalFlow.png";

const WorkFlowsList = ({ workflows, onWorkFlowSelected }) => {
  // const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  // const [openChatBox, setOpenChatBox] = useState(false);

  const handleWorkFlowItem = (workflow) => {
    // setSelectedWorkflow(workflow);
    console.log('OPEN CHATBOX CALLED', workflow)
    onWorkFlowSelected(workflow)
    
    // setOpenChatBox(true);
  };

  return (
    <Box>
      {/* Workflows List */}
      {workflows?.length > 0 && (
        <List
          sx={{
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          {workflows?.map((workflow) => (
            <Box key={workflow.id}>
              <ListItem
                button
                onClick={() => handleWorkFlowItem(workflow)}
                sx={{
                  "&:hover": { backgroundColor: "#e3f2fd" },
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.2s ease-in-out"
                }}
              >
                <ListItemIcon sx={{ minWidth: 45 }}>
                  <AccountTree sx={{ color: "#1565c0", fontSize: "30px" }} />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#0d47a1" }}
                    >
                      {workflow?.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: "#546e7a" }}>
                      {workflow?.user_id}
                    </Typography>
                  }
                />
              </ListItem>

              <Divider />
            </Box>
          ))}
        </List>
      )}

      {/* No Workflows */}
      {workflows?.length === 0 && (
        <Typography align="center" color="textSecondary">
          No workflows available
        </Typography>
      )}      
    </Box>
  );
};

export default WorkFlowsList;
