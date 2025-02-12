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
  Collapse,
  Paper
} from "@mui/material";
import useAPIResponse from "../hooks/useGetAgentList";
import apiService from "../api/apiService";

const AgentList = ({ onRefresh }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editedAgent, setEditedAgent] = useState(null);
  const [openAdvanced, setOpenAdvanced] = useState(false);

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
    <Box sx={{ padding: "4px", maxWidth: "800px", margin: "auto" }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && agentsNew?.length > 0 && (
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}
            color="primary"
          >
            Available Agents
          </Typography>
          <List>
            {agentsNew?.map((agent) => (
              <Box key={agent.id}>
                {/* Agent List Item */}
                <ListItem
                  button
                  onClick={() => handleAgentClick(agent)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    "&:hover": { backgroundColor: "#f0f0f0" }
                  }}
                >
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(agent)}
                  >
                    Edit
                  </Button>
                </ListItem>

                {/* Divider */}
                <Divider />
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* {!loading && !error && agentsNew?.length > 0 && (
        <List
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            padding: "10px"
          }}
        >
          {agentsNew?.map((agent) => (
            <div key={agent?.id}>
              <ListItem
                button
                onClick={() => handleAgentClick(agent)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  "&:hover": { backgroundColor: "#f0f0f0" }
                }}
              >                

                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {agent.config?.name }
                    </Typography>
                  }
                  secondary={agent.user_id}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditClick(agent)}
                >
                  Edit
                </Button>
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      )} */}

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
        <DialogTitle
          sx={{
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            padding: "16px"
          }}
        >
          {getDialogTitle(editedAgent?.type)}
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
              Human Input Mode:{" "}
              <span style={{ fontWeight: "normal" }}>
                {editedAgent?.config?.human_input_mode || "N/A"}
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
              label="Roles and Responsibility"
              name="system_message"
              value={editedAgent?.config?.system_message || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
            />

            <TextField
              label="Customize Roles and Responsibility"
              name="customize_prompt"
              value={
                editedAgent?.config?.retrieve_config?.customize_prompt || ""
              }
              onChange={handleChange}
              fullWidth
              margin="normal"
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
            />

            {/* Advanced Options */}
            <Box sx={{ marginTop: "20px" }}>
              <Button
                onClick={() => setOpenAdvanced(!openAdvanced)}
                variant="outlined"
                sx={{ width: "100%", marginBottom: "10px" }}
              >
                {openAdvanced ? "Hide Advanced Topics" : "Show Advanced Topics"}
              </Button>
              <Collapse in={openAdvanced}>
                <TextField
                  label="Model"
                  name="model"
                  value={editedAgent?.config?.retrieve_config?.model || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
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
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentList;
