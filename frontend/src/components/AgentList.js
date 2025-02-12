import React, { useState } from "react";
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
  DialogActions
} from "@mui/material";
import useAPIResponse from "../hooks/useGetAgentList";
// import axios from "axios";
// import { mockAgent } from "./mockAgent";

const AgentList = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editedAgent, setEditedAgent] = useState(null);

  const {
    response: agentsNew,
    loading,
    error
  } = useAPIResponse("agents", { user_id: "guestuser@gmail.com" });

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
    setEditedAgent({
      ...editedAgent,
      config: {
        ...editedAgent.config,
        [name]: value
      }
    });
  };

  const handleSubmit = async () => {
    // try {
    //   await axios.put(`/api/agents/${editedAgent.id}`, editedAgent); // Adjust API endpoint as necessary
    //   setOpenModal(false);
    //   alert("Agent updated successfully");
    // } catch (err) {
    //   console.error(err);
    //   alert("Failed to update agent");
    // }
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Edit Agent</DialogTitle>
        <DialogContent>
          <Box sx={{ padding: "20px", maxWidth: "500px" }}>
            <Typography variant="body1" marginBottom="20px">
              <strong>Agent Name:</strong> {editedAgent?.config?.name || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Human Input Mode:</strong>
              {editedAgent?.config?.human_input_mode || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Retriever Task:</strong>
              {editedAgent?.config?.retrieve_config?.task || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong> RetrieverDocument Path:</strong>
              {editedAgent?.config?.retrieve_config?.docs_path || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong> Retriever Vector DB:</strong>
              {editedAgent?.config?.retrieve_config?.vector_db || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Retriever Connection Name:</strong>
              {editedAgent?.config?.retrieve_config?.collection_name || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong> Retriever Connection DB Name:</strong>
              {editedAgent?.config?.retrieve_config?.db_config
                ?.connection_string || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Retriever Embedding Model:</strong>
              {editedAgent?.config?.retrieve_config?.embedding_model || "N/A"}
            </Typography>
            <Typography variant="body1" marginBottom="20px">
              <strong>Retriever Chunk Token Size:</strong>
              {editedAgent?.config?.retrieve_config?.chunk_token_size || "N/A"}
            </Typography>
            {/* System message (allowed to change) */}
            <TextField
              label="System Message"
              name="system_message"
              value={editedAgent?.config?.system_message || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              maxRows={6}
            />
            {/* Model (allowed to change) */}
            <TextField
              label="Model"
              name="model"
              value={editedAgent?.config?.retrieve_config?.model || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            {/* Customize Prompt (allowed to change) */}
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
            {/* Customize Answer Prefix (allowed to change) */}
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
