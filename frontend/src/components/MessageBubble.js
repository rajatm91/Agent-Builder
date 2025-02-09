import React from "react";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person"; // User icon
import SmartToyIcon from "@mui/icons-material/SmartToy"; // Bot icon

const MessageBubble = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isUser ? "flex-end" : "flex-start",
        my: 1
      }}
    >
      {/* Bot Icon (left) */}
      {!isUser && <SmartToyIcon sx={{ mr: 1, color: "blue" }} />}

      {/* Message Bubble */}
      <Typography
        sx={{
          padding: "8px 12px",
          borderRadius: "8px",
          backgroundColor: isUser ? "#DCF8C6" : "#E3E3E3",
          color: "#000",
          maxWidth: "60%",
          display: "inline-block"
        }}
      >
        {message}
      </Typography>

      {/* User Icon (right) */}
      {isUser && <PersonIcon sx={{ ml: 1, color: "green" }} />}
    </Box>
  );
};

export default MessageBubble;