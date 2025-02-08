import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import MessageBubble from "./MessageBubble";
import AgentDetailsModal from "./AgentDetailsModal";

const ChatBox = ({ onCreateAgent }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [agentDetails, setAgentDetails] = useState({
    name: "",
    role: "",
    skills: "",
    documentPath: ""
  });
  const [reviewDetails, setReviewDetails] = useState(null);

  const handleSend = async () => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, isUser: true }
      ]);
      setMessage("");
      let objectAgent = {};

      try {
        const response = await fetch("http://127.0.0.1:5000/extract-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });
        const data = await response.json();

        setAgentDetails((prevDetails) => {
          objectAgent = {
            ...prevDetails,
            name: data.agent.name ?? prevDetails.name,
            role: data.agent.role ?? prevDetails.role,
            skills: data.agent.skills ?? prevDetails.skills,
            documentPath: data.agent.documentPath ?? prevDetails.documentPath,
            department: data.agent.department ?? prevDetails.department
          };
          return objectAgent;
        });

        const missDetails = {
          name: !objectAgent.name,
          role: !objectAgent.role,
          skills: !objectAgent.skills,
          documentPath: !objectAgent.documentPath,
          department: !objectAgent.department
        };

        // setMissingDetails(missDetails);

        const missingField = Object.keys(missDetails).find(
          (key) => missDetails[key]
        );

        if (missingField) {
          let message = `Please provide ${missingField}.`;
          setMessages((prev) => [...prev, { text: message, isUser: false }]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: `All details are complete! Review the agent information and confirm.`,
              isUser: false
            }
          ]);
          setReviewDetails(objectAgent);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      }
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
    if (reviewDetails) {
      onCreateAgent(reviewDetails);
      setMessages((prev) => [
        ...prev,
        {
          text: `Agent "${reviewDetails.name}" created successfully!`,
          isUser: false
        }
      ]);
      setReviewDetails(null);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (reviewDetails) {
      console.log("Review details updated:", reviewDetails);
    }
  }, [reviewDetails]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
        maxWidth: "100vw"
      }}
    >
      {/* Chat box */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "70%", // Chat occupies 70% of screen width
          maxWidth: "70%",
          overflowY: "auto",
          backgroundColor: "#f4f7fa",
          boxShadow: 3,
          borderRadius: 2,
          p: 2
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%"
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Start chatting by typing a message...
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg.text} isUser={msg.isUser} />
          ))
        )}

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
        {/* Chat Input at the bottom */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2        
          }}
        >
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
            // startIcon={<Chat />}
          >
            Send
          </Button>
        </Box>
      </Box>

      <AgentDetailsModal
        open={modalOpen}
        onClose={handleCancel}
        onSubmit={handleSubmitDetails}
        initialDetails={agentDetails}
      />
    </Box>
  );
};

export default ChatBox;