import React from "react";
import { Box, Typography } from "@mui/material";
import { Person, SmartToy } from "@mui/icons-material";
import Markdown from "react-markdown";

const MessageBubble = ({ message, isUser }) => {
  const textMessage = message.replace(/\s*TERMINATE$/, "");
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2, // Increased margin for better spacing
        width: "100%"
      }}
    >
      {/* Bot Icon (Left Side) */}
      {!isUser && (
        <SmartToy
          sx={{
            mr: 1.5,
            color: "#1976d2",
            fontSize: "28px",
            backgroundColor: "#f0f4f9",
            borderRadius: "50%",
            padding: "6px"
          }}
        />
      )}

      {/* Message Bubble */}
      <Box
        sx={{
          backgroundColor: isUser ? "#1976d2" : "#f0f4f9",
          color: isUser ? "#fff" : "#000",
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", // Rounded corners based on user/bot
          maxWidth: "70%",
          wordBreak: "break-word",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
          transition: "transform 0.2s ease-in-out", // Smooth hover effect
          "&:hover": {
            transform: "scale(1.02)" // Slight zoom on hover
          }
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontSize: "14px",
            lineHeight: "1.5",
            fontWeight: isUser ? 500 : 400
          }}
        >
          <Markdown>{textMessage}</Markdown>
        </Typography>
      </Box>

      {/* User Icon (Right Side) */}
      {isUser && (
        <Person
          sx={{
            ml: 1.5,
            color: "#1976d2",
            fontSize: "28px",
            backgroundColor: "#f0f4f9",
            borderRadius: "50%",
            padding: "6px"
          }}
        />
      )}
    </Box>
  );
};

export default MessageBubble;
