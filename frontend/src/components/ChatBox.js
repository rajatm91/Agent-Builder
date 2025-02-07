import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import MessageBubble from "./MessageBubble";
import AgentDetailsModal from "./AgentDetailsModal";
import { parseUserDetails } from "../utils/userDetails";

const ChatBox = ({ onCreateAgent }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [agentDetails, setAgentDetails] = useState(null);
  const [reviewDetails, setReviewDetails] = useState(null);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      setMessage("");

      const { name, role } = parseUserDetails(message);
      setAgentDetails({ name, role, skills: "", documentPath: "" });

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Please provide skills and document path for this agent.",
            isUser: false
          }
        ]);
        setModalOpen(true);
      }, 1000);
    }
  };

  const handleSubmitDetails = (details) => {
    setReviewDetails(details);
    setMessages((prev) => [
      ...prev,
      {
        text: "Review the details and confirm to create the agent.",
        isUser: false
      }
    ]);
  };

  const handleCreateAgent = () => {
    onCreateAgent(reviewDetails);
    setReviewDetails(null);
    setMessages((prev) => [
      ...prev,
      {
        text: `Agent "${reviewDetails.name}" created successfully!`,
        isUser: false
      }
    ]);
  };

  const handleCancel = () => {
    setReviewDetails(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg.text} isUser={msg.isUser} />
        ))}
        {reviewDetails && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mt: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)"
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review Details
            </Typography>
            <Typography>Name: {reviewDetails.name}</Typography>
            <Typography>Role: {reviewDetails.role}</Typography>
            <Typography>Skills: {reviewDetails.skills}</Typography>
            <Typography>Document Path: {reviewDetails.documentPath}</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button variant="contained" onClick={() => setModalOpen(true)}>
                Edit
              </Button>
              <Button variant="contained" onClick={handleCreateAgent}>
                Submit
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{ ml: 2 }}
        >
          Send
        </Button>
      </Box>
      <AgentDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDetails}
        initialDetails={agentDetails}
      />
    </Box>
  );
};

export default ChatBox;