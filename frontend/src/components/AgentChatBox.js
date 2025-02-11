import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,  
  CircularProgress
} from "@mui/material";
import MessageBubble from "./MessageBubble";
import useWebSocket from "../websocket/useWebSocket";

const AgentChatBox = ({ agent }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [typingMessage, setTypingMessage] = useState("");

  const { socketMessages, sendSocketMessage } = useWebSocket("api/ws");
  const messagesEndRef = useRef(null);

  // **Process WebSocket Messages and Update UI**
  useEffect(() => {
    if (socketMessages.length > 0) {
      const lastMessage = socketMessages[socketMessages.length - 1];
      if (lastMessage?.type === "agent_response") {
        const messageContent = lastMessage?.data?.data?.content;
        
        if (messageContent) {
          setMessages((prev) => [
            ...prev,
            { text: messageContent, isUser: false }
          ]);

          if (messageContent.includes("TERMINATE")) {
            setLoading(false);
          }
        }
      }
    }
  }, [socketMessages]);

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
        "please wait, gathering the information...",
        "Almost there, composing the answer..."
      ];
      let messageIndex = 0;
      interval = setInterval(() => {
        setTypingMessage(typingMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % typingMessages.length;
      }, 3000);
    } else {
      setTypingMessage(""); 
    }

    return () => clearInterval(interval);
  }, [loading]);

  // **Send Message via WebSocket**
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
          message_type: "user_message"
        },
        type: "user_message"
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
        width: "98%",
        maxWidth: "90vw",
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
          height: "60vh",
          overflow: "hidden"
        }}
      >
        {/* Messages Scrollable Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            paddingRight: 1,
            maxHeight: "calc(100% - 60px)"
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
                `Start chatting by typing a message to {agent?.name} ...`
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
            p: 2,
            borderTop: "1px solid #ddd",
            backgroundColor: "#ffffff"
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
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentChatBox;
