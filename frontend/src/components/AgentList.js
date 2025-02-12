import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse
} from "@mui/material";
import useAPIResponse from "../hooks/useGetAgentList";
import apiService from "../api/apiService";

const AgentList = ({ onRefresh }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editedAgent, setEditedAgent] = useState(null);
  const [openAdvanced, setOpenAdvanced] = useState(false); // State for collapsible section

  const {
    response: agentsNew,
    loading,
    error
  } = useAPIResponse("agents", {
    user_id: "guestuser@gmail.com",
    refreshKey: onRefresh
  });

  useEffect(() => {
    console.log("Refreshing Agent list because refresh changed.");
  }, [onRefresh]);

  const handleAgentClick = (agent) => {
    setSelectedAgent(
      selectedAgent?.id === agent.id ? null : agent // Toggle accordion open/close
    );
  };

  const handleEditClick = (agent) => {
    setEditedAgent(agent);
    // setEditedAgent(mockAgent);
    setOpenModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "system_message") {
      setEditedAgent((prevState) => ({
        ...prevState,
        config: {
          ...prevState.config,
          [name]: value
        }
      }));
    } else if (
      name === "customize_prompt" ||
      name === "customize_answer_prefix" ||
      name === "model"
    ) {
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
    }
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
        return "Edit Rag Agent";
      case "userproxy":
        return "Edit User Proxy";
      case "assistant":
        return "Edit Virtual Assistant";
      default:
        return "Edit Agent";
    }
  };

  return (
    <div>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && agentsNew?.length > 0 && (
        <List>
          {agentsNew?.map((agent) => (
            <div key={agent?.id}>
              <ListItem button onClick={() => handleAgentClick(agent)}>
                <ListItemText
                  primary={agent.config?.name || "No Name"}
                  secondary={agent.user_id || "No Type"}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditClick(agent)}
                  style={{ marginTop: 10 }}
                >
                  Edit
                </Button>
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      )}

      {!loading && !error && agentsNew?.length === 0 && (
        <Typography>No Agents available</Typography>
      )}

      {/* Edit Agent Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{getDialogTitle(editedAgent?.type)}</DialogTitle>
        <DialogContent>
          <Box sx={{ padding: "20px", maxWidth: "80%" }}>
            <Typography variant="body1" marginBottom="20px">
              <strong>Agent Name:</strong> {editedAgent?.config?.name || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Human Input Mode:</strong>
              {editedAgent?.config?.human_input_mode || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Knowledge Hub:</strong>
              {editedAgent?.config?.retrieve_config?.docs_path || "N/A"}
            </Typography>

            {/* Editable Fields */}
            <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
              Roles and Responsibility
            </Typography>
            <TextField
              label="Roles and Responsibility"
              name="system_message" // Make it Bold
              value={editedAgent?.config?.system_message || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              maxRows={6}
            />

            <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
              Customize Prompt
            </Typography>
            <TextField
              label="Customize Prompt"
              name="customize_prompt"
              value={
                editedAgent?.config?.retrieve_config?.customize_prompt || ""
              }
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
              Customize Answer Prefix
            </Typography>
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
            />

            {/* Customizable Fields */}
            <Box sx={{ marginTop: "20px" }}>
              <Button
                onClick={() => setOpenAdvanced(!openAdvanced)}
                variant="outlined"
                style={{ marginBottom: 10 }}
              >
                {openAdvanced ? "Hide Advanced Topics" : "Show Advanced Topics"}
              </Button>
              <Collapse in={openAdvanced}>
                <Typography variant="body1" marginBottom="20px">
                  <strong>Retriever Embedding Model:</strong>
                  {editedAgent?.config?.retrieve_config?.embedding_model ||
                    "N/A"}
                </Typography>
                <Typography variant="body1" marginBottom="20px">
                  <strong>Retriever Chunk Token Size:</strong>
                  {editedAgent?.config?.retrieve_config?.chunk_token_size ||
                    "N/A"}
                </Typography>

                <TextField
                  label="Model"
                  name="model"
                  value={editedAgent?.config?.retrieve_config?.model || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <Typography variant="body1" marginBottom="20px">
                  <strong>Retriever Task:</strong>
                  {editedAgent?.config?.retrieve_config?.task || "N/A"}
                </Typography>
              </Collapse>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AgentList;
