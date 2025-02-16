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
    <Box sx={{ maxWidth: "900px", margin: "auto" }}>
      {agents?.length > 0 ? (
        <List
          sx={{
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {agents?.map((agent) => (
            <Box key={agent.id}>
              <ListItem
                button
                onClick={() => handleAgentClick(agent)}
                sx={{
                  "&:hover": { backgroundColor: "#e3f2fd" },
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.2s ease-in-out"
                }}
              >
                <ListItemIcon sx={{ minWidth: 45 }}>
                  <Group sx={{ color: "#1565c0", fontSize: "30px" }} />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#0d47a1" }}
                    >
                      {agent.config?.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: "#546e7a" }}>
                      {agent.user_id}
                    </Typography>
                  }
                />

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(agent);
                  }}
                  sx={{
                    color: "#1976d2",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.15)" }
                  }}
                >
                  <Edit />
                </IconButton>
              </ListItem>

              <Divider />
            </Box>
          ))}
        </List>
      ) : (
        <Typography
          variant="body1"
          sx={{ textAlign: "center", color: "#b0bec5", mt: 3 }}
        >
          No Agents Available
        </Typography>
      )}

      {/* Edit Agent Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            backgroundColor: "#e3f2fd",
            textAlign: "center",
            padding: "16px",
            color: "#0d47a1"
          }}
        >
          Edit {getDialogTitle(editedAgent?.type)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: "20px" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
              Agent Name:{" "}
              <span style={{ fontWeight: "normal", color: "#1565c0" }}>
                {editedAgent?.config?.name || "N/A"}
              </span>
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
              Agent Type:{" "}
              <span style={{ fontWeight: "normal", color: "#1565c0" }}>
                {editedAgent?.type || "N/A"}
              </span>
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
            Knowledge Hub:{" "}
              <span style={{ fontWeight: "normal", color: "#1565c0" }}>
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
                startAdornment: <Assignment sx={{ color: "#1565c0", mr: 1 }} />
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
                startAdornment: <HelpOutline sx={{ color: "#1565c0", mr: 1 }} />
              }}
            />

            {/* Advanced Options */}
            <Box sx={{ mt: 3 }}>
              <Button
                onClick={() => setOpenAdvanced(!openAdvanced)}
                variant="outlined"
                sx={{
                  width: "100%",
                  mb: 1,
                  borderColor: "#1565c0",
                  color: "#1565c0"
                }}
                startIcon={openAdvanced ? <ExpandLess /> : <ExpandMore />}
              >
                {openAdvanced
                  ? "Hide Advanced Options"
                  : "Show Advanced Options"}
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
                      <Assignment sx={{ color: "#1565c0", mr: 1 }} />
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
                      <FileCopy sx={{ color: "#1565c0", mr: 1 }} />
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
        <DialogActions sx={{ padding: "16px", backgroundColor: "#e3f2fd" }}>
          <Button
            startIcon={<Cancel />}
            onClick={() => setOpenModal(false)}
            sx={{ color: "#d32f2f", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSubmit}
            variant="contained"
            sx={{
              fontWeight: "bold",
              backgroundColor: "#1565c0",
              "&:hover": { backgroundColor: "#0d47a1" }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentList;
