import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from "@mui/material";
import {
  Check,
  IntegrationInstructions,  
  Psychology
} from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SkillsList = ({ skills, refresh }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedSKill, setSelectedSkill] = useState(null);
  const handleSkillItem = (item) => {
    if (item?.content) {
      setSelectedSkill(item?.content);
      setOpenModal(true);
    }
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
            maxHeight: skills.length > 3 ? "40vh" : "auto",
            overflowY: skills.length > 3 ? "auto" : "visible"
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
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkillItem(skill);
                    // handleWorkFlowItem(workflow)
                  }}
                  color="primary"
                  sx={{ marginLeft: "8px" }}
                >
                  <IntegrationInstructions color="action" />
                </IconButton>
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

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Skills
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: "20px" }}>
            {selectedSKill && (
              <SyntaxHighlighter language="python" style={darcula}>
                {selectedSKill}
              </SyntaxHighlighter>
            )}            
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
          <Button
            startIcon={<Check />}
            onClick={() => setOpenModal(false)}
            color="primary"
            variant="contained"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsList;
