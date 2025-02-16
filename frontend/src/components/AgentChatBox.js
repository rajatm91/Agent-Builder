import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
  keyframes,
} from "@mui/material";
import MessageBubble from "./MessageBubble";
import useWebSocket from "../websocket/useWebSocket";
import { Send, Person } from "@mui/icons-material";

// Define a pulsating animation
const pulsate = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const AgentChatBox = ({ agent }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");

  const { socketMessages, sendSocketMessage } = useWebSocket("api/ws");
  const messagesEndRef = useRef(null);

  // Process WebSocket Messages and Update UI
  useEffect(() => {
    if (socketMessages.length > 0) {
      const lastMessage = socketMessages[socketMessages.length - 1];
      if (lastMessage?.type === "agent_response") {
        const messageContent = lastMessage?.data?.data?.content;

        if (messageContent) {
          setMessages((prev) => [
            ...prev,
            { text: messageContent, isUser: false },
          ]);

          if (messageContent.includes("TERMINATE")) {
            setLoading(false);
          }
        }
      }
    }
  }, [socketMessages]);

  // Auto-scroll when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      const typingMessages = agent?.name + " is typing...";
      setTypingMessage(typingMessages);
    } else {
      setTypingMessage("");
    }
  }, [loading]);

  // Send Message via WebSocket
  const handleSend = () => {
    if (message.trim()) {
      setMessages((prev) => [...prev, { text: message, isUser: true }]);

      const messageObject = {
        connection_id: "2",
        data: {
          connection_id: "2",
          content: message,
          role: "user",
          user_id: agent.user_id,
          session_id: 2,
          workflow_id: agent?.id,
          message_type: "user_message",
        },
        type: "user_message",
      };

      sendSocketMessage(messageObject);
      setMessage("");
      setLoading(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
        maxWidth: "100vw",
        borderRadius: 4,
      }}
    >
      {/* Chat Container */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          boxShadow: 2,
          borderRadius: 3,
          p: 3,
          height: "78vh",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            borderBottom: "1px solid #ddd",
            paddingBottom: 1,
            marginBottom: 2,
          }}
        >
          <Person color="primary" sx={{ marginRight: 1 }} /> {/* Agent Icon */}
          <Typography
            variant="h5"
            color="primary"
            sx={{
              fontWeight: 600,
              fontFamily: "Roboto, sans-serif",
              fontSize: "1.25rem",
              letterSpacing: 0.5,
            }}
          >
            Chat with {agent?.name}
          </Typography>
        </Box>

        {/* Messages Scrollable Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            paddingRight: 1,
            paddingBottom: 2,
            maxHeight: "calc(100% - 100px)",
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              {/* Pulsating Text Animation */}
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{
                  animation: `${pulsate} 1.5s infinite`,
                  fontWeight: 500,
                }}
              >
                Start chatting with {agent?.name}...
              </Typography>
            </Box>
          ) : (
            messages?.map((msg, index) => (
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
            <Typography variant="body2" color="textSecondary">
              {typingMessage}
            </Typography>
          </Box>
        )}

        {/* Chat Input */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            borderTop: "1px solid #ddd",
            backgroundColor: "#f9fafb",
            borderRadius: 2,
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
              borderRadius: 20,
              "& .MuiOutlinedInput-root": {
                borderRadius: 20,
                backgroundColor: "#ffffff",
                paddingRight: "8px",
              },
              "& .MuiInputBase-input": {
                padding: "10px",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            sx={{
              ml: 2,
              borderRadius: 20,
              height: "100%",
              padding: "10px 20px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#3d8bfd",
              },
            }}
          >
            <Send sx={{ marginRight: 1 }} /> {/* Send Icon */}
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AgentChatBox;