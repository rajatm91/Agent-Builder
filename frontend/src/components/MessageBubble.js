import React from "react";
import { Box, Typography } from "@mui/material";
import { Person, SmartToy } from "@mui/icons-material";

const formatBotMessage = (message) => {
  return message
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>"); 
};

const MessageBubble = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
        width: "100%",
        animation: "fadeIn 0.3s ease-in-out", // Smooth fade-in effect
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(5px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Bot Icon (Left Side) */}
      {!isUser && (
        <SmartToy
          sx={{
            mr: 1.5,
            color: "#1976d2",
            fontSize: "28px",
            backgroundColor: "#e3f2fd",
            borderRadius: "50%",
            padding: "6px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        />
      )}

      {/* Message Bubble */}
      <Box
        sx={{
          backgroundColor: isUser ? "#1976D264" : "#DBDFE4FF",
          color: isUser ? "#fff" : "#333",
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          maxWidth: "70%",
          wordBreak: "break-word",
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        {isUser ? (
          <Typography
            variant="body1"
            sx={{
              fontSize: "14px",
              lineHeight: "1.5",
              fontWeight: 500,
              color: "#333",
            }}
          >
            {message}
          </Typography>
        ) : (
          <Typography
            variant="body1"
            sx={{
              fontSize: "14px",
              lineHeight: "1.5",
              fontWeight: 400,
            }}
            dangerouslySetInnerHTML={{ __html: formatBotMessage(message) }}
          />
        )}
      </Box>

      {/* User Icon (Right Side) */}
      {isUser && (
        <Person
          sx={{
            ml: 1.5,
            color: "#1976d2",
            fontSize: "28px",
            backgroundColor: "#e3f2fd",
            borderRadius: "50%",
            padding: "6px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        />
      )}
    </Box>
  );
};

export default MessageBubble;