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
import VoiceToText from "./VoiceToText";

// Define a pulsating animation
const pulsate = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const ChatBox = ({ onCreateAgent, uuid }) => {
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
          session_id: uuid,
          user_input: message
        })
      });

      const data = await response.json();

      if (data?.status === "further_question") {
        setMessages((prev) => [
          ...prev,
          {
            text: data?.content,
            isUser: false
          }
        ]);
      } else if (
        data?.status === "complete" &&
        data?.content?.availability === "Available"
      ) {
        const agentDetails = {
          name: data?.content?.name,
          documentPath: data?.content?.documentPath,
          collection_name: data?.content?.collection_name,
          model: data?.content?.model,
          embedding_model: data?.content?.embedding_model,
          reason: "Agent successfully created"
        };

        setMessages((prev) => [
          ...prev,
          {
            text: `Agent creation Successfully with name ${data?.content?.name}.`,
            isUser: false
          }
        ]);
        onCreateAgent(agentDetails);
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
        height: "100%",
        backgroundColor: "#f9fafb",
        borderRadius: 2,
        overflow: "hidden"
      }}
    >
      {/* Chat Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden"
        }}
      >
        {/* Messages Scrollable Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            padding: 2,
            backgroundColor: "#ffffff",
            borderRadius: 2,
            margin: 1,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            maxHeight: "calc(100vh - 220px)"
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
              {/* Pulsating Text Animation */}
              <Typography
                variant="h6"
                color="textSecondary"
                sx={{
                  animation: `${pulsate} 1.5s infinite`,
                  fontWeight: 500
                }}
              >
                Type below to start the conversation...
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginTop: 1,
              paddingLeft: 2
            }}
          >
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
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderTop: "1px solid #ddd",
            backgroundColor: "#ffffff",
            boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: 0
          }}
        >
          <VoiceToText onInputChange = {(text)=>setMessage(text)}/>
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
                "& fieldset": {
                  borderColor: "#ddd"
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2"
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
              textTransform: "none",
              padding: "8px 16px",
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#1565c0"
              }
            }}
          >
            Send
          </Button>
        </Paper>
      </Box>

      {/* Powered By Section */}
      <PoweredBy />
    </Box>
  );
};

export default ChatBox;
