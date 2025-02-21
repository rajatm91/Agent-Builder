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
  Group,
  Lightbulb,
  Person,
  BusinessCenter,
  InputSharp,
  Memory,
  ViewInAr,
  Task
} from "@mui/icons-material";
import ModelDropdown from "./ModelDropDown";

const AgentList = ({ agents, onRefresh, models }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editedAgent, setEditedAgent] = useState(null);
  const [openAdvanced, setOpenAdvanced] = useState(false);

  useEffect(() => {
    // console.log("Refreshing Agent list because refresh changed.");
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
        <List
          sx={{
            maxHeight: agents.length > 3 ? "40vh" : "auto",
            overflowY: agents.length > 3 ? "auto" : "visible"
          }}
        >
          {agents?.map((agent) => (
            <Box key={agent.id}>
              {/* Agent List Item */}
              <ListItem
                sx={{
                  position: "relative",
                  backgroundColor: "#F7F9FCFF",
                  padding: 2
                }}
              >
                {agent.classification === "advance" && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 0,
                      backgroundColor: "#1976d2",
                      color: "white",
                      padding: "2px 8px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      borderRadius: "4px",
                      transform: "rotate(340deg)"
                    }}
                  >
                    Advance
                  </Box>
                )}

                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Group color="action" />
                </ListItemIcon>
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
              </ListItem>

              {/* Divider */}
              <Divider />
            </Box>
          ))}
        </List>
      )}

      {agents?.length === 0 && <Typography>No Agents available</Typography>}

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
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Edit Agent
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: "20px" }}>
            <TextField
              label="Customize Agent Name"
              name="name"
              value={editedAgent?.config?.name || ""}
              onChange={(e) => {
                const { name, value } = e.target;
                setEditedAgent((prevState) => ({
                  ...prevState,
                  config: {
                    ...prevState.config,
                    [name]: value
                  }
                }));
              }}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <Person sx={{ color: "gray", marginRight: 1 }} />
                )
              }}
            />

            <TextField
              label="Customize Agent Type"
              name="type"
              value={editedAgent?.type || ""}
              onChange={(e) => {
                const { name, value } = e.target;
                setEditedAgent((prevState) => ({
                  ...prevState,
                  [name]: value
                }));
              }}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <BusinessCenter sx={{ color: "gray", marginRight: 1 }} />
                )
              }}
            />

            <TextField
              label="Customize Agent Knowledge hub"
              name="docs_path"
              value={editedAgent?.config?.retrieve_config?.docs_path || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <Lightbulb sx={{ color: "gray", marginRight: 1 }} />
                )
              }}
            />

            <TextField
              label="Customize Roles and Responsibility"
              name="customized_prompt"
              value={
                editedAgent?.config?.retrieve_config?.customized_prompt || ""
              }
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
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
                <ModelDropdown
                  editedAgent={editedAgent}
                  handleChange={handleChange}
                  models={models}
                />

                <TextField
                  label="Task"
                  name="task"
                  value={editedAgent?.config?.retrieve_config?.task || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <Task sx={{ color: "gray", marginRight: 1 }} />
                    )
                  }}
                />

                <TextField
                  label="Human Input Mode"
                  name="human_input_mode"
                  value={editedAgent?.config?.human_input_mode || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setEditedAgent((prevState) => ({
                      ...prevState,
                      config: {
                        ...prevState.config,
                        [name]: value
                      }
                    }));
                  }}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputSharp sx={{ color: "gray", marginRight: 1 }} />
                    )
                  }}
                />

                <TextField
                  label="Retriever Embedding Model"
                  name="embedding_model"
                  value={
                    editedAgent?.config?.retrieve_config?.embedding_model || ""
                  }
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <Memory sx={{ color: "gray", marginRight: 1 }} />
                    )
                  }}
                />

                <TextField
                  label="Retriever Chunk Token Size"
                  name="chunk_token_size"
                  value={
                    editedAgent?.config?.retrieve_config?.chunk_token_size || ""
                  }
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <ViewInAr sx={{ color: "gray", marginRight: 1 }} />
                    )
                  }}
                />
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
