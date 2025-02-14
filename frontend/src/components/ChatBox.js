import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from "@mui/material";
import MessageBubble from "./MessageBubble";
import PoweredBy from "./PoweredBy";
import { Send } from "@mui/icons-material";

const ChatBox = ({ onCreateAgent }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Track bot response status
  const [typingMessage, setTypingMessage] = useState(""); // State to hold the typing message

  const messagesEndRef = useRef(null);

  // **Auto-scroll when new message arrives**
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      const typingMessages = "Please wait, Agent is working on your request...";
      setTypingMessage(typingMessages);
    } else {
      setTypingMessage(""); // Clear typing message when done
    }
  }, [loading]);

  // **Create Agent API Call**
  const createAgent = async (message) => {
    setLoading(true); // Show loading state while creating the agent
    try {
      const response = await fetch("http://localhost:8081/api/create_agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: message
        })
      });

      const data = await response.json();
      if (data?.availability === "Available") {
        const agentDetails = {
          name: data?.name,
          documentPath: data?.documentPath,
          collection_name: data?.collection_name,
          model: data?.model,
          embedding_model: data?.embedding_model,
          reason: "Agent successfully created"
        };
        onCreateAgent(agentDetails);
        setMessages((prev) => [
          ...prev,
          {
            text: `Agent creation Successfully with name ${data?.name}.`,
            isUser: false
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "Agent creation failed. Please try again.", isUser: false }
        ]);
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error occurred while creating agent.", isUser: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // **Send Message (Trigger Create Agent API)**
  const handleSend = () => {
    if (message.trim()) {
      setMessages((prev) => [...prev, { text: message, isUser: true }]);
      createAgent(message);
      setMessage("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      {/* Chat Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1 // Allow the chat box to grow
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
        </Box>

        {/* Show "Bot is typing..." message */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
            <CircularProgress size={16} sx={{ marginRight: 1 }} />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontWeight: 500 }}
            >
              {typingMessage}
            </Typography>
          </Box>
        )}

        {/* Chat Input */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderTop: "1px solid #ddd",
            backgroundColor: "#ffffff",
            boxShadow: "inset 0 -1px 0 rgba(0, 0, 0, 0.1)", // Added subtle shadow
            flexShrink: 0
          }}
        >
          <IconButton color="primary">{/* <Mic /> */}</IconButton>
          <IconButton color="primary">{/* <AttachFile /> */}</IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            sx={{
              borderRadius: 2, // Rounded corners for the input box
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ddd" // Subtle border for input
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2" // Highlight border color on focus
                }
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={handleSend}
            sx={{
              ml: 2,
              textTransform: "none", // Prevent text capitalization in button
              padding: "8px 16px"
            }}
          >
            Send
          </Button>
        </Box>
        <PoweredBy />
      </Box>
    </Box>
  );
};

export default ChatBox;
