import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
  ListItemIcon
} from "@mui/material";
import apiService from "../api/apiService";
import {
  Edit,
  Assignment,
  HelpOutline,
  FileCopy,
  ExpandLess,
  ExpandMore,
  Cancel,
  Save,
  Group
} from "@mui/icons-material";

const AgentList = ({ agents, onRefresh }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editedAgent, setEditedAgent] = useState(null);
  const [openAdvanced, setOpenAdvanced] = useState(false);

  useEffect(() => {
    console.log("Refreshing Agent list because refresh changed.");
  }, [onRefresh]);

  const handleAgentClick = (agent) => {
    setSelectedAgent(selectedAgent?.id === agent.id ? null : agent);
  };

  const handleEditClick = (agent) => {
    setEditedAgent(agent);
    setOpenModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAgent((prevState) => ({
      ...prevState,
      config: {
        ...prevState.config,
        retrieve_config: {
          ...prevState.config.retrieve_config,
          [name]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await apiService.post("agents", editedAgent);
      alert(response?.message || "Agent updated successfully");
      setOpenModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update agent");
    }
  };

  // Mapping agent.type to dialog title
  const getDialogTitle = (type) => {
    switch (type) {
      case "retrieverproxy":
        return "Rag Agent";
      case "userproxy":
        return "User Proxy";
      case "assistant":
        return "Virtual Assistant";
      default:
        return "Agent";
    }
  };

  return (
    <Box>
  
      {agents?.length > 0 && (
        <List>
          {agents?.map((agent) => (
            <Box key={agent.id}>
              {/* Agent List Item */}
              <ListItem
                button
                onClick={() => handleAgentClick(agent)}
                sx={{
                  "&:hover": { backgroundColor: "#f0f0f0" }
                }}
              >
                {/* Icon */}
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Group color="action" />
                </ListItemIcon>

                {/* Text Content */}
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        display: "block"
                      }}
                    >
                      {agent.config?.name}
                    </Typography>
                  }
                  secondary={agent.user_id}
                />

                {/* Edit Button */}
                <Box
                  sx={{
                    minWidth: 50,
                    display: "flex",
                    justifyContent: "flex-end"
                  }}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(agent);
                    }}
                    color="primary"
                    sx={{ marginLeft: "8px" }}
                  >
                    <Edit />
                  </IconButton>
                </Box>
              </ListItem>

              {/* Divider */}
              <Divider />
            </Box>
          ))}
        </List>
      )}

      {agents?.length === 0 && (
        <Typography>No Agents available</Typography>
      )}

      {/* Edit Agent Modal */}
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
            alignItems:'center',            
            justifyContent:'center',
          }}
        >
          Edit Agent
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: "20px" }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", marginBottom: "10px" }}
            >
              Agent Name:{" "}
              <span style={{ fontWeight: "normal" }}>
                {editedAgent?.config?.name || "N/A"}
              </span>
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", marginBottom: "10px" }}
            >
              Agent Type:{" "}
              <span style={{ fontWeight: "normal" }}>
                {getDialogTitle(editedAgent?.type)}
              </span>
            </Typography>

            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", marginBottom: "20px" }}
            >
              Knowledge Hub:{" "}
              <span style={{ fontWeight: "normal" }}>
                {editedAgent?.config?.retrieve_config?.docs_path || "N/A"}
              </span>
            </Typography>

            <TextField
              label="Customize Roles and Responsibility"
              name="customize_prompt"
              value={
                editedAgent?.config?.retrieve_config?.customize_prompt || ""
              }
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <Assignment sx={{ color: "gray", marginRight: 1 }} />
                )
              }}
            />

            <TextField
              label="Customize Answer Prefix"
              name="customize_answer_prefix"
              value={
                editedAgent?.config?.retrieve_config?.customize_answer_prefix ||
                ""
              }
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <HelpOutline sx={{ color: "gray", marginRight: 1 }} />
                )
              }}
            />

            {/* Advanced Options */}
            <Box sx={{ marginTop: "20px" }}>
              <Button
                onClick={() => setOpenAdvanced(!openAdvanced)}
                variant="outlined"
                sx={{ width: "100%", marginBottom: "10px" }}
                startIcon={openAdvanced ? <ExpandLess /> : <ExpandMore />}
              >
                {openAdvanced ? "Hide Advanced Topics" : "Show Advanced Topics"}
              </Button>
              <Collapse in={openAdvanced}>
                <TextField
                  label="Roles and Responsibility"
                  name="system_message"
                  value={editedAgent?.config?.system_message || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={3}
                  InputProps={{
                    startAdornment: (
                      <Assignment sx={{ color: "gray", marginRight: 1 }} />
                    )
                  }}
                />
                <TextField
                  label="Model"
                  name="model"
                  value={editedAgent?.config?.retrieve_config?.model || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <FileCopy sx={{ color: "gray", marginRight: 1 }} />
                    )
                  }}
                />

                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Retriever Task:{" "}
                  <span style={{ fontWeight: "normal" }}>
                    {editedAgent?.config?.retrieve_config?.task || "N/A"}
                  </span>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Human Input Mode:{" "}
                  <span style={{ fontWeight: "normal" }}>
                    {editedAgent?.config?.human_input_mode || "N/A"}
                  </span>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Retriever Embedding Model:{" "}
                  <span style={{ fontWeight: "normal" }}>
                    {editedAgent?.config?.retrieve_config?.embedding_model ||
                      "N/A"}
                  </span>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", marginBottom: "20px" }}
                >
                  Retriever Chunk Token Size:{" "}
                  <span style={{ fontWeight: "normal" }}>
                    {editedAgent?.config?.retrieve_config?.chunk_token_size ||
                      "N/A"}
                  </span>
                </Typography>
              </Collapse>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
          <Button
            startIcon={<Cancel />}
            onClick={() => setOpenModal(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSubmit}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentList;
