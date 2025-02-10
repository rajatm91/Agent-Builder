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
import { Send, Mic, AttachFile } from "@mui/icons-material";
import useWebSocket from "../websocket/useWebSocket";

const AgentChatBox = ({agent}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Track bot response status
  const [typingMessage, setTypingMessage] = useState(""); // State to hold the typing message

  const { socketMessages, sendSocketMessage } = useWebSocket("ws");
  const messagesEndRef = useRef(null);

  // **Process WebSocket Messages and Update UI**
  useEffect(() => {
    if (socketMessages.length > 0) {
      const lastMessage = socketMessages[socketMessages.length - 1];
      if (lastMessage?.content?.content) {
        setMessages((prev) => [
          ...prev,
          { text: lastMessage.content.content, isUser: false }
        ]);
        // setLoading(false); // Stop showing "Bot is typing..."
        if (lastMessage?.content?.content?.includes("TERMINATE")) {
          setLoading(false);
        }
        if (
          lastMessage?.content?.content?.includes(
            "has been successfully created"
          )
        ) {
          const contentText = lastMessage?.content?.content;

          // Extracting details using regex
          const nameMatch = contentText.match(/The retriever agent "(.*?)"/);
          const documentPathMatch = contentText.match(
            /indexing documents located at "(.*?)"/
          );
          const modelMatch = contentText.match(/using the "(.*?)" model/);

          // Constructing the object
          const agentDetails = {
            name: nameMatch ? nameMatch[1] : "",
            documentPath: documentPathMatch ? documentPathMatch[1] : "",
            modelName: modelMatch ? modelMatch[1] : "",
            reason: "Agent successfully created" // Static reason based on message pattern
          };
          
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
      setTypingMessage(""); // Clear typing message when done
    }

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [loading]);

  // **Send Message via WebSocket**
  const handleSend = () => {
    if (message.trim()) {
      setMessages((prev) => [...prev, { text: message, isUser: true }]);
      sendSocketMessage(message);
      setMessage("");
      setLoading(true); // Show "Bot is typing..."
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
                `Start chatting by typing a message to {agent?.type} ...`
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
            startIcon={<Send />}
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
