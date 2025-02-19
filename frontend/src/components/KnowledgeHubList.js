import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  ListItemIcon,
  Divider
} from "@mui/material";
import { Description, Folder, Language, School } from "@mui/icons-material";

const KnowledgeHubList = ({ knowledgeHub, refresh }) => {
  const handleKnowledgeHubItem = (workflow) => {
    // setSelectedWorkflow(workflow);
  };

  return (
    <Box>
      {/* Workflows List */}
      {knowledgeHub?.length > 0 && (
        <List
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: "auto",
            maxHeight: "80vh",
            overflowY: "auto"
          }}
        >
          {knowledgeHub?.map((knowledge) => (
            <Box>
              <ListItem
                key={knowledge?.id}
                button
                onClick={() => handleKnowledgeHubItem(knowledge)}
                sx={{
                  transition: "0.3s",
                  backgroundColor: "#F7F9FCFF",
                  "&:hover": { backgroundColor: "#f5f5f5" }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {knowledge?.type === "website" ? (
                    <Language color="action" />
                  ) : knowledge?.type === "file" ? (
                    <Description color="action" />
                  ) : (
                    <Folder color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: "bold" }}>
                      {knowledge?.name}
                    </Typography>
                  }
                  secondary={knowledge?.type}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}

      {/* No Workflows */}
      {knowledgeHub?.length === 0 && (
        <Typography align="center" color="textSecondary">
          No Knowledge Hub available
        </Typography>
      )}
    </Box>
  );
};

export default KnowledgeHubList;
