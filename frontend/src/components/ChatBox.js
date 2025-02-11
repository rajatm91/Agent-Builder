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
// import { Send, Mic, AttachFile } from "@mui/icons-material";

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
    let interval;
    if (loading) {
      const typingMessages = [
        "Please wait, processing your request...",
        "The system is generating a response...",
        "Please wait, gathering the information...",
        "Almost there, composing the answer..."
      ];
      let messageIndex = 0;
      interval = setInterval(() => {
        setTypingMessage(typingMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % typingMessages.length;
      }, 3000);
    } else {
      setTypingMessage(""); // Clear typing message when done
    }
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [loading]);

  // **Create Agent API Call**
  const createAgent = async (message) => {
    setLoading(true); // Show loading state while creating the agent
    try {            
      const response = await fetch('http://localhost:8081/api/create_agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message
        }),
      });

      const data = await response.json();    
      if (data?.availability === 'Available') {
        const agentDetails = {
          name: data?.name,
          documentPath: data?.documentPath,
          collection_name:data?.collection_name,
          model: data?.model,
          embedding_model:data?.embedding_model,
          reason: "Agent successfully created"
        };
        onCreateAgent(agentDetails);
        setMessages((prev) => [
          ...prev,
          { text: `Agent creation Successfully with name ${data?.name}.`, isUser: false }
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
            p: 2,
            borderTop: "1px solid #ddd",
            backgroundColor: "#ffffff"
          }}
        >
          <IconButton color="primary">
            {/* <Mic /> */}
          </IconButton>
          <IconButton color="primary">
            {/* <AttachFile /> */}
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
            // startIcon={<Send />}
            sx={{ ml: 2 }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBox;
