import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,  
  Box,
  ListItemIcon,
  Divider
} from "@mui/material";
import { AccountTree, Close, Psychology } from "@mui/icons-material";

const SkillsList = ({ skills, refresh }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);

  const handleSkillItem = (workflow) => {
    setSelectedWorkflow(workflow);
    setOpenChatBox(true);
  };

  return (
    <Box>
      {/* Workflows List */}
      {skills?.length > 0 && (
        <List
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: "auto",
            maxHeight: "80vh",
            overflowY: "auto"
          }}
        >
          {skills?.map((skill) => (
            <Box>
              <ListItem
                key={skill?.id}
                button
                onClick={() => handleSkillItem(skill)}
                sx={{
                  transition: "0.3s",
                  backgroundColor: "#F7F9FCFF",
                  "&:hover": { backgroundColor: "#f5f5f5" }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Psychology color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: "bold" }}>
                      {skill?.name}
                    </Typography>
                  }
                  secondary={skill?.description}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}

      {/* No Workflows */}
      {skills?.length === 0 && (
        <Typography align="center" color="textSecondary">
          No Skills available
        </Typography>
      )}

    </Box>
  );
};

export default SkillsList;
