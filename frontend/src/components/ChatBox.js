import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
  keyframes
} from "@mui/material";
import MessageBubble from "./MessageBubble";
import PoweredBy from "./PoweredBy";
import { Send } from "@mui/icons-material";

// Define a pulsating animation for "Bot is typing..."
const pulsate = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const ChatBox = ({ onCreateAgent }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setTypingMessage(
      loading ? "Please wait, Agent is working on your request..." : ""
    );
  }, [loading]);

  // Create Agent API Call
  const createAgent = async (message) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8081/api/create_agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
      });

      const data = await response.json();
      const successMessage = `Agent created successfully with name ${data?.name}.`;
      const errorMessage = "Agent creation failed. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          text:
            data?.availability === "Available" ? successMessage : errorMessage,
          isUser: false
        }
      ]);
      if (data?.availability === "Available") onCreateAgent(data);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error occurred while creating agent.", isUser: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send Message
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
        height: "100%",
        borderRadius: 2,
        overflow: "hidden",
        // background: "linear-gradient(180deg, #f5f7fa, #ffffff)" // Soft gradient
      }}
    >
      {/* Chat Messages Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          mt: 1,          
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          maxHeight: "calc(100vh - 220px)",
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
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{
                animation: `${pulsate} 1.5s infinite`,
                fontWeight: 500,
                color: "#1565c0"
              }}
            >
              Start chatting...
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg.text} isUser={msg.isUser} />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Typing Indicator */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: 1,
            paddingLeft: 2
          }}
        >
          <CircularProgress
            size={16}
            sx={{ marginRight: 1, color: "#1565c0" }}
          />
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
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid #ddd",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 12px 12px"
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ddd" },
              "&:hover fieldset": { borderColor: "#1976d2" }
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
            textTransform: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "none",
            background: "linear-gradient(45deg, #1e88e5, #1976d2)",
            "&:hover": {
              backgroundColor: "#1565c0",
              transform: "scale(1.05)", // Button hover effect
              transition: "all 0.2s ease-in-out"
            }
          }}
        >
          Send
        </Button>
      </Paper>

      {/* Powered By Section */}
      <PoweredBy />
    </Box>
  );
};

export default ChatBox;
