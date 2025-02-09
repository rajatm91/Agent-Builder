import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box, Typography, IconButton } from "@mui/material";
import MessageBubble from "./MessageBubble";
import AgentDetailsModal from "./AgentDetailsModal";
import { Send, Mic, AttachFile } from "@mui/icons-material";
import ReviewDetails from "./ReviewDetails";

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

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

        const missingField = Object.keys(missDetails).find(
          (key) => missDetails[key]
        );

        if (missingField) {
          setMessages((prev) => [
            ...prev,
            { text: `Please provide ${missingField}.`, isUser: false }
          ]);
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
        maxWidth: "100vw",
        padding: 2,
        backgroundColor: "#f4f7fa"
      }}
    >
      {/* Chat Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          // width: "70%",
          // maxWidth: "70%",
          backgroundColor: "#ffffff",
          boxShadow: 3,
          borderRadius: 2,
          p: 2,
          height: "80vh",
          overflow: "hidden"
        }}
      >
        {/* Messages Scrollable Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            paddingRight: 1,
            maxHeight: "calc(100% - 80px)"
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
              <MessageBubble
                key={index}
                message={msg.text}
                isUser={msg.isUser}
              />
            ))
          )}
          <div ref={messagesEndRef} />
          {reviewDetails && (
            <ReviewDetails
              reviewDetails={reviewDetails}
              setModalOpen={setModalOpen}
              handleCreateAgent={handleCreateAgent}
              handleCancel={handleCancel}
            />
          )}
        </Box>

        {/* Chat Input Fixed at Bottom */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderTop: "1px solid #ddd",
            backgroundColor: "#ffffff"
          }}
        >
          <IconButton color="primary">
            <Mic />
          </IconButton>
          <IconButton color="primary">
            <AttachFile />
          </IconButton>
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
            // startIcon={<Chat />}
            startIcon={<Send />}
            sx={{ ml: 2 }}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Agent Details Modal */}
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
